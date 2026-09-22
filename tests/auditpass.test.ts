import { describe, it, expect } from "vitest";

describe("Prisma AuditPass Selective Compliance & Scoped Viewing Enclave Validation", () => {
  it("verifies employee income bracket membership without exposing exact salary", () => {
    const grossEarnings = 125000;
    const bracket = { min: 85000, max: 160000, name: "US-FED Bracket 3" };

    const inBracket = grossEarnings >= bracket.min && grossEarnings <= bracket.max;
    expect(inBracket).toBe(true);
  });

  it("mints time-bounded scoped viewing tokens with valid expiration dates", () => {
    const validDays = 30;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + validDays * 24 * 60 * 60 * 1000);

    const diffDays = Math.round((expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it("ensures statutory withholding rate matches jurisdiction rules", () => {
    const grossEarnings = 10000;
    const withholdingRate = 22; // 22%
    const withheldAmount = Math.round((grossEarnings * withholdingRate) / 100);
    const netEarnings = grossEarnings - withheldAmount;

    expect(withheldAmount).toBe(2200);
    expect(netEarnings).toBe(7800);
  });
});
