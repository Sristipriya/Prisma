# Prisma Protocol: Deployment & Network Verification

## 1. Midnight Preprod Network Configuration

Prisma connects to the official Midnight Preprod Network using the following endpoints:

| Service | Protocol | Endpoint URL | Status |
|---|---|---|---|
| **Public Data Indexer** | HTTPS (GraphQL) | `https://indexer.preprod.midnight.network/api/v4/graphql` | Active |
| **Indexer WebSocket** | WSS | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` | Active |
| **Consensus RPC Node** | WSS | `wss://rpc.preprod.midnight.network` | Active |
| **Network Identifier** | Midnight SDK | `setNetworkId('preprod')` | Active |

---

## 2. Deployed Contracts & Genesis Verification

### PayrollStream Core Contract
- **Contract Address (No 0x prefix)**: `6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`
- **Contract Address (0x format)**: `0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`
- **Explorer URL**: [https://preprod.midnightexplorer.com/contracts/6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f](https://preprod.midnightexplorer.com/contracts/6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f)

### Verified Genesis Proof & Transaction Hash
- **Deployment Transaction Hash**: `0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19`
- **Explorer URL**: [https://preprod.midnightexplorer.com/transactions/0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19](https://preprod.midnightexplorer.com/transactions/0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19)
- **Status**: Finalized by Midnight Preprod Consensus

---

## 3. Production Deployment & Live Demo
- **Live Production URL**: [https://prisma-pi-steel.vercel.app](https://prisma-pi-steel.vercel.app)
- **Hosting Environment**: Vercel Global Edge Network
- **Framework**: Next.js 16 (App Router, Webpack Bundler)
- **Status**: Live (HTTP 200)

---

## 4. Building & Compiling from Source

```bash
# 1. Clone repository
git clone https://github.com/Sristipriya/Prisma.git
cd Prisma/prisma-app

# 2. Install dependencies
npm install

# 3. Compile all 6 Compact contracts and generate bindings
npm run compact

# 4. Run test suite
npm test

# 5. Typecheck and build production Next.js bundle
npm run typecheck
npm run build
```
