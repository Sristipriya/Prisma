# Prisma Protocol: End-to-End User & Operational Guide

Welcome to the comprehensive operational usage guide for **Prisma**, the enterprise-grade confidential payroll, B2B vendor settlement, and zero-knowledge liquidity protocol natively built on the **Midnight Network**.

---

## Table of Contents
1. [Prerequisites & Wallet Setup](#1-prerequisites--wallet-setup)
2. [Connecting to Midnight Preprod](#2-connecting-to-midnight-preprod)
3. [Confidential Payroll Streaming (`/payroll`)](#3-confidential-payroll-streaming-payroll)
4. [Confidential B2B Vendor Settlement (`/vendor`)](#4-confidential-b2b-vendor-settlement-vendor)
5. [Worker Claim & Streaming Portal (`/worker-portal`)](#5-worker-claim--streaming-portal-worker-portal)
6. [VaultGuard: ZK Treasury Solvency Attestations (`/vaultguard`)](#6-vaultguard-zk-treasury-solvency-attestations-vaultguard)
7. [FlowSplit: Autonomous Sub-Vault Stream Routing (`/flowsplit`)](#7-flowsplit-autonomous-sub-vault-stream-routing-flowsplit)
8. [StreamCredit: Collateralized Salary Advances (`/streamcredit`)](#8-streamcredit-collateralized-salary-advances-streamcredit)
9. [AuditPass: ZK Tax Compliance & Viewing Keys (`/auditpass`)](#9-auditpass-zk-tax-compliance--viewing-keys-auditpass)
10. [On-Chain Verification on Midnight Explorer](#10-on-chain-verification-on-midnight-explorer)

---

## 1. Prerequisites & Wallet Setup

To interact with Prisma on Midnight Preprod, you will need:
- **Google Chrome / Chromium-based Browser** (Brave, Edge).
- **Midnight-Compatible Shielded Wallet**:
  - **1AM Wallet Extension** (recommended for Preprod dApps) or **Midnight Lace Extension**.
- **Preprod tNight Tokens**:
  - Obtain test tokens from the official Midnight Testnet Faucet or community faucet dispenser.
- **Node.js 18+ & npm** (if running the dApp locally).

### Installing the 1AM Wallet Extension
1. Install the 1AM wallet browser extension from the official Midnight Developer portal or Chrome Web Store.
2. Initialize or restore your wallet with your recovery phrase.
3. Switch the network selector within the wallet to **Preprod Testnet**.
4. Confirm your Shielded Coin Public Key and Shielded Encryption Public Key are generated.

---

## 2. Connecting to Midnight Preprod

1. Navigate to the live Prisma deployment: [https://prisma-pi-steel.vercel.app](https://prisma-pi-steel.vercel.app) or launch locally (`npm run dev`).
2. Click **Connect Wallet** in the top navigation bar.
3. Select **1AM Wallet** or **Lace Wallet** when prompted.
4. Approve the connection modal in your extension.
5. Once connected, your shielded address will appear in the top-right header, and proof-generation capabilities will activate automatically.

---

## 3. Confidential Payroll Streaming (`/payroll`)

Prisma allows employers to deploy per-second streaming compensation where individual employee rates, balances, and withdrawal frequencies are kept 100% confidential in client-side ZK witnesses.

### Step-by-Step Flow:
1. Navigate to **Payroll Streams** in the sidebar.
2. Click **Create Stream** to open the allocation modal.
3. Select an authenticated employee profile from the directory or input their shielded Midnight address.
4. Input the total monthly allocation (e.g., `5,000 tNight`).
5. Click **Deploy Shielded Stream**:
   - The dApp compiles the `payroll.compact` circuit context.
   - The 1AM wallet generates a zero-knowledge proof binding the employer's dynamic credential and locking the funds into the on-chain stream pool.
   - Consensus anchors the transaction on Midnight Preprod.
6. The active stream appears in real-time with continuous per-second micro-accrual.

---

## 4. Confidential B2B Vendor Settlement (`/vendor`)

Enterprise vendor invoices can be settled instantly without exposing vendor entity identities, itemized deliverables, or commercial terms to the public ledger.

### Step-by-Step Flow:
1. Navigate to **Vendor Settlement** in the sidebar.
2. Click **Settle Invoice**.
3. Input:
   - **Invoice Reference ID** (e.g., `INV-2026-0891`).
   - **Vendor Shielded Address** (Midnight public key).
   - **Settlement Amount** (e.g., `12,500 tNight`).
4. Click **Initiate Shielded Settlement**:
   - The `vendor.compact` circuit verifies that the vendor credential is valid and that the settlement amount is within enterprise limits.
   - Generates a single-use invoice nullifier preventing double-payment or replay attacks.
   - Submits the finalized transaction to Midnight Preprod consensus.

---

## 5. Worker Claim & Streaming Portal (`/worker-portal`)

Workers access an autonomous portal where they can monitor real-time micro-accruals and claim unlocked earnings at any time.

### Step-by-Step Flow:
1. Connect wallet with the worker's shielded key.
2. View real-time accrued balance ticking upward every second.
3. Click **Withdraw Earnings**:
   - Enter desired withdrawal amount (up to accrued balance).
   - The client-side witness queries accrued salary, asserts solvency, and computes a unique withdrawal nullifier.
   - Submits proof to the `payroll.compact` contract on Preprod.
   - Disburses funds directly to the worker's wallet without employer notification.

---

## 6. VaultGuard: ZK Treasury Solvency Attestations (`/vaultguard`)

Enterprise treasuries prove mathematical solvency without disclosing actual liquid balances, multi-custody reserves, or internal burn rates.

### Step-by-Step Flow:
1. Navigate to **VaultGuard** in the sidebar.
2. Select your desired runway horizon:
   - **60 Days**, **90 Days**, or **180 Days**.
3. VaultGuard aggregates active monthly payroll obligations and vendor commitments.
4. Click **Synthesize ZK Solvency Proof**:
   - Executes `vaultguard.compact` circuit.
   - Asserts mathematical invariant: $\text{Private Reserves} \ge \frac{\text{Monthly Obligations}}{30} \times \text{Runway Days}$.
   - Anchors cryptographic solvency attestation on Midnight consensus.
5. Download or share the public attestation hash with stakeholders, investors, or insurers.

---

## 7. FlowSplit: Autonomous Sub-Vault Stream Routing (`/flowsplit`)

Enables workers to configure confidential rules diverting incoming streaming velocity into segregated private sub-vaults (Tax, Savings, Liquid, Emergency).

### Step-by-Step Flow:
1. Navigate to **FlowSplit** in the sidebar.
2. Configure desired percentage allocations across buckets:
   - Example: 50% Liquid Wallet, 25% Tax Escrow, 15% High-Yield Savings, 10% Emergency Fund.
3. The interface enforces the **100.00% Value Conservation Invariant** (10,000 basis points).
4. Click **Deploy ZK Route**:
   - Executes `flowsplit.compact` circuit.
   - Binds sub-vault shielded commitments in private local state.
   - Upcoming streaming salary is diverted at the protocol level with zero leak to employers.

---

## 8. StreamCredit: Collateralized Salary Advances (`/streamcredit`)

Workers access instant zero-interest liquidity advances collateralized by future streaming wages.

### Step-by-Step Flow:
1. Navigate to **StreamCredit** in the sidebar.
2. View maximum borrowing capacity, strictly bounded by the **50% Unaccrued Collateral Ceiling**.
3. Input requested advance amount and select repayment horizon (7, 14, or 30 days).
4. Review transparent 1.5% fixed origination fee (0% predatory APR).
5. Click **Disburse Advance**:
   - Executes `streamcredit.compact` circuit.
   - Enforces collateral ceiling and generates an advance nullifier.
   - Net liquidity is credited to worker immediately; upcoming stream ticks automatically amortize the advance.

---

## 9. AuditPass: ZK Tax Compliance & Viewing Keys (`/auditpass`)

Workers and enterprises prove statutory tax compliance, jurisdiction bracket membership, and statutory withholding without exposing gross income or itemized records.

### Step-by-Step Flow:
1. Navigate to **AuditPass** in the sidebar.
2. Select Tax Year (`2026`) and Jurisdiction (`United States - Federal / State`).
3. Select Income Bracket and input declared statutory withholding rate.
4. Click **Generate ZK Tax Attestation**:
   - Executes `auditpass.compact` circuit.
   - Proves confidential gross earnings fall strictly within the declared bracket range.
   - Verifies withholding payments meet statutory requirements.
   - Anchors compliance record on Midnight Preprod.
5. Optionally issue **Scoped Auditor Viewing Grants** with time-bounded expiration tokens for external CPA and regulatory review.

---

## 10. On-Chain Verification on Midnight Explorer

Every transaction, contract deployment, and zero-knowledge proof produced by Prisma is anchored to the Midnight Preprod Network.

- **Preprod Explorer**: [https://preprod.midnightexplorer.com](https://preprod.midnightexplorer.com)
- **Deployed Payroll Stream Contract**:
  - Address: `6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f`
  - Explorer Link: [View Contract on Midnight Preprod](https://preprod.midnightexplorer.com/contracts/6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f)
- **Verified Genesis Settlement Proof**:
  - Transaction Hash: `0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19`
  - Explorer Link: [View Transaction on Midnight Preprod](https://preprod.midnightexplorer.com/transactions/0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19)
