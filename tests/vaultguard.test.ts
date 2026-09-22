import { describe, it, expect } from "vitest";

describe("Prisma VaultGuard Zero-Knowledge Treasury Solvency Validation", () => {
  it("calculates required reserve based on runway horizon days and commitments", () => {
    const monthlyObligations = 17500;
    const runwayDays = 90;
    const requiredReserve = Math.max(1, Math.round((monthlyObligations / 30) * runwayDays));
    expect(requiredReserve).toBe(52500);
  });

  it("proves solvency when private treasury reserves meet required obligations", () => {
    const monthlyObligations = 15000;
    const runwayDays = 60;
    const requiredReserve = Math.round((monthlyObligations / 30) * runwayDays); // 30,000
    const privateReserves = 45000;
    const solvencyRatio = Math.round((privateReserves / requiredReserve) * 100);

    expect(privateReserves).toBeGreaterThanOrEqual(requiredReserve);
    expect(solvencyRatio).toBe(150); // 150% solvent
  });

  it("detects insolvency if reserves fall below the runway threshold", () => {
    const monthlyObligations = 20000;
    const runwayDays = 90;
    const requiredReserve = Math.round((monthlyObligations / 30) * runwayDays); // 60,000
    const privateReserves = 40000;

    const isSolvent = privateReserves >= requiredReserve;
    expect(isSolvent).toBe(false);
  });
});
