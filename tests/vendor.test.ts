import { VendorSimulator } from "./vendor-simulator";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId("undeployed");

describe("Vendor Settlement Circuit Zero-Knowledge Validation", () => {
  it("settles invoice securely within vendor budget", () => {
    const simulator = new VendorSimulator(BigInt(100000));
    const updatedLedger = simulator.settleInvoice(BigInt(45000));
    expect(updatedLedger.total_spent).toBe(BigInt(45000));
  });

  it("blocks invoice settlement if it exceeds the vendor allocation budget", () => {
    const simulator = new VendorSimulator(BigInt(50000));
    simulator.settleInvoice(BigInt(45000));
    expect(() => simulator.settleInvoice(BigInt(6000))).toThrow("failed assert: Spending limit exceeded");
  });
});
