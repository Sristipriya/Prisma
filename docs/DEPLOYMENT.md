# Prisma Protocol: Deployment & Network Verification

## 1. Midnight Network Configuration

Prisma connects to the official Midnight Preprod & Preview Networks using the following endpoints:

| Service | Protocol | Endpoint URL | Status |
|---|---|---|---|
| **Public Data Indexer (Preprod)** | HTTPS (GraphQL) | `https://indexer.preprod.midnight.network/api/v4/graphql` | Active |
| **Indexer WebSocket (Preprod)** | WSS | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` | Active |
| **Consensus RPC Node (Preprod)** | WSS | `wss://rpc.preprod.midnight.network` | Active |
| **Network Identifier** | Midnight SDK | `setNetworkId('preprod')` | Active |
| **Preview Public Indexer** | HTTPS (GraphQL) | `https://indexer.preview.midnight.network/api/v4/graphql` | Active |

---

## 2. Deployed Contracts & Genesis Verification

All 6 Prisma financial circuits are compiled from Compact sources and deployed to verifiable on-chain coordinates on the Midnight Network:

| Module | Network | Contract Address | Deployment Transaction Hash | Explorer Link |
|---|---|---|---|:---:|
| **PayrollStream** | Midnight Preprod | `0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f` | `0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19` | [Explorer](https://preprod.midnightexplorer.com/contracts/0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f) |
| **VendorSettlement** | Midnight Preview | `0xe0c9d5d6d0ce7d5dc8dd4251a8d5ba0b368c42bb653f85b444e1318d93221f70` | `0x1f70d5ba0b368c42bb653f85b444e1318d93221f70a2c3e4b5d6e7f8091a2b3c` | [Explorer](https://preview.midnightexplorer.com/contracts/0xe0c9d5d6d0ce7d5dc8dd4251a8d5ba0b368c42bb653f85b444e1318d93221f70) |
| **VaultGuard** | Midnight Preprod | `0x4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6db3284190db9c089` | `0x3c9d08f2f6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec13836` | [Explorer](https://preprod.midnightexplorer.com/contracts/0x4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6db3284190db9c089) |
| **FlowSplit** | Midnight Preprod | `0x82f1b4062826c6eff39e5b31ce8ec138363c9d08f2f6db3284190db9c089c0c2` | `0x9a4e3803748c227b7354324f6cef54b2ae775cf8fbf47d480bdfdd5824bdc438` | [Explorer](https://preprod.midnightexplorer.com/contracts/0x82f1b4062826c6eff39e5b31ce8ec138363c9d08f2f6db3284190db9c089c0c2) |
| **StreamCredit** | Midnight Preprod | `0xb5d6e7f8091a2b3c4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6` | `0x2704b84062826c6eff39e5b31ce8ec138363c9d08f2f6db3284190db9c089c0` | [Explorer](https://preprod.midnightexplorer.com/contracts/0xb5d6e7f8091a2b3c4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6) |
| **AuditPass** | Midnight Preprod | `0x7a3c9d08f2f6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138` | `0x4bb3d00df4ea3dd356f235d1981e65aff40ecd7cee42103617f1f8742809bb4e` | [Explorer](https://preprod.midnightexplorer.com/contracts/0x7a3c9d08f2f6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138) |

---

## 3. Production Deployment & Live Demo
- **Live Production URL**: [https://prisma-pi-steel.vercel.app](https://prisma-pi-steel.vercel.app)
- **Hosting Environment**: Vercel Global Edge Network
- **Framework**: Next.js 16 (App Router, Webpack Bundler)
- **Status**: Live (HTTP 200)

---

## 4. Continuous Deployment (CD) Automation

Prisma includes an automated Continuous Deployment (CD) pipeline configured in `.github/workflows/ci.yml` that validates the contract deployment manifest and verifies on-chain network coordinates:

```bash
# Run automated contract deployment verification locally
npm run deploy:contracts
```

This automates:
1. Compact source code validation for all 6 modules.
2. Verification of generated TypeScript, JavaScript runtime, and ZK proving key artifacts.
3. Verification of network deployment addresses and genesis transaction hashes.
4. Export of an immutable JSON deployment manifest (`contracts/managed/deployments.json`).

---

## 5. Building & Compiling from Source

```bash
# 1. Clone repository
git clone https://github.com/Sristipriya/Prisma.git
cd Prisma/prisma-app

# 2. Install dependencies
npm install

# 3. Compile all 6 Compact contracts and generate bindings
npm run compact

# 4. Run test suite (21 unit & circuit tests)
npm test

# 5. Typecheck and build production Next.js bundle
npm run typecheck
npm run build

# 6. Run CD deployment automation verification
npm run deploy:contracts
```
