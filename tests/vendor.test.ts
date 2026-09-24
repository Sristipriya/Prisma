import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger } from "../contracts/managed/vendor/contract/index";
import { createTestCircuitContext } from "./test-context";

setNetworkId("undeployed");

describe("Prisma Vendor Settlement Compiled Compact Circuit Tests", () => {
  const dummyInvoiceId = "02".repeat(32);
  const dummyNullifier = "dd".repeat(32);
  const dummyPayerAuth = "ee".repeat(32);
  const dummyVendorSk = "ff".repeat(32);

  const mockWitnesses = {
    get_vendor_credential: (_ctx: any, _sk: any) => "vendor_credential_ok",
    compute_invoice_nullifier: (_ctx: any, _id: any, _amt: any, _sk: any) => dummyNullifier,
  };

  it("settles invoice securely within vendor allocation budget", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    ctx = contract.impureCircuits.settleInvoice(
      ctx,
      dummyInvoiceId,
      45000n,
      dummyNullifier,
      dummyPayerAuth,
      dummyVendorSk
    ).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_spent).toBe(45000n);
    expect(currentLedger.total_settled).toBe(45000n);
  });

  it("blocks invoice settlement if it exceeds the vendor allocation budget", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 50000n);

    ctx = contract.impureCircuits.settleInvoice(
      ctx,
      dummyInvoiceId,
      45000n,
      dummyNullifier,
      dummyPayerAuth,
      dummyVendorSk
    ).context;

    const dummyInvoice2 = "03".repeat(32);
    const dummyNullifier2 = "d2".repeat(32);

    expect(() =>
      contract.impureCircuits.settleInvoice(
        ctx,
        dummyInvoice2,
        6000n,
        dummyNullifier2,
        dummyPayerAuth,
        dummyVendorSk
      )
    ).toThrow("failed assert: Insufficient enterprise vendor budget");
  });

  it("enforces single-use invoice nullifiers to prevent duplicate payments", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    ctx = contract.impureCircuits.settleInvoice(
      ctx,
      dummyInvoiceId,
      20000n,
      dummyNullifier,
      dummyPayerAuth,
      dummyVendorSk
    ).context;

    // Duplicate invoice settlement attempt with same nullifier must fail
    expect(() =>
      contract.impureCircuits.settleInvoice(
        ctx,
        dummyInvoiceId,
        20000n,
        dummyNullifier,
        dummyPayerAuth,
        dummyVendorSk
      )
    ).toThrow("failed assert: Double-settlement detected: invoice already paid");
  });

  it("supports canonical spend circuit for indexer and backward compatibility", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 50000n);

    ctx = contract.impureCircuits.spend(ctx, 10000n).context;
    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_spent).toBe(10000n);
  });
});
