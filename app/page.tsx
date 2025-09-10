"use client";
import { useState } from "react";

type Route = {
  id: string;
  dex: string;
  path: (string | null)[];
  estimatedOut: string;
  slippage: number;
  fee: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [log, setLog] = useState<any[]>([]);

  const addLog = (entry: any) => setLog((s) => [entry, ...s]);

  const run = async () => {
    if (!query)
      return addLog({ type: "info", message: "Type: Swap 10 HBAR to USDC" });
    addLog({ type: "info", message: `Running: ${query}` });

    try {
      // 1) Get routes
      const r1 = await fetch("/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: "get_swap_routes", arguments: { query } }),
      });
      const routes = await r1.json();
      addLog({ type: "routes", data: routes });

      // 2) Optimize
      const r2 = await fetch("/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: "optimize_swap", arguments: { routes } }),
      });
      const best = await r2.json();
      addLog({ type: "best", data: best });

      // 3) Execute
      const r3 = await fetch("/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: "execute_swap", arguments: { best } }),
      });
      const exec = await r3.json();
      addLog({ type: "executed", data: exec });
    } catch (e: any) {
      addLog({ type: "error", message: e.message });
    }
  };

  const renderLog = (entry: any, i: number) => {
    switch (entry.type) {
      case "info":
        return (
          <div key={i} className="p-2 bg-zinc-900 rounded text-sm">
            {entry.message}
          </div>
        );

      case "routes":
        return (
          <div key={i} className="p-2 bg-zinc-800 rounded text-sm">
            <div className="font-semibold">Available Routes (Demo Data)</div>
            {entry.data.routes.map((r: Route) => (
              <div key={r.id} className="ml-2 border-b border-zinc-700 py-1">
                <span className="font-bold">{r.dex}</span>:{" "}
                {r.path.filter(Boolean).join(" → ")} | Est Out: {r.estimatedOut}{" "}
                | Slippage: {r.slippage}% | Fee: {r.fee}%
              </div>
            ))}
          </div>
        );

      case "best":
        const r: Route = entry.data.best;
        return (
          <div key={i} className="p-2 bg-green-700 rounded text-white text-sm">
            <div className="font-semibold">Best Route Selected:</div>
            <div>
              {r.dex}: {r.path.filter(Boolean).join(" → ")} | Est Out:{" "}
              {r.estimatedOut} | Slippage: {r.slippage}% | Fee: {r.fee}%
            </div>
            <div className="text-xs italic">Reason: {entry.data.reason}</div>
            <div className="text-xs mt-1 italic">
              ⚠️ For hackathon demo only — real optimization pipeline is
              implemented.
              <a
                href="https://github.com/your-github-repo"
                className="underline ml-1"
                target="_blank"
              >
                View GitHub
              </a>
            </div>
          </div>
        );

      case "executed":
        return (
          <div key={i} className="p-2 bg-blue-700 rounded text-white text-sm">
            <div className="font-semibold">Executed Swap:</div>
            <div>Status: {entry.data.status}</div>
            <div>TxID: {entry.data.receipt.transactionId}</div>
            <div>
              Timestamp:{" "}
              {new Date(entry.data.receipt.timestamp).toLocaleString()}
            </div>
          </div>
        );

      case "error":
        return (
          <div key={i} className="p-2 bg-red-700 rounded text-white text-sm">
            Error: {entry.message}
          </div>
        );

      default:
        return (
          <div key={i} className="p-2 bg-zinc-900 rounded text-sm">
            {JSON.stringify(entry)}
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start gap-8 p-8 bg-zinc-950 text-white">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center">
        Aya Swap Optimizer — Hackathon Demo
      </h1>

      {/* Description */}
      <div className="text-center max-w-xl space-y-3">
        <p className="text-sm text-zinc-400">
          This demo simulates swap optimization for <strong>HBAR ↔ USDC</strong>
          . The real pipeline is fully implemented with live routes and
          intelligent optimization using Comput3 / Hedera integration. ⚠️ For
          hackathon purposes, the results here are demo data.
        </p>

        <p className="text-sm text-zinc-400">
          <strong>Use Case:</strong> This MCP allows Aya Wallet users to find
          the best swap routes across decentralized exchanges, optimizing for
          maximum output, minimal slippage, and lowest fees. It demonstrates how
          AI can enhance DeFi usability and provide secure, efficient swaps
          directly within the wallet interface.
        </p>

        <p className="text-sm text-blue-400">
          <a
            href="https://github.com/M4N4N22/AyaSwapOptimizer"
            target="_blank"
            className="underline"
          >
            View Real Pipeline on GitHub
          </a>
        </p>
      </div>

      {/* Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Swap 10 HBAR to USDC"
        className="p-3 border rounded w-full max-w-xl bg-zinc-900 text-white placeholder-zinc-500"
      />

      {/* Button */}
      <div className="flex gap-2">
        <button
          disabled={!query}
          onClick={run}
          className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition"
        >
          Run Optimizer
        </button>
      </div>

      {/* Activity Log */}
      <div className="w-full max-w-xl mt-6">
        <h3 className="font-semibold text-lg border-b border-zinc-700 pb-1">
          Activity Log
        </h3>
        <div className="flex flex-col gap-2 mt-3">{log.map(renderLog)}</div>
      </div>
    </main>
  );
}
