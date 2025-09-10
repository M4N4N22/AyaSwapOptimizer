// next-app/lib/comput3.ts
import axios from "axios";
import type { Route } from "./dex";

const COMPUT3_ENDPOINT = process.env.COMPUT3_API_ENDPOINT || "";
const COMPUT3_KEY = process.env.COMPUT3_API_KEY || "";

/**
 * runOptimization:
 * - Accepts payload with .routes (array of Route)
 * - If COMPUT3 is available, pick best via LLM
 * - Always has deterministic fallback for hackathon/demo
 */
export async function runOptimization(payload: {
  amount: number;
  from: string;
  to: string;
  routes: Route[];
}) {
  const { routes } = payload;

  if (!routes || !Array.isArray(routes) || routes.length === 0) {
    // Provide a mock fallback route for demo
    const mockRoute: Route = {
      id: "mock-fallback",
      dex: "MockDEX",
      path: [payload.from, payload.to],
      estimatedOut: (payload.amount * 0.95).toFixed(6),
      slippage: 1.5,
      fee: 0.25,
    };
    const reasons = [, "low slippage route"];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    return { best: mockRoute, reason };
  }

  // If Comput3 not configured, pick highest estimatedOut deterministically
  if (!COMPUT3_ENDPOINT || !COMPUT3_KEY) {
    const best = routes.reduce((a, b) =>
      parseFloat(b.estimatedOut) > parseFloat(a.estimatedOut) ? b : a
    );
    return { best, reason: "fallback_deterministic" };
  }

  // Compose prompt for Comput3
  const prompt = `
You are a swap optimizer. Given candidate routes, pick the best route for the user,
prioritizing estimatedOut, then slippage (lower better), then fee (lower better).
Return JSON: {"choiceIndex": <index>, "best": <route object>, "rationale": "<reason>"}

Routes: ${JSON.stringify(routes)}
  `.trim();

  try {
    const resp = await axios.post(
      COMPUT3_ENDPOINT,
      { prompt, max_tokens: 400 },
      {
        headers: {
          Authorization: `Bearer ${COMPUT3_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    let output: any = resp.data?.output ?? resp.data?.result ?? resp.data;
    let parsed: any;

    if (typeof output === "string") {
      try {
        parsed = JSON.parse(output);
      } catch {
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      }
    } else {
      parsed = output;
    }

    if (parsed && parsed.best) {
      return {
        best: parsed.best,
        choiceIndex: parsed.choiceIndex ?? null,
        reason: parsed.rationale ?? "comput3",
      };
    }

    // fallback deterministic if parsing fails
    const best = routes.reduce((a, b) =>
      parseFloat(b.estimatedOut) > parseFloat(a.estimatedOut) ? b : a
    );
    return { best, reason: "comput3_parse_fallback" };
  } catch (err: any) {
    console.warn(
      "Comput3 optimization failure:",
      err.message ?? err.toString()
    );
    // deterministic fallback
    const best = routes.reduce((a, b) =>
      parseFloat(b.estimatedOut) > parseFloat(a.estimatedOut) ? b : a
    );
    // also add a mock fallback route for hackathon UI
    const mockRoute: Route = {
      id: "mock-fallback",
      dex: "MockDEX",
      path: [payload.from, payload.to],
      estimatedOut: (payload.amount * 0.95).toFixed(6),
      slippage: 1.5,
      fee: 0.25,
    };
    return {
      best: mockRoute,
      reason: "comput3_error_fallback_with_mock",
      error: err.message ?? String(err),
    };
  }
}
