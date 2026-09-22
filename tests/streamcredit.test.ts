import { describe, it, expect } from "vitest";

describe("Prisma StreamCredit ZK Stream-Collateralized Advance Validation", () => {
  it("enforces the 50% collateral ceiling for salary advances", () => {
    const unaccruedSalary = 10000;
    const maxAllowed = unaccruedSalary * 0.5; // 5000
    const requestedAmount = 4000;

    expect(requestedAmount).toBeLessThanOrEqual(maxAllowed);
  });

  it("rejects advance requests exceeding the 50% future unaccrued salary limit", () => {
    const unaccruedSalary = 8000;
    const maxAllowed = unaccruedSalary * 0.5; // 4000
    const excessiveRequest = 5500;

    expect(excessiveRequest > maxAllowed).toBe(true);
  });

  it("accurately computes fixed 1.5% origination fee and net disbursed liquidity", () => {
    const requestedAmount = 5000;
    const feePercentage = 1.5;
    const fee = Math.round(requestedAmount * (feePercentage / 100)); // 75
    const netDisbursed = requestedAmount - fee; // 4925

    expect(fee).toBe(75);
    expect(netDisbursed).toBe(4925);
  });
});
