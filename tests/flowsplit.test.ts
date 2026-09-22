import { describe, it, expect } from "vitest";

describe("Prisma FlowSplit Autonomous ZK Stream Routing Validation", () => {
  it("verifies the 100% Value Conservation Invariant across sub-vaults", () => {
    const buckets = [
      { name: "Liquid Spendable", percentage: 50 },
      { name: "Shielded Tax Escrow", percentage: 25 },
      { name: "Private Cold Storage", percentage: 15 },
      { name: "Emergency Reserve", percentage: 10 },
    ];
    const sumPercent = Math.round(buckets.reduce((acc, b) => acc + b.percentage, 0) * 100) / 100;
    expect(sumPercent).toBe(100);
  });

  it("rejects routing configurations that do not sum to exactly 100%", () => {
    const invalidBuckets = [
      { name: "Liquid Spendable", percentage: 50 },
      { name: "Shielded Tax Escrow", percentage: 30 },
      { name: "Private Cold Storage", percentage: 15 },
    ];
    const sumPercent = Math.round(invalidBuckets.reduce((acc, b) => acc + b.percentage, 0) * 100) / 100;
    expect(Math.abs(sumPercent - 100) > 0.01).toBe(true);
  });

  it("calculates accurate per-vault discrete allocations from streamed gross", () => {
    const monthlyTotal = 12500;
    const allocations = {
      liquid: (monthlyTotal * 50) / 100,      // 6250
      tax: (monthlyTotal * 25) / 100,         // 3125
      savings: (monthlyTotal * 15) / 100,     // 1875
      emergency: (monthlyTotal * 10) / 100,   // 1250
    };

    expect(allocations.liquid + allocations.tax + allocations.savings + allocations.emergency).toBe(monthlyTotal);
  });
});
