/**
 * Returns mocked DEX route suggestions given a natural language query.
 * For hackathon speed we return two simulated routes with price/slippage/fee.
 */

export function parseQuery(query: string) {
  // super-simple parser — extract numbers and tokens
  const m = query.match(/([0-9]+\.?[0-9]*)\s*(HBAR|USDC|HBAR)/i);
  const amount = m ? parseFloat(m[1]) : 1;
  const from = /HBAR/i.test(query) ? "HBAR" : "HBAR";
  const to = /USDC/i.test(query) ? "USDC" : "USDC";
  return { amount, from, to };
}

export function getMockRoutes(query: string) {
  const { amount, from, to } = parseQuery(query);
  // Simulated routes
  const routes = [
    {
      id: "saucerswap",
      dex: "SaucerSwap",
      estimatedOut: (amount * 0.98).toFixed(6),
      slippage: 1.5,
      fee: 0.3,
    },
    {
      id: "mockdex2",
      dex: "MockDEX2",
      estimatedOut: (amount * 0.985).toFixed(6),
      slippage: 1.2,
      fee: 0.25,
    },
  ];
  return { amount, from, to, routes };
}
