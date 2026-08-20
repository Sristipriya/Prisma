import { VendorSimulator } from "./vendor-simulator";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId("undeployed");

describe("Vendor Settlement Circuit Zero-Knowledge Validation", () => {
  it("settles invoice securely within vendor budget", () => {
    const simulator = new VendorSimulator(100000n);
    const updatedLedger = simulator.settleInvoice(45000n);
    expect(updatedLedger.total_spent).toBe(45000n);
  });

  it("blocks invoice settlement if it exceeds the vendor allocation budget", () => {
    const simulator = new VendorSimulator(50000n);
    simulator.settleInvoice(45000n);
    expect(() => simulator.settleInvoice(6000n)).toThrow("failed assert: Spending limit exceeded");
  });
});
