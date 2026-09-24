import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger } from "../contracts/managed/auditpass/contract/index";
import { createTestCircuitContext } from "./test-context";

setNetworkId("undeployed");

describe("Prisma AuditPass Zero-Knowledge Tax & Regulatory Compliance Compiled Circuit Tests", () => {
  const dummyJurisdiction = "us_ca".repeat(16);
  const dummySalt = "ee".repeat(32);
  const dummyAuthoritySig = "ff".repeat(32);
  const dummyWorkerSk = "12".repeat(32);

  it("verifies tax compliance when private gross earnings fall strictly within the statutory bracket", () => {
    // Gross income: 120,000 tNight. Bracket: [100,000, 150,000]. Withholding rate: 20% (2,000 bps).
    // Required withholding: (120,000 * 2,000) / 10,000 = 24,000. Paid: 25,000.
    const contract = new Contract<void>({
      get_confidential_tax_records: () => 120000n,
      compute_audit_attestation_digest: () => "attestation_digest_ok",
    } as any);

    let ctx = createTestCircuitContext(contract);

    ctx = contract.impureCircuits.verifyTaxCompliance(
      ctx,
      2026n,
      dummyJurisdiction,
      100000n, // bracket_min
      150000n, // bracket_max
      25000n,  // withholding_paid
      2000n,   // withholding_rate_bps (20%)
      dummySalt,
      dummyAuthoritySig,
      dummyWorkerSk
    ).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_compliance_proofs).toBe(1n);
  });

  it("strictly rejects verification when confidential income falls outside the claimed tax bracket range", () => {
    // Gross income: 160,000 tNight. Bracket: [100,000, 150,000] -> Exceeds max!
    const contract = new Contract<void>({
      get_confidential_tax_records: () => 160000n,
      compute_audit_attestation_digest: () => "attestation_digest_ok",
    } as any);

    let ctx = createTestCircuitContext(contract);

    expect(() =>
      contract.impureCircuits.verifyTaxCompliance(
        ctx,
        2026n,
        dummyJurisdiction,
        100000n,
        150000n,
        35000n,
        2000n,
        dummySalt,
        dummyAuthoritySig,
        dummyWorkerSk
      )
    ).toThrow("failed assert: Gross income exceeds declared tax bracket maximum");
  });

  it("halts verification if withholding payments are below statutory obligation", () => {
    // Gross: 120,000. Rate: 20% (24,000 required). Paid only: 20,000!
    const contract = new Contract<void>({
      get_confidential_tax_records: () => 120000n,
      compute_audit_attestation_digest: () => "attestation_digest_ok",
    } as any);

    let ctx = createTestCircuitContext(contract);

    expect(() =>
      contract.impureCircuits.verifyTaxCompliance(
        ctx,
        2026n,
        dummyJurisdiction,
        100000n,
        150000n,
        20000n, // insufficient withholding!
        2000n,
        dummySalt,
        dummyAuthoritySig,
        dummyWorkerSk
      )
    ).toThrow("failed assert: Withholding payments insufficient for statutory tax obligation");
  });
});
