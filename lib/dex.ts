// next-app/lib/dex.ts
import axios from "axios";

export type Route = {
  id: string;
  dex: string;
  path: string[]; // e.g. ["HBAR", "0.0.12345", "USDC"]
  estimatedOut: string; // string to preserve precision
  slippage: number; // percent
  fee: number; // percent or fixed display
  meta?: any;
};

const SAUCER_TEST_API =
  process.env.SAUCER_TEST_API || "https://test-api.saucerswap.finance";
const SAUCER_API_KEY = process.env.SAUCER_API_KEY || "";

function parseSimpleQuery(query: string) {
  const m = query.match(/([0-9]+\.?[0-9]*)\s*(HBAR|USDC|[A-Z]{2,6})/i);
  const amount = m ? parseFloat(m[1]) : 1;
  const from = /HBAR/i.test(query) ? "HBAR" : "HBAR";
  const to = /USDC/i.test(query) ? "USDC" : "USDC";
  return { amount, from, to };
}

/**
 * getSwapRoutes
 * - Primary: call SaucerSwap test API for quotes
 * - Fallback: generate deterministic mock routes
 */
export async function getSwapRoutes(
  fromToken: string,
  toToken: string,
  amount: number
): Promise<{ amount: number; from: string; to: string; routes: Route[] }> {
  if (!fromToken && typeof toToken === "undefined") {
    const parsed = parseSimpleQuery(String((arguments as any)[0] || ""));
    return getSwapRoutes(parsed.from, parsed.to, parsed.amount);
  }

  let routes: Route[] = [];

  try {
    const quoteUrl = `${SAUCER_TEST_API}/swap/quote`;
    const resp = await axios.post(
      quoteUrl,
      { fromToken, toToken, amount },
      { headers: SAUCER_API_KEY ? { "x-api-key": SAUCER_API_KEY } : undefined, timeout: 8000 }
    );

    if (resp?.data) {
      const apiRoutes = Array.isArray(resp.data.routes) ? resp.data.routes : [resp.data];
      routes = apiRoutes.map((r: any, i: number) => ({
        id: r.id ?? `saucer-${i}`,
        dex: "SaucerSwap",
        path: r.path ?? [fromToken, toToken],
        estimatedOut: (r.estimatedOut ?? r.output ?? r.out ?? amount * (r.rate ?? 0.98)).toString(),
        slippage: r.slippage ?? r.slippagePercent ?? 1.0,
        fee: r.fee ?? 0.3,
        meta: r.meta ?? {},
      }));
    }
  } catch (e: any) {
    console.warn("Saucer API quote failed, falling back:", e.message ?? e.toString());
  }

  // Always include fallback for hackathon demo
  const fallbackRoutes: Route[] = [
    {
      id: "saucerswap-fallback",
      dex: "SaucerSwap",
      path: [fromToken, "WHBAR", toToken],
      estimatedOut: (amount * 0.98).toFixed(6),
      slippage: 1.5,
      fee: 0.3,
    },
    {
      id: "mockdex2-fallback",
      dex: "MockDEX2",
      path: [fromToken, toToken],
      estimatedOut: (amount * 0.985).toFixed(6),
      slippage: 1.2,
      fee: 0.25,
    },
  ];

  // Merge real + fallback, ensure always array
  routes = [...routes, ...fallbackRoutes];

  return { amount, from: fromToken, to: toToken, routes };
}
