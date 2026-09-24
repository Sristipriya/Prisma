# Prisma Protocol: Technical Architecture & Security Model

## 1. System Overview

Prisma is built on the **Midnight Network**, a hybrid programmable privacy blockchain that decouples consensus state (public ledger) from transaction execution state (private witnesses and local state).

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   Next.js 16 Enterprise DApp (TypeScript / React 19 / Tailwind CSS)     |
|   1AM / Midnight Lace Shielded Wallet Extension                         |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-------------------------------+               +-----------------------+
|  CLIENT-SIDE ZK EXECUTION     |               |    OFF-CHAIN CACHE    |
|  - Midnight Compact Runtime   |               |    - Supabase Cloud   |
|  - Proofstation (ZK Prover)   |               |    - Public Metadata  |
|  - Private Witnesses          |               |    - Stream UI States |
|  - Nullifier Generation       |               +-----------------------+
+-------------------------------+
            |
            | Finalized Proof (ZKIR + Public Disclosures)
            v
+-------------------------------------------------------------------------+
|                       MIDNIGHT PREPROD CONSENSUS                        |
|   - Midnight Compact Smart Contracts (payroll, vendor, vaultguard, etc.)|
|   - Public Ledger (Total Budgets, Disbursed Capital, Nullifier Registry)|
|   - Midnight Indexer (GraphQL Endpoint: indexer.preprod.midnight.network)|
+-------------------------------------------------------------------------+
```

---

## 2. Privacy Architecture: What Is Private vs. What Is Public

| Protocol Primitive | Private State (Client-Side Witness) | Public Ledger (Consensus State) |
|---|---|---|
| **Streaming Payroll** (`payroll.compact`) | Worker shielded address, per-second rate, unwithdrawn accrued salary balance, withdrawal timing | Total locked payroll budget, cumulative disbursed volume, nullifier commitments |
| **Vendor Settlement** (`vendor.compact`) | Vendor entity identity, itemized line items, proprietary pricing, trade secrets | Total enterprise vendor budget, aggregate settled capital, invoice nullifiers |
| **VaultGuard** (`vaultguard.compact`) | Total liquid treasury reserves, bank balances, multi-custody holdings, internal burn rate | Certified runway days (60/90/180), proof digest, attestation timestamp |
| **FlowSplit** (`flowsplit.compact`) | Sub-vault allocation percentages, destination vault addresses, personal savings goals | Cumulative routed volume, split nullifiers, 100% Value Conservation invariant |
| **StreamCredit** (`streamcredit.compact`) | Credit need, employer relationship, upcoming streaming velocity, debt redirection key | Lending pool balance, cumulative advances disbursed, advance nullifiers |
| **AuditPass** (`auditpass.compact`) | Gross income amount, itemized payroll micro-receipts, employee compensation history | Certified fiscal year, compliance proof digest, jurisdiction attestation hash |

---

## 3. Cryptographic Replay Protection: Nullifier Scheme

In traditional blockchains, transaction replay prevention relies on public account nonces. In a zero-knowledge confidentiality architecture, public nonces would deanonymize transactions by linking successive withdrawals to the same identity.

Prisma solves this using a **cryptographic nullifier scheme**:
$$\text{Nullifier} = \mathcal{H}(\text{Stream ID} \parallel \text{Sequential Nonce} \parallel \text{Worker Secret Key})$$

- When a worker initiates a withdrawal, their client witness derives the deterministic nullifier.
- The `payroll.compact` circuit asserts that the nullifier matches the witness computation and has not been previously spent.
- The public ledger records the nullifier upon settlement. Any attempt to replay the transaction fails consensus validation.

---

## 4. Compact Smart Contract Ecosystem

Prisma comprises six specialized Compact smart contracts:

1. [`contracts/payroll.compact`](file:///d:/Prsima/prisma-app/contracts/payroll.compact): Continuous streaming compensation with confidential per-second accrual and nullifier replay protection.
2. [`contracts/vendor.compact`](file:///d:/Prsima/prisma-app/contracts/vendor.compact): Confidential B2B commercial invoice settlement with single-use invoice nullifiers.
3. [`contracts/vaultguard.compact`](file:///d:/Prsima/prisma-app/contracts/vaultguard.compact): Zero-knowledge treasury solvency verification ($\text{Reserves} \ge \frac{\text{Obligations}}{30} \times \text{Runway}$).
4. [`contracts/flowsplit.compact`](file:///d:/Prsima/prisma-app/contracts/flowsplit.compact): Autonomous client-side salary redirection into private sub-vaults with strict 100% Value Conservation ($\sum p_i = 10,000 \text{ bps}$).
5. [`contracts/streamcredit.compact`](file:///d:/Prsima/prisma-app/contracts/streamcredit.compact): Collateralized instant salary advances with a strict 50% collateral ceiling and fixed 1.5% origination fee.
6. [`contracts/auditpass.compact`](file:///d:/Prsima/prisma-app/contracts/auditpass.compact): Zero-knowledge statutory tax bracket range proofs and time-bounded auditor viewing tokens.
