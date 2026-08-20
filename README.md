<div align="center">
  <br>
  
  [![CI](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml/badge.svg)](https://github.com/Sristipriya/Prisma/actions/workflows/ci.yml)
  
  <i>Financial infrastructure for the shielded web.</i>
  <br><br>
  
  # Prisma: Zero-Knowledge Payroll & Vendor Settlements
  
  **Enterprise-grade cryptographic privacy for global payroll and vendor payments.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Midnight Network](https://img.shields.io/badge/Midnight-Preview-blueviolet)](https://midnight.network/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
  [![Status](https://img.shields.io/badge/Status-Live-success)](#)
</div>

---

## The Real-World Problem

As businesses expand globally, they increasingly rely on blockchain rails for cross-border payroll, contractor payments, and vendor settlements. 

However, **enterprises cannot adopt Web3 payments without absolute financial privacy:**
1. **The Privacy Dilemma:** If a company pays its employees or vendors on a public blockchain, their entire payroll structure, negotiated pricing, and vendor relationships are completely exposed to competitors.
2. **The Compliance Challenge:** Enterprises must prove compliance and maintain audit trails without doxing their workforce or leaking sensitive financial flow data to the public.

Today, companies are forced to choose between the speed and borderless nature of crypto, and the privacy of legacy banking. 

---

## The Solution: Prisma 

**Prisma** is a verifiable financial infrastructure layer built on the **Midnight Privacy Blockchain**. It wraps corporate transactions in cryptographic guardrails using **Zero-Knowledge (ZK) Proofs**. 

Instead of asking enterprises to compromise on privacy, Prisma offers a mathematical guarantee:
> *"A company can execute global payroll and vendor settlements instantly on a public ledger, while using Zero-Knowledge Proofs to guarantee that the transaction amounts, recipient addresses, and contract terms remain completely encrypted and private."*

### Why Midnight?
Public blockchains (like Ethereum or Solana) cannot be used for B2B commerce because they leak sensitive financial data. Private blockchains lack global liquidity and interoperability. 
**Midnight** solves this perfectly: It allows us to prove that a payment is valid and authorized on a public ledger, while keeping the actual financial data (who is being paid, and exactly how much) completely private using advanced ZK cryptography.

### Public Ledger State vs Private Witness
In Prisma's Compact smart contracts, we strictly separate what the world sees (Public State) from what the company keeps secret (Private Witness):
* **Public Ledger State:** The only information stored on the public blockchain is the *total company budget limit* and the *cryptographic proof* that a transaction occurred. Competitors can only see that a cryptographic action happened, but no details of the action itself.
* **Private Witness:** The actual financial details—such as the individual employee's salary amount, the vendor's invoice amount, and the recipient's identity—are held entirely off-chain in the Private Witness. The ZK circuit validates that the Private Witness data complies with the Public State constraints (e.g., ensuring a salary doesn't exceed the company budget limit) without ever publishing the private data to the ledger.
* **Using `disclose()`:** In our smart contract circuits, we deliberately use the `disclose()` function only when we specifically want to move a variable from the Private Witness into the Public State (such as the final updated total budget). This guarantees absolute control over what becomes public.

---

## Comprehensive Platform Gallery & Screenshots

Prisma features an ultra-premium, minimalistic "liquid glass" dashboard tailored for modern finance teams.

### 1. Zero-Knowledge Payroll Dashboard
*Execute instant global payroll streams. Employee salaries are verified via ZK proofs while amounts remain hidden from the public ledger.*
<img src="./public/screenshot/PayroolCOntract.png" alt="Payroll Contract Dashboard" width="100%" />

### 2. Vendor Settlement Management
*Settle external contractors and vendor invoices effortlessly. ZK proofs guarantee that your vendor list and negotiated rates are protected from corporate espionage.*
<img src="./public/screenshot/vendor%20contract.png" alt="Vendor Settlement Management" width="100%" />

### 3. ZK Analytics & Audit Telemetry
*Real-time monitoring of zero-knowledge proof generation, shielded ledger state, and privacy-preserving compliance proofs.*

---

## Verified On-Chain Transactions & Contracts

Prisma is fully integrated with Midnight. It generates real zero-knowledge proofs locally in the browser and settles them on-chain.

> [!NOTE]
> **Network & Testnet Details:** 
> - **Primary Verified Deployment:** Midnight Preview Testnet.
> - **Payroll Contract Transaction:** [`0x16b52cffbdae782c23dadfbd27e4f4716371cf2e91c674f69e4a068ab644835c`](https://preview.midnightexplorer.com/transactions/0x16b52cffbdae782c23dadfbd27e4f4716371cf2e91c674f69e4a068ab644835c)
> - **Vendor Contract Transaction:** [`20b8638a3e733a1c4b7a0012509886e494591452210a48354dc560befbaff44d`](https://preview.midnightexplorer.com/transactions/20b8638a3e733a1c4b7a0012509886e494591452210a48354dc560befbaff44d)
> - **Wallet Compatibility:** Prisma is fully integrated with the 1AM Wallet and Lace Wallet for Midnight.

---

## Enterprise ZK Product Modules & Applications

Prisma is architected to solve core enterprise financial problems using Midnight's ZK primitives:

### 1. Shielded Global Payroll
* **The Problem:** Companies want to pay employees in crypto, but public ledgers expose exact salaries to coworkers and the public.
* **The Solution:** Prisma encrypts the payroll allocation. The ZK circuit proves the total funds match the sum of individual salaries without revealing the individual amounts on-chain.

### 2. Private B2B Vendor Settlements
* **The Problem:** Paying vendors on public chains exposes your supply chain and pricing to competitors.
* **The Solution:** Prisma acts as a **Zero-Knowledge B2B Payment Gateway**. It cryptographically proves the company is paying an authorized invoice without exposing vendor identities or the invoice amount on the public ledger.

---

## System Architecture & Tech Stack

Prisma is built using a modern, highly scalable stack focused on performance and premium aesthetics:

### Tech Stack
* **Blockchain Network:** Midnight Network (Preview Testnet)
* **Smart Contracts:** Compact (Midnight’s native ZK language)
* **Web3 Integration:** 1AM Wallet & Lace Wallet
* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
* **Design System:** Custom "Liquid Glass" monochromatic UI, Lucide Icons
* **Database:** Prisma ORM / SQLite (for local cache)

### Project Directory Structure
```text
Prisma/
├── app/                        # Next.js App Router (Landing, Dashboard UI)
├── components/                 # Reusable UI components & Wallet Context
├── contracts/                  # Midnight ZK Smart Contracts
│   ├── payroll.compact         # Shielded Payroll Circuit
│   └── vendor.compact          # ZK Vendor Settlement Circuit
├── lib/                        # Utilities & Hooks
│   ├── midnight/               # Midnight SDK Integration & Wallet Auth
│   └── db/                     # Prisma ORM Schema
├── managed/                    # Auto-generated WASM from Compact compiler
└── public/                     # Static Assets & compiled ZK Proving Keys
```

---

## Testing & CI/CD Validation (Level 3)

Prisma includes a comprehensive test suite to validate the Zero-Knowledge circuits.

* **Vitest Constraints Simulator:** We simulate the Compact WASM output to test ZK invariants locally.
* **Test Cases:** Validates that payroll and vendor circuits successfully update the ledger for valid amounts, but throw `Spending limit exceeded` constraint assertions if payments cross the budget limits, without revealing the individual amounts.
* **CI/CD Pipeline:** Integrated with GitHub Actions. Every push to the repository runs `vitest run` on the constraints simulator to ensure ZK logic integrity.

### Vitest Test Suite Execution
*The test suite executes locally to cryptographically verify circuit logic, state transitions, and privacy bounds without leaking sensitive data on-chain.*
<img src="./public/screenshot/Vite%20Test.png" alt="Vitest Output" width="100%" />

---

## Run Locally

### Prerequisites
1. **1AM Wallet or Lace Wallet:** Installed in your browser and switched to the Midnight Preview network.
2. **Node.js:** v20 or higher.

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Sristipriya/Prisma.git
cd Prisma/prisma-app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
Open `http://localhost:3000` in your browser. Connect your 1AM wallet, navigate to the Dashboard, and experience the future of private finance!
