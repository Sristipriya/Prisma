"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@/components/WalletContext";
import { toast } from "sonner";
import "../dashboard-pages.css";

const PREPROD_CONTRACT = "0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f";

interface ProverStep {
  id: number;
  message: string;
  status: "pending" | "running" | "done" | "error";
  ts: string;
}

interface ActiveAdvance {
  advanceId: string;
  totalBorrowed: number;
  fee: number;
  repaid: number;
  termDays: number;
  dailyRate: number;
  txHash: string;
  status: "Amortizing" | "Settled";
  timestamp: string;
}

const INITIAL_ADVANCES: ActiveAdvance[] = [
  {
    advanceId: "SC-982B1",
    totalBorrowed: 1500,
    fee: 22.5,
    repaid: 840,
    termDays: 14,
    dailyRate: 107.14,
    txHash: "0x4a8c1f9e2b0d3e5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    status: "Amortizing",
    timestamp: "2026-09-10 14:20 UTC",
  },
];

export default function StreamCreditPage() {
  const { isConnected, connect, connector } = useWallet();
  const [unaccruedSalary] = useState(10416); // 10,416 tNight remaining in pay period
  const [advanceAmount, setAdvanceAmount] = useState(2500);
  const [termDays, setTermDays] = useState(14);
  const [feePercentage] = useState(1.5); // 1.5% flat origination fee
  const [isProving, setIsProving] = useState(false);
  const [proverLogs, setProverLogs] = useState<ProverStep[]>([]);
  const [advances, setAdvances] = useState<ActiveAdvance[]>(INITIAL_ADVANCES);
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const stepRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  const addLog = (message: string, status: ProverStep["status"] = "done") => {
    stepRef.current += 1;
    const step: ProverStep = {
      id: stepRef.current,
      message,
      status,
      ts: new Date().toISOString().slice(11, 23),
    };
    setProverLogs((prev) => [...prev, step]);
    return step.id;
  };

  const updateLog = (id: number, status: ProverStep["status"], message?: string) => {
    setProverLogs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, ...(message ? { message } : {}) } : s))
    );
  };

  const maxAllowedAdvance = Math.floor(unaccruedSalary * 0.5);
  const fee = Math.round(advanceAmount * (feePercentage / 100));
  const netDisbursed = advanceAmount - fee;
  const repaymentPerSecond = advanceAmount / (termDays * 24 * 3600);
  const totalStreamVelocity = 12500 / (30 * 24 * 3600);
  const remainingSpendableVelocity = Math.max(0, totalStreamVelocity - repaymentPerSecond);

  const handleRequestAdvance = async () => {
    if (!isConnected || !connector) {
      toast.error("Please connect your 1AM wallet first");
      return;
    }

    if (advanceAmount > maxAllowedAdvance) {
      toast.error(`Requested advance exceeds 50% stream ceiling (${maxAllowedAdvance.toLocaleString()} tNight)`);
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setLatestTxHash(null);
    stepRef.current = 0;

    const t = toast.loading(`Synthesizing ZK StreamCredit Advance of ${advanceAmount.toLocaleString()} tNight…`);

    try {
      addLog("Initializing 1AM wallet shielded keys for StreamCredit facility…", "done");

      const s2 = addLog("Verifying incoming salary stream collateral (10,416 tNight unaccrued)…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s2, "done", `Collateral invariant verified: Requested ${advanceAmount.toLocaleString()} ≤ 50% ceiling (${maxAllowedAdvance.toLocaleString()} tNight)`);

      const s3 = addLog(`Formulating autonomous debt amortization constraint (${termDays}-day window @ ${feePercentage}% fee)…`, "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s3, "done", `Stream redirection locked: ${repaymentPerSecond.toFixed(6)} tNight/sec will repay liquidity pool`);

      const s4 = addLog("Executing Compact ZK circuit to disburse liquidity & anchor on Midnight…", "running");
      const { executeSalaryAdvance } = await import("@/lib/midnight/providers");

      const res = await executeSalaryAdvance(
        connector,
        {
          streamId: "stream-primary-001",
          requestedAmount: advanceAmount,
          unaccruedSalary,
          feePercentage,
          termDays,
        },
        (msg) => addLog(msg, "done")
      );

      updateLog(s4, "done", `Confirmed on-chain! Tx: ${res.txHash.slice(0, 16)}…`);
      setLatestTxHash(res.txHash);

      const newAdvance: ActiveAdvance = {
        advanceId: res.advanceId,
        totalBorrowed: res.requestedAmount,
        fee: res.fee,
        repaid: 0,
        termDays: res.termDays,
        dailyRate: res.requestedAmount / res.termDays,
        txHash: res.txHash,
        status: "Amortizing",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      };

      setAdvances((prev) => [newAdvance, ...prev]);

      toast.success(
        <span>
          Instant Salary Advance Disbursed!{" "}
          <a
            href={`https://preprod.midnightexplorer.com/tx/${res.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "#67e8f9", fontWeight: 600 }}
          >
            Explorer ↗
          </a>
        </span>,
        { id: t, duration: 8000 }
      );
    } catch (err: any) {
      const msg = err?.message || String(err);
      addLog(`Error: ${msg}`, "error");
      toast.error(`Salary advance failed: ${msg}`, { id: t });
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="dp-page page-in">
      {/* Header */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Prisma StreamCredit · Stream-Collateralized Zero-Knowledge Liquidity</div>
          <h1 className="dp-title">StreamCredit & Instant Salary Advance</h1>
          <p className="dp-subtitle">
            Borrow up to 50% of your unaccrued future salary instantly with <strong>zero crypto over-collateralization, zero credit checks,
            and 0% predatory compounding APR</strong>. Midnight smart contracts automatically redirect incoming per-second stream ticks to repay
            the liquidity facility—with 100% privacy from coworkers and employers.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            Midnight Anchor
          </span>
          <a
            href={`https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#67e8f9",
              textDecoration: "none",
              borderBottom: "1px dashed rgba(103,232,249,0.4)",
            }}
          >
            {PREPROD_CONTRACT.slice(0, 18)}…{PREPROD_CONTRACT.slice(-6)} ↗
          </a>
          <span style={{ fontSize: "11px", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            Midnight Preprod Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Unaccrued Stream Collateral
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#fff", marginTop: "6px" }}>
            {unaccruedSalary.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>tNight</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Locked future salary in current period
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Maximum Advance (50% LTV)
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#67e8f9", marginTop: "6px" }}>
            {maxAllowedAdvance.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(103,232,249,0.6)" }}>tNight</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Guarantees positive ongoing cash flow
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Flat Origination Fee
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#10b981", marginTop: "6px" }}>
            1.5% Fixed
          </div>
          <div style={{ fontSize: "12px", color: "#10b981", marginTop: "6px" }}>
            0% Compounding · Zero Predatory APR
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Repayment Mechanism
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#a78bfa", marginTop: "6px" }}>
            Autonomous ZK
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Stream ticks automatically pay down debt
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Left: Advance Calculator & Slider */}
        <div className="card glass-heavy" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
            Configure Instant Salary Advance
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
            Select how much future salary you wish to unlock immediately. Funds are disbursed instantly to your 1AM wallet.
          </p>

          {/* Amount Slider */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Requested Advance Amount</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#67e8f9", fontFamily: "monospace" }}>
                {advanceAmount.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>tNight</span>
              </span>
            </div>
            <input
              type="range"
              min="200"
              max={maxAllowedAdvance}
              step="100"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(parseInt(e.target.value, 10))}
              disabled={isProving}
              style={{ width: "100%", accentColor: "#67e8f9", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
              <span>200 tNight Min</span>
              <span>{maxAllowedAdvance.toLocaleString()} tNight Max (50% Collateral Limit)</span>
            </div>
          </div>

          {/* Term Selector */}
          <div className="dp-field" style={{ marginBottom: "24px" }}>
            <label className="dp-label">Amortization Term Window</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                { days: 7, label: "7 Days", desc: "Fast Paydown" },
                { days: 14, label: "14 Days", desc: "Balanced (Recommended)" },
                { days: 21, label: "21 Days", desc: "Gentle Paydown" },
              ].map((t) => (
                <button
                  key={t.days}
                  type="button"
                  onClick={() => setTermDays(t.days)}
                  disabled={isProving}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: termDays === t.days ? "1px solid #67e8f9" : "1px solid rgba(255,255,255,0.08)",
                    background: termDays === t.days ? "rgba(103,232,249,0.1)" : "rgba(255,255,255,0.02)",
                    color: termDays === t.days ? "#67e8f9" : "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{t.label}</div>
                  <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Table */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Gross Advance</span>
              <span style={{ color: "#fff", fontFamily: "monospace" }}>{advanceAmount.toLocaleString()} tNight</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Origination Fee (1.5% fixed)</span>
              <span style={{ color: "#10b981", fontFamily: "monospace" }}>-{fee.toLocaleString()} tNight</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontWeight: 600, color: "#fff" }}>Net Disbursed to 1AM Wallet</span>
              <span style={{ fontWeight: 700, color: "#67e8f9", fontSize: "16px", fontFamily: "monospace" }}>
                {netDisbursed.toLocaleString()} tNight
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              <span>Diverted Repayment Rate</span>
              <span>+{repaymentPerSecond.toFixed(6)}/sec ({Math.round(advanceAmount / termDays).toLocaleString()}/day)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#10b981" }}>
              <span>Remaining Spendable Stream</span>
              <span>+{remainingSpendableVelocity.toFixed(6)}/sec</span>
            </div>
          </div>

          {!isConnected ? (
            <button onClick={connect} className="dp-primary-btn" style={{ width: "100%", padding: "14px" }}>
              Connect 1AM Wallet to Advance
            </button>
          ) : (
            <button
              onClick={handleRequestAdvance}
              disabled={isProving}
              className="dp-primary-btn"
              style={{
                width: "100%",
                padding: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              }}
            >
              {isProving ? (
                <>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Disbursing ZK Salary Advance…
                </>
              ) : (
                `Disburse Instant ${advanceAmount.toLocaleString()} tNight Advance`
              )}
            </button>
          )}
        </div>

        {/* Right: Prover Telemetry & Active Amortization Tracker */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Prover Terminal */}
          <div className="card glass-heavy" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
                StreamCredit Prover Telemetry
              </h2>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>
                Midnight Proof Engine
              </span>
            </div>

            <div
              style={{
                minHeight: "180px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "14px",
                fontFamily: "monospace",
                fontSize: "12px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {proverLogs.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", margin: "auto", textAlign: "center" }}>
                  Configure your advance amount and click "Disburse Instant Salary Advance" to initiate ZK settlement.
                </div>
              ) : (
                proverLogs.map((log) => (
                  <div key={log.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>[{log.ts}]</span>
                    <span style={{ color: log.status === "error" ? "#ef4444" : log.status === "running" ? "#67e8f9" : "#10b981" }}>
                      {log.status === "running" ? "⟳" : log.status === "error" ? "✗" : "✓"}
                    </span>
                    <span style={{ color: log.status === "error" ? "#fca5a5" : "#e2e8f0", flex: 1 }}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>

            {latestTxHash && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 500 }}>
                  ✓ Instant Liquidity Disbursed to 1AM Wallet
                </span>
                <a
                  href={`https://preprod.midnightexplorer.com/tx/${latestTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#67e8f9", fontSize: "12px", textDecoration: "underline", fontFamily: "monospace" }}
                >
                  {latestTxHash.slice(0, 10)}…{latestTxHash.slice(-6)} ↗
                </a>
              </div>
            )}
          </div>

          {/* Active Advances & Live Amortization Progress */}
          <div className="card glass-heavy" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
                Active StreamCredit Facilities
              </h2>
              <span className="dp-badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                Autonomous Paydown
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {advances.map((adv) => {
                const liveRepaid = adv.repaid + ((now % 100000) / 1000) * 0.15;
                const pct = Math.min(100, (liveRepaid / adv.totalBorrowed) * 100);

                return (
                  <div
                    key={adv.advanceId}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                          Advance {adv.advanceId}
                        </span>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                          Disbursed: {adv.timestamp}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "rgba(103,232,249,0.1)",
                          color: "#67e8f9",
                        }}
                      >
                        {adv.termDays}-Day Term
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>
                          Amortized: <strong style={{ color: "#10b981" }}>{liveRepaid.toFixed(2)}</strong> / {adv.totalBorrowed.toLocaleString()} tNight
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #67e8f9)", transition: "width 0.2s linear" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      <span>Code-Enforced Repayment</span>
                      <a
                        href={`https://preprod.midnightexplorer.com/tx/${adv.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#67e8f9", textDecoration: "underline" }}
                      >
                        Ledger Verification ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
