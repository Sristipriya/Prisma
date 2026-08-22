<div align="center">
  <img src="./public/Screenshot/landing-page.png" alt="Prisma Landing Page" width="100%" />
</div>

<br />

# Prisma: Zero-Knowledge Payroll & Vendor Settlement

This project is built on the [Midnight Network](https://midnight.network/).

[![Generic badge](https://img.shields.io/badge/Compact%20Compiler-0.30.0-1abc9c.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Network-Preprod-8b5cf6.svg)](https://shields.io/)

> **Use this repo as a template. Do not fork it.**
>  
> This repository is intended to be used via GitHub's "Use this template" flow.  
> Forking this repo is discouraged, as forks are not tracked as independent projects.

Prisma is a next-generation decentralized payroll and vendor settlement application. It leverages the power of Midnight's Zero-Knowledge (ZK) proofs to allow companies to stream salaries and settle invoices with absolute privacy, while still ensuring verifiable execution on a public ledger.

---

## ?? Platform Showcase

### 1. Dashboard & Real-Time Analytics
*Monitor your proof generation volume and ledger state securely.*
<img src="./public/Screenshot/Dashboard.png" alt="Dashboard" width="100%" />
<img src="./public/Screenshot/zk-analysis.png" alt="ZK Analysis" width="100%" />

### 2. Payroll Smart Contracts (Midnight Preprod)
*Employers can deploy mathematically verified payroll contracts directly from the UI to the Midnight network instantly.*
<img src="./public/Screenshot/payroll-contract.png" alt="Payroll Contract Execution" width="100%" />

### 3. Shielded Vendor Settlement
*Pay external vendors confidentially using the 1AM wallet.*
<img src="./public/Screenshot/vendor-invoice.png" alt="Vendor Invoice Settlement" width="100%" />
<img src="./public/Screenshot/vendor-contract.png" alt="Vendor Contract Deployment" width="100%" />

### 4. Client-Side Circuit Execution
*Zero-Knowledge proofs are generated and verified entirely locally in the browser before being broadcasted.*
<img src="./public/Screenshot/proof-verification.png" alt="Client Side ZK Verification" width="100%" />

---

## ?? Verified On-Chain Transactions & Contracts

Prisma is fully integrated with Midnight. It generates real zero-knowledge proofs and settles them on-chain.

> [!NOTE]
> **Network & Testnet Details:** 
> - **Primary Verified Deployment:** Midnight Preprod Testnet
> - **Preprod Compatibility:** The Prisma dApp frontend features dynamic **Network Switcher** integration allowing seamless interaction with the Preprod network.

### Real Transaction Hash & Execution
*The platform executes transactions that are verified by our ZK circuits and permanently settled on the Midnight network.*
* **Status:** `SUCCESS` (Verified via ZK Proof)
* **Contract Details:** [View on Midnight Explorer](https://explorer.preprod.midnight.network/)
<img src="./public/Screenshot/preprod-contract.png" alt="Transaction Execution" width="100%" />

### 9. Developer Tools & Sync Logs
*Real-time logging of blockchain state and wallet synchronization.*
<img src="./public/Screenshot/compile.png" alt="Compile Terminal Output" width="100%" />

### 10. Automated CI/CD Pipeline
*Automated GitHub Actions workflow validating contract compilation, linting, and build.*
<img src="./public/Screenshot/ci-cd.png" alt="CI CD Pipeline" width="100%" />

### 11. Vitest Test Suite Execution
*The test suite contains dedicated functional tests executing locally to cryptographically verify:*
1. **Circuit Logic:** Ensures the constructor and spend circuits correctly generate valid zero-knowledge proofs.
2. **State Transitions:** Validates that the public ledger transitions correctly without exceeding spending limits.
3. **Privacy Behavior:** Ensures the private inputs are strictly enforced locally without leaking sensitive data on-chain.
<img src="./public/Screenshot/vite-test.png" alt="Vite Testing" width="100%" />

---

## ?? Enterprise ZK Product Modules & Applications

Prisma is architected to solve two high-impact, real-world enterprise problems using Midnight's core ZK primitives:

### 1. Anonymous Corporate Payroll Streams
* **The Problem:** Companies want the efficiency and trustlessness of blockchain-based salary streaming, but employees demand absolute privacy. On public blockchains, every salary amount, bonus, and recipient address is completely visible to coworkers and competitors.
* **The Solution:** Prisma acts as a **Zero-Knowledge Payroll Engine**.
  * **Private Salary Streaming:** Cryptographically proves that an employee is withdrawing their exact earned salary without exposing the total contract value or the employee's exact withdrawal amount to the public ledger.
  * **Shielded Balances:** Ensures that company treasury wallets cannot be reverse-engineered by competitors.

### 2. Confidential B2B Vendor Settlement
* **The Problem:** Corporations paying B2B invoices on-chain accidentally leak their entire supply chain, pricing agreements, and contractor networks to their direct competitors.
* **The Solution:** Prisma implements a **Shielded Vendor Settlement Protocol**.
  * **Private Invoicing:** Vendors can withdraw invoice payments securely.
  * **Verified Execution:** The system proves in ZK that the vendor's invoice conditions were met and the payment was authorized, settling the transaction on the Midnight network while keeping the invoice metadata completely private.

---

## ??? System Architecture & Tech Stack

Prisma is built using a modern, highly scalable stack:

### Tech Stack
* **Blockchain Network:** Midnight Network (Preprod Testnet)
* **Smart Contracts:** Compact (Midnight's native ZK language)
* **Web3 Integration:** Midnight.js & 1AM Wallet
* **Frontend:** Next.js 14, React, Tailwind CSS
* **Database:** Supabase (PostgreSQL) for real-time off-chain state syncing
* **State Management:** React Context API

### Project Directory Structure
```text
Prisma/
+-- app/                  # Next.js App Router (Dashboard UI, Worker Portal)
+-- components/           # Reusable UI components & Wallet Context
+-- contracts/            # Midnight ZK Smart Contracts
¦   +-- payroll.compact   # Working spending limit circuit
¦   +-- vendor.compact    # Working vendor circuit
+-- lib/                  # Utilities & Midnight SDK Integrations
+-- public/               # Static Assets & compiled ZK Proving Keys
¦   +-- Screenshot/       # Application Screenshots
+-- store/                # State management and context providers
```

---

## ?? Run Locally

### Prerequisites
1. **1AM Wallet:** Installed in your browser and switched to the Midnight Preprod network.
2. **Node.js:** v24 or higher.
3. **Docker:** Required for the local proof server.

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Sristipriya/Prisma.git
cd Prisma/prisma-app

# 2. Install dependencies
npm install

# 3. Start the Proof Server
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0

# 4. Start the development server
npm run dev
```
Open `http://localhost:3000` in your browser. Connect your 1AM wallet, navigate to the Dashboard, and deploy a secure payroll contract!
