# Prisma Protocol: Zero-Knowledge Circuit Specifications & Invariants

## 1. Overview of Compact Circuits

Prisma implements six specialized Zero-Knowledge circuits written in Midnight's Compact smart contract language (`pragma language_version >= 0.14.0`). Each circuit enforces strict mathematical invariants to ensure cryptographic soundness, solvency, and replay prevention without leaking underlying financial state.

---

## 2. Mathematical Circuit Specifications

### 2.1. `payroll.compact` — Continuous Streaming Payroll
- **Circuits**: `createStream`, `withdrawSalary`, `spend`
- **Invariants & Assertions**:
  1. **Employer Authority Assertion**:
     $$\text{assert}(\text{employer\_credential} == \text{employer\_vk})$$
  2. **Budget Solvency Constraint**:
     $$\text{assert}(\text{total\_disbursed} + \text{withdraw\_amount} \le \text{total\_payroll\_budget})$$
  3. **Accrual Witness Solvency**:
     $$\text{assert}(\text{withdraw\_amount} \le \text{get\_accrued\_balance}(\text{stream\_id}, \text{current\_time}))$$
  4. **Cryptographic Replay Protection**:
     $$\text{assert}(\text{nullifier} == \text{generate\_withdrawal\_nullifier}(\text{stream\_id}, \text{nonce}, \text{worker\_sk}))$$
     $$\text{assert}(\text{nullifier} \ne \text{last\_nullifier})$$

---

### 2.2. `vendor.compact` — Confidential B2B Vendor Settlement
- **Circuits**: `settleInvoice`, `spend`
- **Invariants & Assertions**:
  1. **Payer Signature Verification**:
     $$\text{assert}(\text{payer\_auth\_sig} == \text{payer\_authority\_vk})$$
  2. **Vendor Membership Assertion**:
     $$\text{assert}(\text{get\_vendor\_credential}(\text{vendor\_sk}) \ne \vec{0})$$
  3. **Invoice Nullifier & Double-Payment Defense**:
     $$\text{assert}(\text{invoice\_nullifier} == \text{compute\_invoice\_nullifier}(\text{invoice\_id}, \text{amount}, \text{vendor\_sk}))$$
     $$\text{assert}(\text{invoice\_nullifier} \ne \text{last\_settled\_nullifier})$$
  4. **Vendor Budget Ceiling**:
     $$\text{assert}(\text{total\_settled} + \text{invoice\_amount} \le \text{total\_vendor\_budget})$$

---

### 2.3. `vaultguard.compact` — Zero-Knowledge Treasury Solvency
- **Circuits**: `attestSolvency`, `spend`
- **Invariants & Assertions**:
  1. **Treasury Authority Check**:
     $$\text{assert}(\text{treasury\_sig} == \text{employer\_treasury\_vk})$$
  2. **Mathematical Solvency Invariant**:
     $$\text{assert}((\text{private\_reserves} \times 30) \ge (\text{monthly\_obligations} \times \text{runway\_days}))$$
  3. **Zero Knowledge Disclosure**:
     Only `certified_runway_days` and `attestation_digest` are disclosed; exact private reserve balances remain hidden in the client witness.

---

### 2.4. `flowsplit.compact` — Autonomous Stream Routing
- **Circuits**: `executeFlowSplit`, `spend`
- **Invariants & Assertions**:
  1. **100.00% Value Conservation Invariant**:
     $$\sum_{i=1}^4 p_i = p_{\text{liquid}} + p_{\text{tax}} + p_{\text{savings}} + p_{\text{emergency}} = 10,000 \text{ basis points}$$
     $$\text{assert}(\text{total\_bps} == 10000)$$
  2. **Epoch Split Nullifier**:
     $$\text{assert}(\text{split\_nullifier} \ne \text{last\_split\_nullifier})$$

---

### 2.5. `streamcredit.compact` — Collateralized Salary Advances
- **Circuits**: `disburseSalaryAdvance`, `spend`
- **Invariants & Assertions**:
  1. **50% Collateral Ceiling**:
     $$\text{assert}(\text{requested\_amount} \times 2 \le \text{unaccrued\_salary})$$
  2. **Fixed Non-Predatory Fee Calculation**:
     $$\text{fee} = \frac{\text{requested\_amount} \times 150}{10,000} \quad (1.5\%)$$
  3. **Advance Replay Nullifier**:
     $$\text{assert}(\text{advance\_nullifier} \ne \text{last\_advance\_nullifier})$$

---

### 2.6. `auditpass.compact` — ZK Tax & Regulatory Compliance
- **Circuits**: `verifyTaxCompliance`, `spend`
- **Invariants & Assertions**:
  1. **Range Proof (Bracket Membership)**:
     $$\text{assert}(\text{bracket\_min} \le \text{gross\_income} \le \text{bracket\_max})$$
  2. **Statutory Withholding Satisfaction**:
     $$\text{assert}(\text{withholding\_paid} \times 10,000 \ge \text{gross\_income} \times \text{withholding\_rate\_bps})$$
