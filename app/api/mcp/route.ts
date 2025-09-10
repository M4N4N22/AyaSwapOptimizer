// app/api/mcp/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSwapRoutes } from "@/lib/dex"; // ✅ now points to real dex.ts
import { runOptimization } from "@/lib/comput3"; // ✅ real optimizer
import { executeOnHedera } from "@/lib/executors/hedera";
import { logToHedera } from "@/lib/logger/hederaLogger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, arguments: args } = body;

    if (tool === "get_swap_routes") {
      const { fromToken, toToken, amount } = args;
      const routes = await getSwapRoutes(fromToken, toToken, amount);
      return NextResponse.json(routes);
    }

    if (tool === "optimize_swap") {
      // args.routes should be the Route[] returned from getSwapRoutes
      const { routes, amount, from, to } = args;
      const best = await runOptimization({ routes, amount, from, to });
      return NextResponse.json(best);
    }

    if (tool === "execute_swap") {
      const { best } = args;
      // executeOnHedera should either simulate or hit SaucerSwap’s router
      const receipt = await executeOnHedera(best);
      await logToHedera({ action: "execute_swap", best, receipt });
      return NextResponse.json({ status: "executed", receipt });
    }

    return NextResponse.json({ error: "unknown tool" }, { status: 400 });
  } catch (err: any) {
    console.error("Swap optimizer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
