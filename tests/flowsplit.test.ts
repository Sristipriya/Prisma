import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger } from "../contracts/managed/flowsplit/contract/index";
import { createTestCircuitContext } from "./test-context";

setNetworkId("undeployed");

describe("Prisma FlowSplit Zero-Knowledge Stream Routing Compiled Circuit Tests", () => {
  const dummyStreamId = "44".repeat(32);
  const dummySplitNullifier = "55".repeat(32);
  const dummyWorkerSig = "66".repeat(32);
  const dummyWorkerSk = "77".repeat(32);

  const mockWitnesses = {
    get_subvault_commitments: () => "vault_commitments_ok",
    compute_split_nullifier: () => dummySplitNullifier,
  };

  it("executes confidential stream routing when allocations satisfy the 100.00% Value Conservation Invariant (10,000 bps)", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract);

    // 50% Liquid, 25% Tax, 15% Savings, 10% Emergency = 100% (10,000 bps)
    ctx = contract.impureCircuits.executeFlowSplit(
      ctx,
      dummyStreamId,
      5000n, // tick amount
      5000n, // 50%
      2500n, // 25%
      1500n, // 15%
      1000n, // 10%
      1n,
      dummySplitNullifier,
      dummyWorkerSig,
      dummyWorkerSk
    ).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_routed_volume).toBe(5000n);
  });

  it("strictly rejects allocation configurations that violate the 100% Value Conservation Invariant", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract);

    // 50% + 25% + 15% + 5% = 95% (9,500 bps - leak detected)
    expect(() =>
      contract.impureCircuits.executeFlowSplit(
        ctx,
        dummyStreamId,
        5000n,
        5000n,
        2500n,
        1500n,
        500n, // 9,500 bps total
        1n,
        dummySplitNullifier,
        dummyWorkerSig,
        dummyWorkerSk
      )
    ).toThrow("failed assert: Value Conservation Invariant Violated: Allocations must sum to 100.00% (10,000 bps)");
  });

  it("prevents double-routing replay attacks for the same stream tick epoch", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract);

    ctx = contract.impureCircuits.executeFlowSplit(
      ctx,
      dummyStreamId,
      2500n,
      5000n,
      2500n,
      1500n,
      1000n,
      1n,
      dummySplitNullifier,
      dummyWorkerSig,
      dummyWorkerSk
    ).context;

    // Second routing call with duplicate split nullifier must be blocked
    expect(() =>
      contract.impureCircuits.executeFlowSplit(
        ctx,
        dummyStreamId,
        2500n,
        5000n,
        2500n,
        1500n,
        1000n,
        1n,
        dummySplitNullifier,
        dummyWorkerSig,
        dummyWorkerSk
      )
    ).toThrow("failed assert: Duplicate tick route execution detected");
  });
});
