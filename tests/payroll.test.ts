import { PayrollSimulator } from "./payroll-simulator";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId("undeployed");

describe("Payroll Circuit Zero-Knowledge Validation", () => {
  it("processes payroll within total budget", () => {
    const simulator = new PayrollSimulator(50000n);
    const updatedLedger = simulator.payEmployee(15000n);
    expect(updatedLedger.total_spent).toBe(15000n);
  });

  it("halts payroll if total budget limit is exceeded without leaking individual salary", () => {
    const simulator = new PayrollSimulator(20000n);
    simulator.payEmployee(15000n);
    expect(() => simulator.payEmployee(6000n)).toThrow("failed assert: Spending limit exceeded");
  });
});
