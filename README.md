<div align="center">
  <img src="./public/Screenshot/landing-page.png" alt="Prisma Landing Page" width="100%" />
</div>

<br />

# Prisma: ZK-Secured Payroll & Vendor Settlement

This project is built on the [Midnight Network](https://midnight.network/).

[![Generic badge](https://img.shields.io/badge/Compact%20Compiler-0.30.0-1abc9c.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Network-Preprod-8b5cf6.svg)](https://shields.io/)

> **Prisma** is a next-generation decentralized payroll and vendor settlement application.
> It leverages the power of Midnight's Zero-Knowledge (ZK) proofs to allow companies to stream salaries and settle invoices with absolute privacy, while still ensuring verifiable execution on a public ledger.

## ?? Platform Showcase

### 1. Dashboard & Real-Time Analytics
*Monitor your proof generation volume and ledger state securely.*
<img src="./public/Screenshot/Dashboard.png" alt="Dashboard" width="100%" />
<img src="./public/Screenshot/zk-analysis.png" alt="ZK Analysis" width="100%" />

### 2. Payroll Smart Contracts (Midnight Preprod)
*Employers can deploy mathematically verified payroll contracts.*
* **Verified Contract Link:** [View on Midnight Explorer](https://explorer.preprod.midnight.network/)
<img src="./public/Screenshot/payroll-contract.png" alt="Payroll Contract Execution" width="100%" />

### 3. Shielded Vendor Settlement
*Pay external vendors confidentially using the 1AM wallet.*
* **Verified Transaction Link:** [View on Midnight Explorer](https://explorer.preprod.midnight.network/)
<img src="./public/Screenshot/vendor-invoice.png" alt="Vendor Invoice Settlement" width="100%" />
<img src="./public/Screenshot/vendor-contract.png" alt="Vendor Contract Deployment" width="100%" />

### 4. Client-Side Circuit Execution & Compilation
*Zero-Knowledge proofs are generated and verified entirely locally in the browser before being broadcasted.*
<img src="./public/Screenshot/compile.png" alt="Compile Terminal Output" width="100%" />
<img src="./public/Screenshot/proof-verification.png" alt="Client Side ZK Verification" width="100%" />

### 5. Automated CI/CD & Testing
*Automated GitHub Actions workflow validating contract compilation and Vitest execution.*
<img src="./public/Screenshot/ci-cd.png" alt="CI CD Pipeline" width="100%" />
<img src="./public/Screenshot/vite-test.png" alt="Vite Testing" width="100%" />

---

## ??? Project Structure

```text
prisma-app/
+-- app/                  # Next.js 14 App Router (React)
+-- components/           # Shared UI components and Wallet Context
+-- contracts/            # Smart contracts written in the Compact language
¦   +-- payroll.compact   # Working spending limit circuit
¦   +-- vendor.compact    # Working vendor circuit
+-- lib/                  # Utilities (Midnight SDK integrations, Supabase DB)
+-- public/               # Static assets & Compiled ZK Prover/Verifier keys
```

## ?? Prerequisites

1. **Node.js** (v24+ recommended)
2. **1AM Wallet or Lace Wallet** (Connected to Midnight Preprod)
3. **Docker** (Required for the `proof-server` container for local client-side proving)

## ??? Quick Start

### 1. Start the Midnight Proof Server
The client-side Midnight SDK requires a local proof server to compute the zero-knowledge proofs.
```bash
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0
```

### 2. Install & Run
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the DApp. Ensure your 1AM wallet is connected to the Preprod network to authorize transactions.
