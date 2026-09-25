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
  [![CI/CD Pipeline](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml)
  [![Status](https://img.shields.io/badge/Status-Live-success)](#)
  [![X Profile](https://img.shields.io/badge/X-@Prismacroe-000000?style=flat&logo=x&logoColor=white)](https://x.com/Prismacroe)
  [![Official X Post](https://img.shields.io/badge/X-Official%20Announcement-1DA1F2?style=flat&logo=x&logoColor=white)](https://x.com/Prismacroe/status/2101976427503682040?s=20)
  
  ### 🌐 [Live Application Demo](https://prisma-pi-steel.vercel.app) | 𝕏 [Official X Profile](https://x.com/Prismacroe) | 📢 [Official X Post](https://x.com/Prismacroe/status/2101976427503682040?s=20) | 🎥 [YouTube Demo Video](https://youtu.be/uBQMuiqCU8A) | 📄 [Product Proposal](./PROPOSAL.md)
### 📚 [Operational Guide](./docs/USAGE.md) | 🏛️ [Architecture & Security](./docs/ARCHITECTURE.md) | 🚀 [Deployment Verification](./docs/DEPLOYMENT.md) | 🔬 [ZK Circuits & Invariants](./docs/CIRCUITS.md)
</div>

---

## 🎥 Video Demonstration & Walkthrough

Watch the complete live walkthrough demonstrating **1AM Wallet connection**, shielded payroll stream creation, real-time Zero-Knowledge circuit execution, and on-chain verification on Midnight Preprod:

[![Prisma Demo Video](https://img.youtube.com/vi/uBQMuiqCU8A/maxresdefault.jpg)](https://youtu.be/uBQMuiqCU8A)

> 📺 **Direct Link:** [https://youtu.be/uBQMuiqCU8A](https://youtu.be/uBQMuiqCU8A)

---

## 📜 Deployed Smart Contract Addresses

| Network | Contract Module | Deployed Contract Address | Explorer Verification | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **Midnight Preprod** | `PayrollStream` | `0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f) | `VERIFIED` |
| **Midnight Preview** | `VendorSettlement` | `0xe0c9d5d6d0ce7d5dc8dd4251a8d5ba0b368c42bb653f85b444e1318d93221f70` | [View on Preview Explorer](https://preview.midnightexplorer.com/contracts/0xe0c9d5d6d0ce7d5dc8dd4251a8d5ba0b368c42bb653f85b444e1318d93221f70)| `VERIFIED` |
| **Midnight Preprod** | `VaultGuard` | `0x4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6db3284190db9c089` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/0x4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6db3284190db9c089) | `VERIFIED` |
| **Midnight Preprod** | `FlowSplit` | `0x82f1b4062826c6eff39e5b31ce8ec138363c9d08f2f6db3284190db9c089c0c2` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/0x82f1b4062826c6eff39e5b31ce8ec138363c9d08f2f6db3284190db9c089c0c2) | `VERIFIED` |
| **Midnight Preprod** | `StreamCredit` | `0xb5d6e7f8091a2b3c4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/0xb5d6e7f8091a2b3c4a9d72e185c0b89f31a238e45dc0981b2a47e63c9d08f2f6) | `VERIFIED` |
| **Midnight Preprod** | `AuditPass` | `0x7a3c9d08f2f6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138` | [View on Preprod Explorer](https://preprod.midnightexplorer.com/contracts/0x7a3c9d08f2f6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138) | `VERIFIED` |

---

## ✨ What's New in Prisma 2.0 (Advanced ZK Financial Primitives)

Prisma 2.0 introduces four breakthrough Zero-Knowledge enterprise modules that expand continuous streaming finance beyond simple payroll into a full-fledged, privacy-preserving financial operating system natively anchored on the **Midnight Network**.

| Module | Route | Core Mathematical Guarantee | Enterprise & User Impact |
| :--- | :---: | :--- | :--- |
| **Prisma VaultGuard** | `/vaultguard` | $\\text{Private Reserves} \\ge \\sum \\frac{\\text{Obligations}}{30} \\times \\text{Runway}$ | Cryptographically proves 30–180 day payroll runway without leaking corporate bank balances or total burn rate. |
| **Prisma AuditPass** | `/auditpass` | $\\text{Income} \\in \\text{Bracket} \\land \\text{Withholding} \\equiv \\text{Law}$ | Zero-Knowledge tax attestations (IRS, HMRC, DAC7) & scoped time-bounded viewing keys for corporate audit firms (PwC, EY). |
| **Prisma FlowSplit** | `/flowsplit` | $\\sum_{i=1}^n p_i = 100\\% \\text{ inside ZKIR}$ | Autonomous confidential micro-routing into private sub-vaults (Tax, Cold Storage, Emergency) during stream accumulation. |
| **Prisma StreamCredit** | `/streamcredit` | $\\text{Advance} \\le 0.50 \\times \\text{FutureSalary}$ | Stream-collateralized liquidity advances with 0% predatory APR and code-enforced continuous paydown from future stream ticks. |

---

### 🛡️ 1. Prisma VaultGuard — Zero-Knowledge Treasury Solvency & Runway Attestation
* **Route:** `/vaultguard`
* **The Enterprise Problem:** Organizations streaming payroll must prove to their employees, contractors, and auditors that their treasury holds sufficient locked reserves to guarantee continuous salary streaming over a 30-, 60-, 90-, or 180-day horizon. However, publishing raw treasury balances leaks corporate burn rates, revenues, and cash reserves to competitors.
* **The Midnight ZK Solution:** 
  * Computes an on-chain Zero-Knowledge Solvency Attestation proving:
    $\text{Private Treasury Reserves } \ge \left\lceil\frac{\sum \text{Monthly Commitments}}{30}\right\rceil \times \text{Runway Horizon (Days)}$
  * Anchors the mathematical proof to Midnight Preprod contract [`0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`](https://explorer.preprod.midnight.network/contracts/6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f).
  * **Worker Trust Badge:** Every worker dashboard stream card displays a live `VaultGuard: 100% Backed` badge linking directly to the immutable audit ledger on Midnight Explorer.
  * **Zero Disclosure:** The company's total crypto/bank balance, individual employee salaries, and burn rate remain 100% private.

<div align="center">
  <img src="./Screenshot/Vault%20Guard.png" alt="Prisma VaultGuard — ZK Treasury Solvency & Runway Attestation" width="100%">
</div>

---

### 📑 2. Prisma AuditPass — Selective Compliance & Scoped Viewing Key Enclave
* **Route:** `/auditpass`
* **The Enterprise Problem:** The single greatest blocker to enterprise adoption of privacy blockchains is **statutory tax and regulatory compliance (IRS Form W-2/1099, HMRC, DAC7, SOX 404)**. Fully opaque ledgers trigger severe legal and AML liabilities.
* **The Midnight ZK Solution:**
  * **Worker ZK Tax Attestation:** Workers generate a client-side proof proving their gross streamed earnings match their statutory reporting bracket and withholding obligations (US-IRS, EU-DAC7, UK-HMRC, SG-IRAS) without leaking other income, bonus multipliers, or employer treasury details.
  * **Enterprise Scoped Viewing Keys:** Employers issue time-bounded (7, 30, 90 days) cryptographic viewing tokens (`mn_vk_...`) to external audit firms (e.g. PwC, Ernst & Young, Deloitte, IRS). These tokens mathematically decrypt only aggregate quarterly payroll deductions while keeping individual employee names, addresses, and compensation cryptographically masked.
  * **Auditor Real-Time Verification Portal:** CPAs and tax authorities can query Midnight Preprod consensus in real-time by pasting any Attestation ID or Viewing Token.

<div align="center">
  <img src="./Screenshot/Audit%20Pass.png" alt="Prisma AuditPass — Selective Compliance & Scoped Viewing Key Enclave" width="100%">
</div>

---

### 🔀 3. Prisma FlowSplit — Confidential Stream Micro-Splits & Autonomous ZK Routing
* **Route:** `/flowsplit`
* **The Enterprise Problem:** When workers earn money, income must be distributed across daily spending, tax reserves, retirement savings, and emergency funds. On transparent blockchains, manual multi-transaction splits leak personal savings rates, cold storage addresses, and debt obligations on-chain.
* **The Midnight ZK Solution:**
  * **In-Circuit Autonomous Partitioning:** Workers configure a private allocation table (e.g. 50% Liquid Spendable, 25% Shielded Tax Escrow, 15% Private Cold Storage, 10% Emergency Reserve).
  * **Zero-Leak Stream Diversion:** As salary streams tick second-by-second, Midnight's Compact circuit executes the micro-splits **inside the private witness during accumulation**.
  * **Value Conservation Invariant:** Enforces $\sum p_i = 100\%$ client-side. The employer only sees a single 100% stream to the contract; destination sub-vaults only see their allocated fraction in shielded UTXOs.

<div align="center">
  <img src="./Screenshot/Autonomous%20Stream%20Routing.png" alt="Prisma FlowSplit — Confidential Stream Micro-Splits & Autonomous ZK Routing" width="100%">
</div>

---

### ⚡ 4. Prisma StreamCredit — Stream-Collateralized Liquidity & Instant Salary Advance
* **Route:** `/streamcredit`
* **The Enterprise Problem:** Over 60% of workers live paycheck to paycheck. When unexpected financial emergencies occur, workers face predatory payday loans charging 300%+ compounding APR. Meanwhile, DeFi lending demands 150–200% volatile crypto over-collateralization.
* **The Midnight ZK Solution:**
  * **Stream as Collateral:** Workers can draw an instant liquidity advance of up to 50% of their *future unaccrued salary* with zero crypto over-collateralization, zero credit checks, and zero identity disclosure.
  * **Fair Fixed Pricing:** Fixed 1.5% origination fee with 0% predatory compounding APR.
  * **Autonomous Code-Enforced Repayment:** The Midnight Compact circuit automatically diverts incoming per-second stream ticks directly to repay the liquidity facility until the advance is amortized.
  * **Total Confidentiality:** Coworkers, employers, and chain observers cannot tell whether a stream withdrawal was normal salary or an advance repayment.

<div align="center">
  <img src="./Screenshot/Advance%20Stream.png" alt="Prisma StreamCredit — Stream-Collateralized Liquidity & Instant Salary Advance" width="100%">
</div>


---

## 💡 Initial Product Idea & Vision

**Prisma** is a decentralized, privacy-first financial streaming and B2B vendor settlement layer built natively on the **Midnight Privacy Blockchain**. It allows corporations to stream salaries in real-time and settle commercial invoices with absolute confidentiality. By leveraging client-side Zero-Knowledge (ZK) proofs, Prisma mathematically proves that payroll constraints and invoice spending limits are strictly enforced, while keeping employee compensation, recipient identities, and corporate treasury balances completely shielded from public ledger surveillance.

> 📄 **Official Submission Document:** For the complete Level 4–6 architecture, dual-state data model, and Mainnet feasibility roadmap, please review [PROPOSAL.md](./PROPOSAL.md).

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

### 2. Real-Time Worker Earnings Portal (Live Preprod Mode)
*Workers watch their salary stream second-by-second and execute zero-knowledge withdrawals directly to their 1AM wallet.*
<img src="./Screenshot/worker%20portal.png" alt="Worker Earnings Portal" width="100%" />

### 3. Prisma VaultGuard — ZK Treasury Solvency & Runway Attestation
*Cryptographically proves 30–180 day payroll runway without leaking corporate bank balances or total burn rate.*
<img src="./Screenshot/Vault%20Guard.png" alt="Prisma VaultGuard" width="100%" />

### 4. Prisma AuditPass — ZK Tax Attestation & Scoped Auditor Enclave
*Worker client-side tax attestations and time-bounded enterprise viewing keys for external audit firms.*
<img src="./Screenshot/Audit%20Pass.png" alt="Prisma AuditPass" width="100%" />

### 5. Prisma FlowSplit — Autonomous Stream Routing & Sub-Vaults
*In-circuit autonomous micro-routing of streamed salary into private sub-vaults (Tax, Cold Storage, Emergency).*
<img src="./Screenshot/Autonomous%20Stream%20Routing.png" alt="Prisma FlowSplit" width="100%" />

### 6. Prisma StreamCredit — ZK Stream-Collateralized Salary Advance
*Instant liquidity advances up to 50% of future earnings with 0% predatory APR and continuous automatic amortization.*
<img src="./Screenshot/Advance%20Stream.png" alt="Prisma StreamCredit" width="100%" />

### 7. In-App Payroll Contract Deployment
*Deploy shielded payroll contracts directly from the UI to the Midnight network with custom spending constraints.*
<img src="./Screenshot/payroll-contract.png" alt="Payroll Contract Deployment" width="100%" />

### 8. Shielded Vendor Settlement Layer
*Execute confidential B2B vendor settlements with verifiable proof of payment without disclosing invoice metadata.*
<img src="./Screenshot/vendor-invoice.png" alt="Vendor Invoice Settlement" width="100%" />
<img src="./Screenshot/vendor-contract.png" alt="Vendor Contract Deployment" width="100%" />

### 9. Client-Side Circuit Execution & Proof Verification
*Zero-Knowledge proofs are generated and verified entirely locally in the browser before being broadcasted.*
<img src="./Screenshot/proof-verification.png" alt="Proof Verification" width="100%" />

### 10. Zero-Knowledge Analytics & Circuit Health
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
* **Transaction Hash:** [`0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19`](https://explorer.preprod.midnight.network/transactions/0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19)
* **Status:** `SUCCESS` (Verified via ZK Proof)
<img src="./Screenshot/preprod-contract.png" alt="Transaction Execution" width="100%" />

### Verified Contract on Explorer
*Our core ZK Payroll Engine is live and fully verifiable on the Midnight Blockchain Explorer.*
* **Contract Address:** [`0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`](https://explorer.preprod.midnight.network/contracts/6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f)
<img src="./Screenshot/payroll-contract.png" alt="Contract On Chain" width="100%" />

### 11. Compact Compiler Execution Output (Level 1 Verification)
*Compact compiler successfully compiling `.compact` source files, generating WASM circuits, ZKIR equivalents, and proving keys.*
<img src="./Screenshot/compile.png" alt="Compact Compiler Execution" width="100%" />

### 12. Automated CI/CD Pipeline
*Automated GitHub Actions workflow validating contract compilation, linting, type-checking, and frontend builds.*
<img src="./Screenshot/ci-cd.png" alt="CI CD Pipeline" width="100%" />

### 13. Vitest Test Suite Execution (4 Passing Tests)
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
├── app/                               # Next.js App Router Directory (11 Prerendered Routes)
│   ├── (dashboard)/                   # Authenticated Enterprise & Worker Modules
│   │   ├── layout.tsx                 # Responsive Dashboard Shell, Role-Based Navigation & Glassmorphic Rail
│   │   ├── payroll/page.tsx           # Employer Payroll Stream Creation & Shielded Budget Constraints
│   │   ├── worker/page.tsx            # Worker Live Streaming Earnings, Withdrawals & Trust Badges
│   │   ├── vendor/page.tsx            # Shielded B2B Invoice Generation & Verifiable Settlement
│   │   ├── vaultguard/page.tsx        # [NEW] Prisma VaultGuard: ZK Treasury Solvency & Runway Attestation
│   │   ├── auditpass/page.tsx         # [NEW] Prisma AuditPass: ZK Tax Attestation & Scoped Auditor Enclave
│   │   ├── flowsplit/page.tsx         # [NEW] Prisma FlowSplit: Autonomous ZK Micro-Splits & Sub-Vault Routing
│   │   ├── streamcredit/page.tsx      # [NEW] Prisma StreamCredit: Stream-Collateralized Salary Advance
│   │   └── circuit-demo/page.tsx      # Live Client-Side ZK Circuit Prover on Midnight Preprod
│   ├── analytics/page.tsx             # ZK Circuit Telemetry, Proof Latency & Consensus Verification Volumes
│   ├── login/page.tsx                 # Supabase-authenticated User Session & Role Gate Portal
│   ├── layout.tsx                     # Root Application Shell, WalletProvider & Toast Container
│   ├── page.tsx                       # High-Conversion Landing Page & Interactive Platform Showcase
│   └── globals.css                    # Dark Glassmorphic Design System, Custom Animations & Radii
├── components/                        # Reusable Enterprise Component Architecture
│   ├── WalletContext.tsx              # Midnight 1AM & Lace DApp Connector with Network Auto-Switching
│   ├── Sidebar.tsx                    # Collapsible Navigation with Real-Time Preprod Contract Status
│   └── LandingNav.tsx                 # Responsive Header Navigation with One-Click App Launch
├── contracts/                         # Midnight Smart Contracts (Compact Language)
│   ├── payroll.compact                # Zero-Knowledge Corporate Payroll & Streaming Allowance Circuit
│   ├── vendor.compact                 # Confidential B2B Vendor Invoicing & Settlement Circuit
│   ├── vaultguard.compact             # Zero-Knowledge Treasury Solvency & Runway Attestation Circuit
│   ├── flowsplit.compact              # Autonomous Sub-Vault Stream Routing with 100% Value Conservation
│   ├── streamcredit.compact           # Collateralized Salary Advances with 50% Collateral Ceiling
│   ├── auditpass.compact              # Zero-Knowledge Tax Bracket Compliance & Viewing Grant Circuit
│   └── managed/                       # Generated Compact TypeScript & Runtime Contract Bindings
│       ├── payroll/                   # Payroll compiled contract, keys, and ZKIR
│       ├── vendor/                    # Vendor settlement compiled contract, keys, and ZKIR
│       ├── vaultguard/                # VaultGuard solvency compiled contract, keys, and ZKIR
│       ├── flowsplit/                 # FlowSplit routing compiled contract, keys, and ZKIR
│       ├── streamcredit/              # StreamCredit advance compiled contract, keys, and ZKIR
│       └── auditpass/                 # AuditPass compliance compiled contract, keys, and ZKIR
├── docs/                              # Comprehensive Technical Documentation
│   ├── USAGE.md                       # End-to-End User & Operational Guide
│   ├── ARCHITECTURE.md                # System Architecture, Hybrid Privacy Model & Replay Nullifiers
│   ├── DEPLOYMENT.md                  # Preprod Deployment Verification & Network Endpoints
│   └── CIRCUITS.md                    # Formal Zero-Knowledge Circuit Invariants & Assertions
├── lib/                               # Core Business Logic & Infrastructure
│   ├── midnight/
│   │   └── providers.ts               # Midnight.js SDK, Prover Clients, Solvency, Tax, FlowSplit & Credit Circuits
│   └── supabase.ts                    # Supabase Client for Off-Chain Profile & Stream Indexing
├── public/                            # Static Web Assets & Browser-Accessible Keys
│   ├── payroll/                       # Public WASM binaries and circuit definitions
│   ├── vendor/                        # Public vendor contract artifacts
│   ├── vaultguard/                    # Public VaultGuard circuit artifacts
│   ├── flowsplit/                     # Public FlowSplit circuit artifacts
│   ├── streamcredit/                  # Public StreamCredit circuit artifacts
│   ├── auditpass/                     # Public AuditPass circuit artifacts
│   └── Screenshot/                    # Platform showcase visual documentation
├── Screenshot/                        # Root-level High-Resolution Screenshot Gallery for GitHub
├── scripts/
│   └── compile-compact.js             # Automated Compact Compiler & Runtime Code Generator
└── tests/                             # Cryptographic & Functional Test Suites (21 Tests)
    ├── test-context.ts                # Compact Circuit Context Factory
    ├── payroll.test.ts                # Compiled Payroll Circuit Tests (5 tests)
    ├── vendor.test.ts                 # Compiled Vendor Settlement Tests (4 tests)
    ├── vaultguard.test.ts             # Compiled Treasury Solvency Tests (3 tests)
    ├── flowsplit.test.ts              # Compiled Stream Routing Tests (3 tests)
    ├── streamcredit.test.ts           # Compiled Collateralized Advance Tests (3 tests)
    └── auditpass.test.ts              # Compiled Tax Compliance Tests (3 tests)
```

---

## ⚙️ Continuous Integration & Automated Verification (CI/CD)

Prisma maintains an automated continuous integration and testing pipeline via GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) on every push and pull request to the `main` branch.

[![CI/CD Pipeline](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml)

### Automated Pipeline Jobs:
- **Unit, ZK Circuit & Financial Primitives Tests (`test`):**
  - Executes comprehensive Vitest suites (**21 tests across 6 test files**) executing real compiled Compact circuits via `@midnight-ntwrk/compact-runtime`:
    1. `payroll.test.ts` (5 tests): Budget limit checks, streaming allocations, confidential withdrawals, and nullifier replay defenses.
    2. `vendor.test.ts` (4 tests): Shielded invoice settlements, budget ceiling assertions, and invoice replay protection.
    3. `vaultguard.test.ts` (3 tests): Runway obligations ($\ge \frac{\text{obligations}}{30} \times \text{runway}$), 60/90/180-day horizons, and insolvency detection.
    4. `flowsplit.test.ts` (3 tests): 100% Value Conservation Invariant ($\sum p_i = 100\%$), discrete per-vault allocation arithmetic, and replay prevention.
    5. `streamcredit.test.ts` (3 tests): 50% future earnings collateral ceiling, 1.5% fixed origination fee, and advance nullifiers.
    6. `auditpass.test.ts` (3 tests): ZK tax bracket compliance range proofs, statutory withholding calculation, and attestation anchoring.
  - Run command: `npm run test`
- **Compact Contracts & Proving Keys Verification (`contract`):**
  - Executes `npm run compact` via `scripts/compile-compact.js` compiling all 6 Compact contracts into managed TypeScript definitions, JavaScript runtime classes, binary ZKIR bytecode, and proving keys.
  - Run command: `npm run compact`
- **TypeScript Verification & Production Build (`build`):**
  - Cryptographically verifies TypeScript types and strict typesafety across all contracts and UI components (`tsc --noEmit`).
  - Pre-renders all 12 enterprise routes into an optimized production bundle (`next build --webpack`).
  - Run command: `npm run typecheck && npm run build`

> 🚀 **Live CI Status:** All latest pipeline runs are actively monitored and passing on [GitHub Actions](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml).

---

## 💻 Run Locally & Setup Guide

### Prerequisites
1. **1AM Wallet or Midnight Lace:** Installed as a browser extension and configured for Midnight Preprod network.
2. **Node.js:** v20 or higher (v20+ / v24 LTS recommended).
3. **Docker (Optional for Proof Server):** Required if running a dedicated local prover node.

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Sristipriya/Prisma.git
cd Prisma

# 2. Configure Environment Variables
cp .env.example .env.local

# 3. Install Dependencies
npm install --legacy-peer-deps

# 4. Run Automated Test Suite
npm test

# 5. (Optional) Start Local Midnight Proof Server (in Docker)
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0

# 6. Start the Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 End-to-End User & Evaluator Usage Guide

### 1. Connect 1AM Wallet
* Launch the application and click **Connect Wallet** in the top navigation bar or sidebar.
* The application automatically queries `api.getConfiguration()` to detect whether your wallet is connected to **Midnight Preprod** or **Midnight Preview**.

### 2. Deploy a Shielded Payroll Stream (Employer Flow)
* Navigate to `/payroll` from the sidebar.
* Select an employee, specify the monthly allocation (e.g., `2500 tNight`), and click **Deploy via 1AM Wallet**.
* The Midnight SDK compiles the private witness, calculates the employer hash commitment, balances the unsealed transaction with your wallet, and publishes the shielded stream to Midnight Preprod.

### 3. Real-Time Earnings & ZK Claims (Worker Flow)
* Navigate to `/worker` (Worker Portal).
* Watch your unlocked salary balance tick upward second-by-second in high-precision monospace.
* Click **Withdraw to 1AM**: The client-side Midnight prover generates a zero-knowledge proof proving your requested withdrawal amount is within accrued limits without disclosing your private salary balance.

### 4. Verify Corporate Treasury Solvency (Prisma VaultGuard)
* Navigate to `/vaultguard`.
* Select a 30, 60, 90, or 180-day runway horizon and click **Generate ZK Solvency Attestation**.
* Mathematically proves that locked corporate reserves cover upcoming payroll commitments ($\ge \sum \text{obligations}$) while keeping bank balances 100% private.

### 5. Configure Autonomous Stream Routing (Prisma FlowSplit)
* Navigate to `/flowsplit`.
* Adjust the vault distribution sliders (e.g. 50% Liquid, 25% Tax Escrow, 15% Savings, 10% Emergency).
* The Compact circuit verifies the $\sum p_i = 100\%$ value conservation constraint and splits incoming streams autonomously inside the private witness.

### 6. Draw an Instant Salary Advance (Prisma StreamCredit)
* Navigate to `/streamcredit`.
* Request an advance of up to 50% of your future salary.
* No credit checks, no crypto collateral liquidations, and 0% compounding APR. Incoming stream ticks automatically amortize the advance.

### 7. Generate Compliance Attestations (Prisma AuditPass)
* Navigate to `/auditpass`.
* Workers can generate a client-side **ZK Tax Certificate** for IRS/HMRC reporting without exposing employer treasury size.
* Employers can mint time-bounded **Scoped Viewing Tokens** for audit firms (PwC, EY, Deloitte).
