<div align="center">
  <img src="./Screenshot/landing-page.png" alt="Prisma Landing Page" width="100%">
  <br>
  
  <i>Empowering enterprise payroll and vendor settlements with zero-knowledge privacy on Midnight.</i>
  <br><br>
  
  # Prisma: Zero-Knowledge Payroll & Shielded Settlement Layer
  
  **Enterprise-grade cryptographic privacy and streaming payroll on Midnight Network.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Midnight Network](https://img.shields.io/badge/Midnight-Preprod-blueviolet)](https://midnight.network/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![CI/CD](https://img.shields.io/badge/CI%2FCD-Passing-success)](https://github.com/Sristipriya/Prisma/actions)
  [![Status](https://img.shields.io/badge/Status-Live-success)](#)
  
  ### 🌐 [Live Application Demo](https://prisma-midnight.vercel.app) | 📹 [1-Minute Video Demo](https://youtu.be/demo-prisma-midnight)
</div>

---

## 📜 Deployed Smart Contract Addresses

| Network | Contract Module | Deployed Contract Address | Explorer Verification | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **Midnight Preprod** | `PayrollStream` | `0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f) | `VERIFIED` |
| **Midnight Preprod** | `VendorSettlement` | `6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f) | `VERIFIED` |
| **Midnight Preview** | `Ghost / Payroll Engine` | `e0c9d5d6d0ce7d5dc8dd4251a8d5ba0b368c42bb653f85b444e1318d93221f70` | [View on Preview Explorer](https://preview.midnightexplorer.com/contracts/e0c9d5d6d0ce7d5dc8dd4251a8d5ba0b368c42bb653f85b444e1318d93221f70) | `VERIFIED` |

---

## 💡 Initial Product Idea & Vision

**Prisma** is a decentralized, privacy-first financial streaming and B2B vendor settlement layer built natively on the **Midnight Privacy Blockchain**. It allows corporations to stream salaries in real-time and settle commercial invoices with absolute confidentiality. By leveraging client-side Zero-Knowledge (ZK) proofs, Prisma mathematically proves that payroll constraints and invoice spending limits are strictly enforced, while keeping employee compensation, recipient identities, and corporate treasury balances completely shielded from public ledger surveillance.

---

## 🚨 The Real-World Problem

As enterprise finance transitions to decentralized rails, organizations face an insurmountable barrier: **Public blockchains expose confidential financial operations to the entire world.**

When an organization conducts payroll or settles vendor invoices on traditional public blockchains (such as Ethereum or Solana):
1. **The Salary Privacy Dilemma:** Every employee's compensation, bonus structure, and withdrawal frequency is permanently broadcasted. Coworkers, competitors, and predatory recruiters can inspect exact wallet balances and salary figures.
2. **The B2B Supply Chain Leak:** When a corporation pays suppliers, contractors, or software vendors on-chain, their negotiated pricing tiers, invoice volumes, and vendor networks are exposed to competitors and MEV searchers.
3. **The Centralization Trap:** Traditional off-chain payroll solutions (e.g., centralized SQL databases) maintain privacy only by requiring complete trust in central custodians, suffering from single-point-of-failure data breaches, and lacking automated non-custodial execution.

---

## 🛡️ Privacy Model: Public Ledger State vs. Private Witness

Midnight's dual-state architecture divides computation into **Public Ledger State** (verified by network consensus) and **Private Witness State** (computed locally on the user's device inside Zero-Knowledge circuits).

### What an Observer CAN vs. CANNOT Learn

| Data Attribute | On Public Blockchains (e.g. Ethereum) | On Prisma (Midnight ZK Privacy Model) | Classification |
| :--- | :--- | :--- | :--- |
| **Transaction Existence** | Visible to all | Visible (Public timestamp & proof validity) | **Public State** |
| **Contract Address** | Visible to all | Visible (`0x6db328...`) | **Public State** |
| **ZK Proof Validity** | N/A | Mathematically verified by consensus | **Public State** |
| **State Nullifier / Anchor** | Visible | Cryptographic commitment (prevents double-spend) | **Public State** |
| **Employee Identity** | Fully Exposed (Public address) | **Shielded (Zero-Knowledge Private Witness)** | **Private Witness** |
| **Salary / Withdrawal Amount** | Fully Exposed (Exact token sum) | **Shielded (Private numerical witness input)** | **Private Witness** |
| **Total Treasury Balance** | Fully Exposed (Inspectable balance) | **Shielded (Protected by local cryptographic state)** | **Private Witness** |
| **Vendor Identity & Line Items**| Fully Exposed (Invoice details) | **Shielded (Client-side circuit constraint)** | **Private Witness** |

### Observable Privacy Claim & Cryptographic Guarantees
1. **Client-Side Proof Execution:** The worker's 1AM wallet generates a Zero-Knowledge proof locally in the browser using the Midnight Proof Server (`http://127.0.0.1:6300`). The raw private inputs (the worker's unshielded address, accrued allowance, and withdrawal amount) never leave the local environment.
2. **Mathematical Bound Enforcement:** The Compact circuit proves that `withdrawn_amount <= max_spending_limit` and transitions the ledger state without disclosing what `withdrawn_amount` or `max_spending_limit` actually are.
3. **Consensus-Layer Verification:** The Midnight Preprod network verifies the generated ZK SNARK. If the proof is mathematically sound, the payout is approved; if any constraint is violated, the transaction is rejected at the protocol layer.

---

## 📸 Comprehensive Platform Gallery & Screenshots

Here is the complete showcase of all components of the Prisma platform, from UI dashboard and real-time streaming to zero-knowledge contract verification and developer tooling.

### 1. Central Employer Dashboard
*Monitor organization treasury, active payroll streams, and ZK proof generation metrics in real-time off-chain.*
<img src="./Screenshot/Dashboard.png" alt="Dashboard" width="100%" />

### 2. Real-Time Worker Earnings Portal
*Workers watch their salary stream second-by-second and execute zero-knowledge withdrawals directly to their 1AM wallet.*
<img src="./Screenshot/worker-dashboard.png" alt="Worker Dashboard" width="100%" />

### 3. In-App Payroll Contract Deployment
*Deploy shielded payroll contracts directly from the UI to the Midnight network with custom spending constraints.*
<img src="./Screenshot/payroll-contract.png" alt="Payroll Contract Deployment" width="100%" />

### 4. Shielded Vendor Settlement Layer
*Execute confidential B2B vendor settlements with verifiable proof of payment without disclosing invoice metadata.*
<img src="./Screenshot/vendor-invoice.png" alt="Vendor Invoice Settlement" width="100%" />
<img src="./Screenshot/vendor-contract.png" alt="Vendor Contract Deployment" width="100%" />

### 5. Client-Side Circuit Execution & Proof Verification
*Zero-Knowledge proofs are generated and verified entirely locally in the browser before being broadcasted.*
<img src="./Screenshot/proof-verification.png" alt="Proof Verification" width="100%" />

### 6. Zero-Knowledge Analytics & Circuit Health
*Real-time visibility into client-side proving times, circuit execution throughput, and shielded balance states.*
<img src="./Screenshot/zk-analysis.png" alt="ZK Analysis" width="100%" />

---

## 🔗 Verified On-Chain Transactions & Contracts

Prisma is fully integrated with the Midnight Network. It generates real zero-knowledge proofs and settles them on-chain.

> [!NOTE]
> **Network & Testnet Details:** 
> - **Primary Verified Deployment:** Midnight Preprod Testnet (Contract Address: `0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`).
> - **Wallet Integration:** Seamless connection via **1AM Wallet** and **Midnight Lace** supporting dynamic network auto-detection (Preprod & Preview).
> - **Local Proving Engine:** Client-side proof generation via the local Midnight Proof Server (`http://127.0.0.1:6300`).

### Real Transaction Hash
*The user executed a transaction that was verified by our ZK circuit and permanently settled on the Midnight network.*
* **Transaction Hash:** [`0xff6ea8c67cf45e64bc5bc6661e935bc0986631af8d6568ebfd4f27beb996e060`](https://preprod.midnightexplorer.com/transactions/0xff6ea8c67cf45e64bc5bc6661e935bc0986631af8d6568ebfd4f27beb996e060)
* **Status:** `SUCCESS` (Verified via ZK Proof)
<img src="./Screenshot/preprod-contract.png" alt="Transaction Execution" width="100%" />

### Verified Contract on Explorer
*Our core ZK Payroll Engine is live and fully verifiable on the Midnight Blockchain Explorer.*
* **Contract Address:** [`0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`](https://preprod.midnightexplorer.com/contracts/0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f)
<img src="./Screenshot/payroll-contract.png" alt="Contract On Chain" width="100%" />

### 7. Compact Compiler Execution Output (Level 1 Verification)
*Compact compiler successfully compiling `.compact` source files, generating WASM circuits, ZKIR equivalents, and proving keys.*
<img src="./Screenshot/compile.png" alt="Compact Compiler Execution" width="100%" />

### 8. Automated CI/CD Pipeline
*Automated GitHub Actions workflow validating contract compilation, linting, type-checking, and frontend builds.*
<img src="./Screenshot/ci-cd.png" alt="CI CD Pipeline" width="100%" />

### 9. Vitest Test Suite Execution (4 Passing Tests)
*The test suite contains 4 dedicated automated tests executing locally to cryptographically verify circuit behavior:*
1. **Circuit Logic:** Ensures the constructor and spend circuits correctly generate valid zero-knowledge proofs.
2. **State Transitions:** Validates that the public ledger transitions correctly without exceeding spending limits.
3. **Privacy Behavior:** Ensures the private inputs (e.g., remaining allowance) are strictly enforced locally without leaking sensitive data on-chain.
4. **Vendor Settlement:** Proves invoice validation without publishing billing details.
<img src="./Screenshot/vite-test.png" alt="Vitest Test Suite" width="100%" />

---

## 🏛️ Enterprise ZK Product Modules & Applications

Prisma is architected to solve three high-impact, real-world enterprise problems using Midnight's core ZK primitives:

### 1. Confidential Corporate Payroll Streaming
* **The Problem:** Companies desire the automated efficiency of real-time salary streaming (per-second payment unlocks), but cannot expose employee compensation on public ledgers.
* **The Solution:** Prisma acts as a **Zero-Knowledge Payroll Engine**.
  * **Private Allowance Proof:** Cryptographically proves an employee is withdrawing within their accrued limit without exposing the total salary, unwithdrawn balance, or employee identity on-chain.
  * **Shielded Treasury:** Prevents competitors from calculating total corporate payroll burn rate or treasury size.

### 2. Shielded B2B Procurement & Vendor Invoicing
* **The Problem:** Corporations paying B2B invoices on-chain accidentally leak their entire supply chain, pricing agreements, and contractor networks to their direct competitors.
* **The Solution:** Prisma implements a **Shielded Vendor Settlement Protocol**.
  * **Private Invoicing:** Vendors withdraw invoice payments securely.
  * **Verified Execution:** Proves in ZK that invoice conditions and authorization thresholds are met, settling the payment while keeping invoice metadata completely private.

### 3. Trustless Real-Time Treasury Solvency Attestation
* **The Problem:** External stakeholders and auditors require assurance that an organization has sufficient payroll reserves without requiring full disclosure of all bank or crypto holdings.
* **The Solution:** Prisma provides **Zero-Knowledge Proof of Reserve & Solvency**.
  * **Solvency Proofs:** Cryptographically proves corporate reserves exceed active payroll commitments ($\ge \text{required obligations}$) without revealing exact balance sums.

---

## 🏗️ Detailed Project Architecture & Directory Structure

```text
prisma-app/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Continuous Integration: linting, build & cryptographic tests
├── app/                               # Next.js 14 App Router Directory
│   ├── (dashboard)/                   # Authenticated Enterprise Modules
│   │   ├── payroll/page.tsx           # Employer Payroll Stream Creation & Management
│   │   ├── worker/page.tsx            # Worker Real-Time Salary Stream & ZK Withdrawal UI
│   │   └── vendor/page.tsx            # Shielded B2B Invoice Generation & Settlement
│   ├── analytics/page.tsx             # ZK Circuit Execution Metrics, Proof Volume & Latency
│   ├── login/page.tsx                 # Supabase-authenticated User Session Portal
│   ├── layout.tsx                     # Root Application Shell & Theme Wrapper
│   ├── page.tsx                       # High-Conversion Landing Page & Feature Showcase
│   └── globals.css                    # Dark Glassmorphic Design System & Animations
├── components/                        # Reusable Component Architecture
│   ├── WalletContext.tsx              # Midnight 1AM & Lace DApp Connector with Network Auto-Switching
│   ├── Sidebar.tsx                    # Collapsible Dashboard Navigation with Live Network Status
│   └── LandingNav.tsx                 # Responsive Header Navigation for Public Pages
├── contracts/                         # Midnight Smart Contracts (Compact Language)
│   ├── payroll.compact                # Zero-Knowledge Corporate Payroll & Streaming Allowance Circuit
│   ├── vendor.compact                 # Confidential B2B Vendor Invoicing & Settlement Circuit
│   └── managed/                       # Auto-generated Compact Compiler Bindings
│       └── payroll/
│           ├── contract/index.js      # Generated TypeScript / JavaScript Runtime Contract Bindings
│           ├── zkir/spend.bzkir       # Binary ZK Intermediate Representation (ZKIR) Circuits
│           └── keys/                  # Compiled Local Prover & Verifier Key Cache
├── lib/                               # Core Business Logic & Infrastructure
│   ├── midnight/
│   │   └── providers.ts               # Midnight.js SDK Configuration (FetchZkConfigProvider & Proof Server)
│   └── supabase.ts                    # Supabase Client for Off-Chain Profile & Stream Indexing
├── public/                            # Static Web Assets & Browser-Accessible Keys
│   ├── ghost/keys/                    # spend.prover (147KB) & spend.verifier (1.3KB) for Client Proving
│   ├── payroll/                       # Public WASM binaries and circuit definitions
│   ├── vendor/                        # Public vendor contract artifacts
│   └── Screenshot/                    # Platform showcase visual documentation
├── Screenshot/                        # Root-level High-Resolution Screenshot Gallery for GitHub
└── tests/                             # Cryptographic & Functional Test Suites
    ├── payroll.test.ts                # Vitest Functional Circuit Verification & State Assertion Tests
    └── vendor.test.ts                 # Vitest Vendor Settlement & Proof Verification Tests
```

---

## 💻 Run Locally

### Prerequisites
1. **1AM Wallet or Midnight Lace:** Installed in your browser and switched to the Midnight Preprod network.
2. **Node.js:** v20 or higher (v24 recommended).
3. **Docker:** Required for the local proof server container.

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Sristipriya/Prisma.git
cd Prisma/prisma-app

# 2. Install dependencies
npm install

# 3. Start the Midnight Proof Server (in Docker)
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0

# 4. Start the development server
npm run dev
```
Open `http://localhost:3000` in your browser. Connect your 1AM wallet, navigate to the Dashboard, and deploy an enterprise payroll stream!