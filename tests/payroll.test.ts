import { describe, it, expect } from "vitest";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger } from "../contracts/managed/payroll/contract/index";
import { createTestCircuitContext } from "./test-context";

setNetworkId("undeployed");

describe("Prisma Payroll Compiled Compact Circuit Tests", () => {
  const dummyStreamId = "01".repeat(32);
  const dummyEmployerAuth = "aa".repeat(32);
  const dummyWorkerSk = "bb".repeat(32);
  const dummyNullifier = "cc".repeat(32);
  const dummyWorkerSig = "dd".repeat(32);

  const mockWitnesses = {
    get_worker_credential: (_ctx: any, _sk: any) => "credential_ok",
    get_accrued_balance: (_ctx: any, _id: any, _time: any) => 25000n,
    generate_withdrawal_nullifier: (_ctx: any, _id: any, _nonce: any, _sk: any) => dummyNullifier,
  };

  it("processes confidential payroll spending within authorized budget", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 50000n);

    ctx = contract.impureCircuits.spend(ctx, 15000n).context;
    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_spent).toBe(15000n);
    expect(currentLedger.total_disbursed).toBe(15000n);
  });

  it("halts payroll if total budget limit is exceeded without leaking individual salary", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 20000n);

    ctx = contract.impureCircuits.spend(ctx, 15000n).context;
    expect(() => contract.impureCircuits.spend(ctx, 6000n)).toThrow("failed assert: Spending limit exceeded");
  });

  it("registers a new streaming payroll allocation within budget limits", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    ctx = contract.impureCircuits.createStream(ctx, dummyStreamId, 30000n, dummyEmployerAuth).context;
    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.active_streams).toBe(1n);
  });

  it("executes confidential worker withdrawal against accrued salary witness", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    ctx = contract.impureCircuits.withdrawSalary(
      ctx,
      dummyStreamId,
      10000n,
      dummyNullifier,
      dummyWorkerSk,
      1720000000n,
      1n,
      dummyWorkerSig
    ).context;

    const currentLedger = ledger(ctx.currentQueryContext.state);
    expect(currentLedger.total_disbursed).toBe(10000n);
  });

  it("detects and blocks withdrawal nullifier replay attacks", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    ctx = contract.impureCircuits.withdrawSalary(
      ctx,
      dummyStreamId,
      5000n,
      dummyNullifier,
      dummyWorkerSk,
      1720000000n,
      1n,
      dummyWorkerSig
    ).context;

    // Second withdrawal with same nullifier must fail
    expect(() =>
      contract.impureCircuits.withdrawSalary(
        ctx,
        dummyStreamId,
        5000n,
        dummyNullifier,
        dummyWorkerSk,
        1720000000n,
        1n,
        dummyWorkerSig
      )
    ).toThrow("failed assert: Nullifier replay detected: transaction already settled in consensus history");
  });

  it("enforces persistent nullifier replay defense across multiple subsequent transactions", () => {
    const contract = new Contract<void>(mockWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    const nullifier1 = "01".repeat(32);
    const nullifier2 = "02".repeat(32);

    // Transaction 1 with nullifier1
    ctx = contract.impureCircuits.withdrawSalary(
      ctx,
      dummyStreamId,
      3000n,
      nullifier1,
      dummyWorkerSk,
      1720000000n,
      1n,
      dummyWorkerSig
    ).context;

    // Transaction 2 with nullifier2 (different nullifier succeeds)
    ctx = contract.impureCircuits.withdrawSalary(
      ctx,
      dummyStreamId,
      3000n,
      nullifier2,
      dummyWorkerSk,
      1720000001n,
      2n,
      dummyWorkerSig
    ).context;

    // Transaction 3 attempting to re-use nullifier1 MUST fail
    // (Proves nullifier history is persistent, not just tracking the latest nullifier)
    expect(() =>
      contract.impureCircuits.withdrawSalary(
        ctx,
        dummyStreamId,
        3000n,
        nullifier1,
        dummyWorkerSk,
        1720000002n,
        3n,
        dummyWorkerSig
      )
    ).toThrow("failed assert: Nullifier replay detected: transaction already settled in consensus history");
  });

  it("rejects unauthorized employer stream creation when cryptographic signature fails", () => {
    const witnessesWithFailingSig = {
      ...mockWitnesses,
      verify_employer_signature: () => false, // Invalid signature
    };
    const contract = new Contract<void>(witnessesWithFailingSig as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    expect(() =>
      contract.impureCircuits.createStream(ctx, dummyStreamId, 20000n, "invalid_sig")
    ).toThrow("failed assert: Cryptographic authorization failed: Invalid employer signature");
  });

  it("rejects unauthorized worker withdrawal when cryptographic signature verification fails", () => {
    const witnessesWithFailingWorkerSig = {
      ...mockWitnesses,
      verify_worker_signature: () => false, // Invalid signature
    };
    const contract = new Contract<void>(witnessesWithFailingWorkerSig as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    expect(() =>
      contract.impureCircuits.withdrawSalary(
        ctx,
        dummyStreamId,
        5000n,
        dummyNullifier,
        dummyWorkerSk,
        1720000000n,
        1n,
        "invalid_worker_sig"
      )
    ).toThrow("failed assert: Cryptographic authorization failed: Invalid worker signature");
  });

  it("halts withdrawal if requested amount exceeds authenticated accrued stream entitlement", () => {
    const limitedWitnesses = {
      ...mockWitnesses,
      get_accrued_balance: () => 4000n, // Accrued entitlement is only 4,000
    };
    const contract = new Contract<void>(limitedWitnesses as any);
    let ctx = createTestCircuitContext(contract, 100000n);

    expect(() =>
      contract.impureCircuits.withdrawSalary(
        ctx,
        dummyStreamId,
        8000n, // Requesting 8,000 > 4,000
        dummyNullifier,
        dummyWorkerSk,
        1720000000n,
        1n,
        dummyWorkerSig
      )
    ).toThrow("failed assert: Withdrawal amount exceeds authenticated unwithdrawn entitlement");
  });
});
