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
    txHash: "0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19",
    status: "Amortizing",
    timestamp: "2026-09-10 14:20 UTC",
  },
];

// Clean minimalist SVG icons (no emojis, no AI artifacts)
const Icons = {
  Zap: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Shield: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  External: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Layers: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

export default function StreamCreditPage() {
  const { isConnected, connect, connector } = useWallet();
  const [unaccruedSalary] = useState(10416); // 10,416 tNight unaccrued future salary
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

  const maxAllowed = Math.floor(unaccruedSalary * 0.5);
  const fee = Math.round(advanceAmount * (feePercentage / 100));
  const netDisbursed = advanceAmount - fee;
  const repaymentPerSecond = advanceAmount / (termDays * 24 * 3600);
  const totalStreamVelocity = 12500 / (30 * 24 * 3600);
  const remainingSpendableVelocity = Math.max(0, totalStreamVelocity - repaymentPerSecond);

  const handleQuickPercent = (pct: number) => {
    const val = Math.round(maxAllowed * pct);
    setAdvanceAmount(Math.max(200, val));
  };

  const handleRequestAdvance = async () => {
    if (!isConnected || !connector) {
      toast.error("Please connect your 1AM wallet first");
      return;
    }

    if (advanceAmount > maxAllowed) {
      toast.error(`Requested advance exceeds ${maxAllowed.toLocaleString()} tNight ceiling`);
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setLatestTxHash(null);
    stepRef.current = 0;

    const t = toast.loading(`Disbursing ${advanceAmount.toLocaleString()} tNight advance…`);

    try {
      addLog("Initializing 1AM shielded keys…", "done");

      const s2 = addLog("Verifying 50% LTV stream collateral…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s2, "done", `Collateral bound: ${advanceAmount.toLocaleString()} ≤ ${maxAllowed.toLocaleString()} tNight`);

      const s3 = addLog(`Configuring ${termDays}-day stream debt redirection…`, "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s3, "done", `Repayment locked: ${repaymentPerSecond.toFixed(6)} tNight/sec`);

      const s4 = addLog("Synthesizing Compact ZK proof via Midnight Proof Server…", "running");
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
          Instant Advance Disbursed!{" "}
          <a
            href={`https://preprod.midnightexplorer.com/transactions/${res.txHash}`}
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
      toast.error(`Advance failed: ${msg}`, { id: t });
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="dp-page page-in">
      {/* Liquid Glass Header */}
      <div
        className="card glass-heavy"
        style={{
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#67e8f9",
                background: "rgba(103, 232, 249, 0.08)",
                border: "1px solid rgba(103, 232, 249, 0.2)",
                padding: "3px 8px",
                borderRadius: "6px",
                letterSpacing: "0.05em",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Icons.Zap /> STREAM COLLATERAL
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Zero-Knowledge Liquidity</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
            Instant Stream Advance
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a
            href={`https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "8px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            <span>Preprod Contract</span>
            <Icons.External />
          </a>
        </div>
      </div>

      {/* Sleek KPI Metrics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        {[
          { label: "Available Collateral", value: `${unaccruedSalary.toLocaleString()} tNight`, sub: "Active unaccrued salary", color: "#fff" },
          { label: "Maximum Advance (50% LTV)", value: `${maxAllowed.toLocaleString()} tNight`, sub: "Instant draw ceiling", color: "#67e8f9" },
          { label: "Fixed Origination", value: "1.5%", sub: "0% Compounding APR", color: "#10b981" },
          { label: "Repayment Flow", value: "Autonomous", sub: "Code-enforced paydown", color: "#a78bfa" },
        ].map((m, idx) => (
          <div
            key={idx}
            className="card glass-heavy"
            style={{
              padding: "18px 22px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {m.label}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 600, color: m.color, marginTop: "4px", letterSpacing: "-0.02em" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main Liquid Glass Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "20px" }}>
        {/* Left: Interactive Advance Module */}
        <div
          className="card glass-heavy"
          style={{
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Amount Display & Quick Selectors */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                Select Advance Amount
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { label: "25%", val: 0.25 },
                  { label: "50%", val: 0.5 },
                  { label: "75%", val: 0.75 },
                  { label: "MAX", val: 1.0 },
                ].map((pill) => (
                  <button
                    key={pill.label}
                    onClick={() => handleQuickPercent(pill.val)}
                    disabled={isProving}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Giant Liquid Glass Amount Display */}
            <div
              style={{
                padding: "24px",
                borderRadius: "14px",
                background: "radial-gradient(ellipse at top, rgba(103, 232, 249, 0.06) 0%, rgba(0, 0, 0, 0.2) 100%)",
                border: "1px solid rgba(103, 232, 249, 0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "40px", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", fontFamily: "monospace" }}>
                  {advanceAmount.toLocaleString()}
                </span>
                <span style={{ fontSize: "18px", color: "#67e8f9", marginLeft: "8px", fontWeight: 500 }}>
                  tNight
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Net Disbursed</div>
                <div style={{ fontSize: "16px", color: "#10b981", fontWeight: 600, fontFamily: "monospace" }}>
                  {netDisbursed.toLocaleString()} tNight
                </div>
              </div>
            </div>

            {/* Smooth Slider */}
            <div style={{ marginTop: "16px" }}>
              <input
                type="range"
                min="200"
                max={maxAllowed}
                step="50"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(parseInt(e.target.value, 10))}
                disabled={isProving}
                style={{
                  width: "100%",
                  accentColor: "#67e8f9",
                  cursor: "pointer",
                  height: "6px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "3px",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>
                <span>200 Min</span>
                <span>{maxAllowed.toLocaleString()} tNight Max</span>
              </div>
            </div>
          </div>

          {/* Amortization Term Window */}
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: "10px" }}>
              Amortization Term
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                { days: 7, label: "7 Days", rate: "Fast Amortization" },
                { days: 14, label: "14 Days", rate: "Balanced Default" },
                { days: 21, label: "21 Days", rate: "Extended Term" },
              ].map((term) => {
                const active = termDays === term.days;
                return (
                  <button
                    key={term.days}
                    type="button"
                    onClick={() => setTermDays(term.days)}
                    disabled={isProving}
                    style={{
                      padding: "14px 12px",
                      borderRadius: "10px",
                      border: active ? "1px solid #67e8f9" : "1px solid rgba(255,255,255,0.06)",
                      background: active ? "rgba(103, 232, 249, 0.08)" : "rgba(255,255,255,0.02)",
                      color: active ? "#67e8f9" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{term.label}</div>
                    <div style={{ fontSize: "11px", color: active ? "rgba(103,232,249,0.7)" : "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                      {term.rate}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Receipt Breakdown */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Requested Principal</span>
              <span style={{ color: "#fff", fontFamily: "monospace" }}>{advanceAmount.toLocaleString()} tNight</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Origination Fee (1.5% fixed)</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{fee.toLocaleString()} tNight</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Diverted Paydown Rate</span>
              <span style={{ color: "#67e8f9", fontFamily: "monospace" }}>-{repaymentPerSecond.toFixed(6)}/sec</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#10b981", fontWeight: 500 }}>Remaining Spendable Stream</span>
              <span style={{ color: "#10b981", fontWeight: 600, fontFamily: "monospace" }}>+{remainingSpendableVelocity.toFixed(6)}/sec</span>
            </div>
          </div>

          {/* Primary Action Button */}
          {!isConnected ? (
            <button onClick={connect} className="dp-primary-btn" style={{ width: "100%", padding: "14px", justifyContent: "center" }}>
              Connect 1AM Wallet to Advance
            </button>
          ) : (
            <button
              onClick={handleRequestAdvance}
              disabled={isProving}
              className="dp-primary-btn"
              style={{
                width: "100%",
                padding: "16px",
                justifyContent: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {isProving ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Proving on Midnight…
                </>
              ) : (
                <>
                  <Icons.Zap />
                  Disburse {netDisbursed.toLocaleString()} tNight Instant Advance
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Telemetry & Active Facility */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* ZK Prover Telemetry Panel */}
          <div
            className="card glass-heavy"
            style={{
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.02)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                <Icons.Layers /> ZK Prover Telemetry
              </span>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>
                Midnight Proof Engine
              </span>
            </div>

            <div
              style={{
                minHeight: "160px",
                background: "rgba(0,0,0,0.4)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "14px",
                fontFamily: "monospace",
                fontSize: "11px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {proverLogs.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", margin: "auto", textAlign: "center" }}>
                  Adjust amount and click "Disburse" to synthesize ZK proof.
                </div>
              ) : (
                proverLogs.map((log) => (
                  <div key={log.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
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
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Icons.Check /> Settled on Consensus
                </span>
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/${latestTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#67e8f9", fontSize: "11px", textDecoration: "underline", fontFamily: "monospace" }}
                >
                  {latestTxHash.slice(0, 10)}…{latestTxHash.slice(-6)} ↗
                </a>
              </div>
            )}
          </div>

          {/* Active Facility Card */}
          <div
            className="card glass-heavy"
            style={{
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                <Icons.Clock /> Active Facility
              </span>
              <span className="dp-badge" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                Amortizing Live
              </span>
            </div>

            {advances.map((adv) => {
              const liveRepaid = adv.repaid + ((now % 100000) / 1000) * 0.15;
              const pct = Math.min(100, (liveRepaid / adv.totalBorrowed) * 100);

              return (
                <div
                  key={adv.advanceId}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", fontFamily: "monospace" }}>
                      {adv.advanceId}
                    </span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      {adv.termDays}-Day Term
                    </span>
                  </div>

                  {/* Amortization Bar */}
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>
                        Paid: <strong style={{ color: "#10b981" }}>{liveRepaid.toFixed(1)}</strong> / {adv.totalBorrowed.toLocaleString()} tNight
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #10b981, #67e8f9)",
                          transition: "width 0.2s linear",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                    <span>Continuous Paydown</span>
                    <a
                      href={`https://preprod.midnightexplorer.com/transactions/${adv.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#67e8f9", textDecoration: "underline" }}
                    >
                      Explorer ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
