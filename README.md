# Aya Swap Optimizer — Hackathon Demo

**Aya Swap Optimizer** is a Model Context Protocol (MCP) powered swap optimization pipeline for **HBAR ↔ USDC**. It demonstrates how a wallet can intelligently select the best swap routes across decentralized exchanges using a combination of **real DEX APIs, Hedera integration, and Comput3 AI optimization**.

⚠️ **Note:** This demo uses simulated data for hackathon purposes, but the full pipeline is implemented and ready for production.

[View Real Pipeline on GitHub](https://github.com/your-github-repo)

---

## 🛠 Features / Use Case

- MCP-first design for seamless wallet integration
- Fetches swap routes from **SaucerSwap** (or other DEXs) for a given token pair and amount
- Optimizes swap using **Comput3** AI to pick the route with maximum output, minimal slippage, and lowest fees
- Executes swaps via **Hedera** and logs results for audit and activity tracking
- Provides a demo frontend to visualize available routes, selected best route, and executed swaps
- Demonstrates how AI can enhance DeFi usability directly within a wallet interface

**Use Case:** Aya Wallet users can query the MCP to get the best swap route for a token pair, optionally execute it, and display human-readable logs — all automatically, without manually comparing DEX quotes.

---

## 🗂 Folder Structure

```
next-app/
├─ app/
│  ├─ api/
│  │  └─ mcp/                # MCP endpoint for swap optimization
│  │     └─ route.ts
│  └─ page.tsx               # Demo frontend
├─ lib/
│  ├─ dex.ts                 # Swap routes fetching from DEX / mock fallback
│  ├─ comput3.ts             # Swap optimizer (Comput3 integration)
│  ├─ executors/
│  │  └─ hedera.ts           # Swap execution logic on Hedera
│  └─ logger/
│     └─ hederaLogger.ts     # Logging executed swaps to Hedera
├─ package.json
└─ tsconfig.json
```

---

## ⚡ MCP Endpoints

All requests are **POST** to `/api/mcp` with JSON payload:

### 1. `get_swap_routes`
Fetch available swap routes for a given token pair.

```json
{
  "tool": "get_swap_routes",
  "arguments": {
    "fromToken": "HBAR",
    "toToken": "USDC",
    "amount": 10
  }
}
```

**Response:**
```json
{
  "amount": 10,
  "from": "HBAR",
  "to": "USDC",
  "routes": [
    {
      "id": "saucerswap-fallback",
      "dex": "SaucerSwap",
      "path": ["HBAR","WHBAR","USDC"],
      "estimatedOut": "9.8",
      "slippage": 1.5,
      "fee": 0.3
    }
  ]
}
```

### 2. `optimize_swap`
Selects the best route using Comput3 AI or fallback deterministic logic.

```json
{
  "tool": "optimize_swap",
  "arguments": {
    "routes": { ...response_from_get_swap_routes }
  }
}
```

**Response:**
```json
{
  "best": { ...selected_route },
  "reason": "comput3" // or "fallback_deterministic" / "mock_fallback_no_routes"
}
```

### 3. `execute_swap`
Executes the selected route on Hedera and logs activity.

```json
{
  "tool": "execute_swap",
  "arguments": {
    "best": { ...selected_route }
  }
}
```

**Response:**
```json
{
  "status": "executed",
  "receipt": {
    "transactionId": "0.0.281196",
    "status": "SUCCESS",
    "amountOut": 9.8,
    "timestamp": "2025-09-10T13:19:41.225Z"
  }
}
```

---

## 🔗 Integrations

- **Hedera**: Executes swaps and logs activity on-chain, providing transparency and traceability
- **Comput3**: AI-based optimizer that evaluates routes and selects the best one based on output, slippage, and fees
- **SaucerSwap** (or other DEXs): Provides live quotes for token swaps
- **Fallback / Mock**: Ensures the demo works even if DEX API fails or for hackathon simulations

---

## 🚀 Running the Demo

```bash
# Install dependencies
pnpm install

# Run Next.js dev server
pnpm dev
```

1. Open http://localhost:3000
2. Enter a query like: "Swap 10 HBAR to USDC"
3. Click "Run Optimizer"
4. View activity log: routes, best selection, executed swap

---

## 💡 Notes

- Demo data is used for hackathon purposes; the real backend pipeline is fully functional and integrated with Hedera and Comput3
- The MCP design allows Aya Wallet to integrate it seamlessly as an AI-powered swap assistant without needing Next.js specifics
- Frontend logs are human-readable and mimic the UX of popular DEX UIs like SushiSwap or PancakeSwap

---

## 📄 License

MIT
