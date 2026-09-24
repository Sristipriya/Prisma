import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger } from "../contracts/managed/vaultguard/contract/index";
import { createTestCircuitContext } from "./test-context";

setNetworkId("undeployed");

describe("Prisma VaultGuard Zero-Knowledge Treasury Solvency Compiled Circuit Tests", () => {
  const dummyTreasurySig = "11".repeat(32);
  const dummyVaultSk = "22".repeat(32);
  const dummySalt = "33".repeat(32);

  it("verifies and anchors zero-knowledge solvency attestation when private reserves meet runway obligations", () => {
    // Treasury with 100,000 tNight in confidential reserves
    const contract = new Contract<void>({
      get_confidential_reserves: () => 100000n,
      compute_attestation_digest: () => "digest_ok",
    } as any);

    let ctx = createTestCircuitContext(contract);

    // Monthly burn: 15,000 tNight. Runway: 90 days. Required: (15,000 * 90) / 30 = 45,000 tNight.
    ctx = contract.impureCircuits.attestSolvency(
      ctx,
      15000n,
      90n,
      1720000000n,
      dummySalt,
      dummyTreasurySig,
      dummyVaultSk
    ).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_solvency_attestations).toBe(1n);
    expect(currentLedger.certified_runway_days).toBe(90n);
  });

  it("strictly halts and throws assertion error when treasury reserves are insufficient for runway horizon", () => {
    // Treasury with only 20,000 tNight in confidential reserves
    const contract = new Contract<void>({
      get_confidential_reserves: () => 20000n,
      compute_attestation_digest: () => "digest_ok",
    } as any);

    let ctx = createTestCircuitContext(contract);

    // Monthly burn: 20,000 tNight. Runway: 90 days. Required: (20,000 * 90) / 30 = 60,000 tNight.
    expect(() =>
      contract.impureCircuits.attestSolvency(
        ctx,
        20000n,
        90n,
        1720000000n,
        dummySalt,
        dummyTreasurySig,
        dummyVaultSk
      )
    ).toThrow("failed assert: Insolvent: Treasury reserves insufficient for requested runway");
  });

  it("increments sequential on-chain attestation count across multiple certified audit horizons", () => {
    const contract = new Contract<void>({
      get_confidential_reserves: () => 200000n,
      compute_attestation_digest: () => "digest_ok",
    } as any);

    let ctx = createTestCircuitContext(contract);

    ctx = contract.impureCircuits.attestSolvency(ctx, 10000n, 60n, 1720000000n, dummySalt, dummyTreasurySig, dummyVaultSk).context;
    ctx = contract.impureCircuits.attestSolvency(ctx, 10000n, 180n, 1720000100n, dummySalt, dummyTreasurySig, dummyVaultSk).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_solvency_attestations).toBe(2n);
  });
});
