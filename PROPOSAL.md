# Prisma: Zero-Knowledge Payroll & Shielded Settlement Protocol
## Official Product Proposal (Level 4–6 Roadmap)

---

## 1. Product and Users

### 1.1 Product Vision & Core Value Proposition
**Prisma** is a decentralized, privacy-preserving financial streaming and B2B vendor settlement protocol built natively on the **Midnight Privacy Blockchain**. It allows corporations, DAOs, and global enterprises to stream salaries continuously in real-time and settle commercial invoices with absolute mathematical confidentiality. 

By leveraging client-side Zero-Knowledge (ZK) proofs, Prisma mathematically proves that payroll streaming rules, time-locked unlock rates, and vendor spending limits are strictly honored without disclosing employee compensation, worker identities, unwithdrawn balances, or corporate treasury holdings on the public ledger.

### 1.2 Target User Segments
1. **Global Remote Enterprises & Tech Companies:** Multinational firms that need to stream compensation to global workforces without exposing internal salary bands, executive bonuses, or company treasury runway to competitors.
2. **Freelancers, Contractors & Gig Economy Workers:** Millions of independent workers who demand immediate, second-by-second access to earned wages rather than waiting for outdated 30-day pay cycles, while maintaining complete personal financial privacy.
3. **B2B Procurement & Vendor Operations:** Enterprises executing commercial supplier payments that require confidentiality to protect negotiated volume discounts, vendor relationships, and sensitive supply chain architectures.
4. **Web3 Native Foundations & DAOs:** Decentralized organizations that require trustless, non-custodial treasury distribution without publicly exposing individual contributor wallet balances or voting power.

### 1.3 Real-World Problem Being Solved
* **The Public Ledger Wage Leak:** On traditional blockchains (Ethereum, Solana), all transactions are permanently transparent. Streaming payroll publicly exposes employee salaries to coworkers, competitors, and predatory recruiters.
* **The B2B Commercial Exposure:** Public invoice settlements leak corporate pricing agreements and supplier networks to competitors and MEV searchers.
* **The Centralization & Custody Trap:** Traditional Web2 payroll providers (Deel, ADP, Gusto) charge 3–5% international transfer/FX fees, hold funds in centralized bank escrows, and store sensitive employee data in vulnerable centralized databases.

---

## 2. Why Midnight Specifically?

Prisma cannot be built on traditional public blockchains or standard centralized databases. Midnight's unique architectural design is the only platform capable of satisfying enterprise payroll requirements:

### 2.1 Limitations of Public Blockchains (Ethereum, Solana)
Public smart contracts execute on completely transparent state. Any attempt to stream payroll or settle invoices on-chain permanently exposes:
* Individual employee wallet addresses and compensation rates.
* Total corporate treasury reserves and financial runway.
* Commercial supplier agreements and invoice payment histories.

Zero-Knowledge solutions on Ethereum (e.g., Tornado-style mixers) only obscure past transfers but cannot execute stateful, time-decay streaming logic or multi-party spending constraints.

### 2.2 Limitations of Centralized Web2 Solutions
Centralized payroll processors maintain privacy only by acting as trusted intermediaries. This introduces:
* High intermediary processing and cross-border currency conversion fees (3–5%).
* Multi-day settlement delays and bank clearance holding periods.
* Single-point-of-failure security risks where database breaches expose employee identities, social security numbers, and bank credentials.

### 2.3 Midnight’s Unique Cryptographic Advantage
Midnight solves the trilemma of privacy, regulatory compliance, and decentralized execution through:
1. **Dual-State Architecture:** Midnight cleanly bifurcates computation into public ledger state (verified by global network consensus) and private state (computed locally inside user-side ZK circuits).
2. **Native Compact Smart Contracts:** Midnight's Compact language allows developers to write mathematically verifiable circuits that enforce private constraints (e.g., `withdrawn_amount <= accrued_allowance`) directly at the protocol level.
3. **Client-Side Proving via 1AM / Lace Wallet:** The worker's device proves entitlement to funds locally using the Midnight Proof Server. Sensitive parameters (salary rate, withdrawal quantity, and worker identity) never leave the browser.
4. **Consensus-Enforced Integrity:** Midnight validators cryptographically verify the submitted ZK-SNARK before state transition. If an unauthorized spend or invalid calculation occurs, the transaction is rejected at the consensus layer.

---

## 3. Data Model: Public State, Private Witness & Selective Disclosure

Prisma leverages Midnight's dual-state cryptographic engine to strictly separate what the public network verifies from what remains private to the user:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRISMA DATA MODEL                              │
├──────────────────────────────────────┬──────────────────────────────────────┤
│      PUBLIC LEDGER STATE             │        PRIVATE WITNESS STATE         │
│   (Consensus-Verified On-Chain)      │      (Client-Side Shielded Proof)    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Smart Contract Address             │ • Worker Shielded Coin Public Key    │
│ • State Commitment / Nullifier Root  │ • Worker Encryption Public Key       │
│ • Cryptographic Proof Validity Flag  │ • Exact Salary Rate per Second       │
│ • Block Height & Timestamp           │ • Total Contract Allocation Sum      │
│ • Protocol-Level Settlement Status   │ • Accrued Unwithdrawn Balance        │
│                                      │ • Vendor Identity & Line Items       │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 3.1 Public Ledger State (On-Chain)
The public ledger records only the mathematical verification of validity:
* **Contract Address:** The unique address identifying the deployed Compact contract instance (`0x6db328...`).
* **Commitment Anchors & Nullifiers:** Cryptographic accumulators that prevent double-withdrawals while concealing which stream or worker is interacting.
* **Proof Verification:** The on-chain consensus validates the Zero-Knowledge SNARK proof attached to the transaction.
* **Transaction Metadata:** Block timestamp and transaction hash confirming execution.

### 3.2 Private Witness State (Client-Side)
All sensitive financial and identity parameters remain strictly local within the user's 1AM wallet:
* **Employee / Vendor Identity:** Shielded public keys (`coinPublicKey`, `encryptionPublicKey`) that are never published in plaintext.
* **Compensation Metrics:** The rate of pay per second, total vesting schedule, and exact withdrawal amount.
* **Treasury Balances:** The unwithdrawn balance remaining inside the employer's shielded allocation pool.
* **Commercial Metadata:** Invoice IDs, itemized service descriptions, and contractor rate tables.

### 3.3 Selective Disclosure & Regulatory Compliance
Enterprise payroll requires strict compliance with international tax authorities and corporate audits. Prisma solves this through **Cryptographic View-Keys**:
* **Audit View-Keys:** Employers and workers can generate cryptographic view-keys to grant accountants, auditors, or tax authorities selective read access to specific historical transactions.
* **Zero-Knowledge Tax Attestations:** Workers can generate mathematical proofs confirming income tax liability calculations without disclosing their entire balance history or employer identity to third parties.

---

## 4. Mainnet Feasibility by Level 6

Prisma is architected for a structured progression from our current working Preprod MVP into a fully audited, enterprise-scale production protocol ready for **Midnight Mainnet deployment by Level 6**:

### 4.1 Development Milestones (Levels 4–6)

#### **Level 4: Multi-Stream Engine & Developer SDK**
* **Massive Parallel Payroll Orchestration:** Scale our Compact contracts to support hierarchical batch deployments (streaming to 1,000+ workers simultaneously in a single atomic transaction).
* **Prisma Payroll SDK (`@prisma-zk/sdk`):** Release a modular TypeScript SDK allowing traditional Web2 HRIS platforms (Workday, Deel, Rippling) to integrate Midnight ZK payroll in under 10 lines of code.
* **Sub-Second Prover Integration:** Implement browser WebAssembly prover workers to accelerate proof generation times to under 1 second.

#### **Level 5: Advanced Compensation Circuits & ERP Connectors**
* **Vesting Cliffs & Discretionary Bonuses:** Extend Compact circuits to support complex corporate compensation packages (milestone-based token vesting cliffs, performance bonuses, and dynamic multi-sig rebalancing).
* **Zero-Knowledge Solvency Engine:** Automated proof of reserve generation enabling companies to mathematically prove payroll solvency ($\ge \text{required obligations}$) to employees and auditors.
* **Off-Chain Indexer Scaling:** High-throughput Supabase and GraphQL indexers for real-time analytics across millions of simultaneous streaming micro-transactions.

#### **Level 6: Security Audits & Midnight Mainnet Launch**
* **Formal Verification & Cryptographic Audits:** Complete comprehensive third-party smart contract audits and formal verification of all Compact circuits.
* **Mainnet Deployment:** Transition contract infrastructure from Midnight Preprod to Midnight Mainnet.
* **Fiat Off-Ramp Gateway:** Partner with licensed payment service providers to enable direct zero-knowledge conversion from streamed tokens to local fiat bank accounts.

### 4.2 Scalability & Performance Targets
* **Target Throughput:** Support 100,000+ active daily streaming transactions.
* **Client Proof Generation Time:** < 800 milliseconds in standard web browsers.
* **Transaction Finality:** Sub-5 second settlement on Midnight consensus.
* **Gas & Proving Cost:** Micro-cents per streaming withdrawal, making real-time per-second pay economically viable.

---

*Prisma brings mathematical privacy and real-time financial freedom to the global workforce on Midnight Network.*