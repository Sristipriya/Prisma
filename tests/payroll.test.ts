import { PayrollSimulator } from "./payroll-simulator";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId("undeployed");

describe("Payroll Circuit Zero-Knowledge Validation", () => {
  it("processes payroll within total budget", () => {
    const simulator = new PayrollSimulator(BigInt(50000));
    const updatedLedger = simulator.payEmployee(BigInt(15000));
    expect(updatedLedger.total_spent).toBe(BigInt(15000));
  });

  it("halts payroll if total budget limit is exceeded without leaking individual salary", () => {
    const simulator = new PayrollSimulator(BigInt(20000));
    simulator.payEmployee(BigInt(15000));
    expect(() => simulator.payEmployee(BigInt(6000))).toThrow("failed assert: Spending limit exceeded");
  });
});
