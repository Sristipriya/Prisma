import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger } from "../contracts/managed/streamcredit/contract/index";
import { createTestCircuitContext } from "./test-context";

setNetworkId("undeployed");

describe("Prisma StreamCredit Collateralized Salary Advance Compiled Circuit Tests", () => {
  const dummyStreamId = "88".repeat(32);
  const dummyAdvanceNullifier = "99".repeat(32);
  const dummyPoolSig = "aa".repeat(32);
  const dummyWorkerSk = "bb".repeat(32);

  const mockWitnesses = {
    get_unaccrued_salary_collateral: () => 10000n, // 10,000 tNight unaccrued future salary
    compute_advance_nullifier: () => dummyAdvanceNullifier,
  };

  it("disburses salary advance within the strict 50% unaccrued salary collateral ceiling", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract);

    // Requesting 4,000 tNight on 10,000 tNight collateral (40% <= 50% max)
    ctx = contract.impureCircuits.disburseSalaryAdvance(
      ctx,
      dummyStreamId,
      4000n,
      1n,
      dummyAdvanceNullifier,
      dummyPoolSig,
      dummyWorkerSk
    ).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_advances_disbursed).toBe(4000n);
  });

  it("strictly halts advance requests exceeding the 50% collateral ceiling", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract);

    // Requesting 6,000 tNight on 10,000 tNight collateral (60% > 50% ceiling)
    expect(() =>
      contract.impureCircuits.disburseSalaryAdvance(
        ctx,
        dummyStreamId,
        6000n,
        1n,
        dummyAdvanceNullifier,
        dummyPoolSig,
        dummyWorkerSk
      )
    ).toThrow("failed assert: Exceeds 50% unaccrued salary collateral ceiling");
  });

  it("blocks duplicate advance claims using single-use advance nullifiers", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract);

    ctx = contract.impureCircuits.disburseSalaryAdvance(
      ctx,
      dummyStreamId,
      3000n,
      1n,
      dummyAdvanceNullifier,
      dummyPoolSig,
      dummyWorkerSk
    ).context;

    // Second disbursement with the same nullifier must fail
    expect(() =>
      contract.impureCircuits.disburseSalaryAdvance(
        ctx,
        dummyStreamId,
        3000n,
        1n,
        dummyAdvanceNullifier,
        dummyPoolSig,
        dummyWorkerSk
      )
    ).toThrow("failed assert: Replay detected: salary advance already claimed for this nonce");
  });
});
