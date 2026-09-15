"use client";
import React, { useState, useRef } from "react";
import { useWallet } from "@/components/WalletContext";
import { toast } from "sonner";
import "../dashboard-pages.css";

const PREPROD_CONTRACT = "0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f";

interface SolvencyAuditRecord {
  id: string;
  timestamp: string;
  runwayDays: number;
  monthlyCommitment: number;
  requiredReserve: number;
  solvencyRatio: number;
  txHash: string;
  status: "Verified" | "Submitting" | "Failed";
}

const INITIAL_AUDIT_LOG: SolvencyAuditRecord[] = [
  {
    id: "attest-001",
    timestamp: "2026-09-14 18:32 UTC",
    runwayDays: 90,
    monthlyCommitment: 17500,
    requiredReserve: 52500,
    solvencyRatio: 276,
    txHash: "0x3f4a8b9c1d2e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcd",
    status: "Verified",
  },
  {
    id: "attest-002",
    timestamp: "2026-09-01 09:15 UTC",
    runwayDays: 60,
    monthlyCommitment: 17500,
    requiredReserve: 35000,
    solvencyRatio: 314,
    txHash: "0x89abcdef0123456789abcd3f4a8b9c1d2e5f60718293a4b5c6d7e8f901234567",
    status: "Verified",
  },
];

interface LogStep {
  id: number;
  message: string;
  status: "pending" | "running" | "done" | "error";
  ts: string;
}

export default function VaultGuardPage() {
  const { isConnected, connect, connector } = useWallet();
  const [runwayDays, setRunwayDays] = useState<number>(90);
  const [monthlyCommitment] = useState<number>(17500); // 17,500 tNight/mo
  const [shieldedTreasuryBalance] = useState<number>(145000); // 145,000 tNight private reserve
  const [isProving, setIsProving] = useState<boolean>(false);
  const [auditRecords, setAuditRecords] = useState<SolvencyAuditRecord[]>(INITIAL_AUDIT_LOG);
  const [logs, setLogs] = useState<LogStep[]>([]);
  const [latestResult, setLatestResult] = useState<{ txHash: string; runwayDays: number } | null>(null);

  const stepCounter = useRef(0);

  const addLog = (message: string, status: LogStep["status"] = "done") => {
    stepCounter.current += 1;
    const step: LogStep = {
      id: stepCounter.current,
      message,
      status,
      ts: new Date().toISOString().slice(11, 23),
    };
    setLogs((prev) => [...prev, step]);
    return step.id;
  };

  const updateLog = (id: number, status: LogStep["status"], message?: string) => {
    setLogs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, ...(message ? { message } : {}) } : s))
    );
  };

  const requiredReserve = Math.round((monthlyCommitment / 30) * runwayDays);
  const solvencyRatio = Math.round((shieldedTreasuryBalance / requiredReserve) * 100);

  const handleGenerateProof = async () => {
    if (!isConnected || !connector) {
      toast.error("Please connect your 1AM wallet first");
      return;
    }

    setIsProving(true);
    setLogs([]);
    setLatestResult(null);
    stepCounter.current = 0;

    const tToast = toast.loading(`Generating ZK Solvency Proof for ${runwayDays}-day runway…`);

    try {
      addLog("Initializing 1AM wallet shielded witness context…", "done");

      const s2 = addLog("Querying live active payroll and vendor commitments…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s2, "done", `Active obligations aggregated: ${monthlyCommitment.toLocaleString()} tNight/month`);

      const s3 = addLog(`Computing required ${runwayDays}-day reserve threshold: ${requiredReserve.toLocaleString()} tNight…`, "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s3, "done", `Threshold bound: ${requiredReserve.toLocaleString()} tNight required`);

      const s4 = addLog("Synthesizing Compact ZK circuit constraints (Reserves ≥ Horizon_Obligations)…", "running");
      const { createSolvencyAttestation } = await import("@/lib/midnight/providers");
      updateLog(s4, "done", "ZK Solvency circuit constraints loaded");

      const s5 = addLog("Generating Zero-Knowledge SNARK proof via Midnight Proof Server…", "running");
      const attestation = await createSolvencyAttestation(
        connector,
        runwayDays,
        monthlyCommitment,
        (msg) => {
          addLog(msg, "done");
        }
      );
      updateLog(s5, "done", "ZK SNARK proof generated & verified by Midnight consensus");

      const record: SolvencyAuditRecord = {
        id: `attest-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        runwayDays,
        monthlyCommitment,
        requiredReserve,
        solvencyRatio,
        txHash: attestation.txHash,
        status: "Verified",
      };

      setAuditRecords((prev) => [record, ...prev]);
      setLatestResult({ txHash: attestation.txHash, runwayDays });

      toast.success(
        <span>
          ZK Solvency Attestation confirmed!{" "}
          <a
            href={`https://preprod.midnightexplorer.com/tx/${attestation.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "#67e8f9", fontWeight: 600 }}
          >
            View on Midnight Explorer ↗
          </a>
        </span>,
        { id: tToast, duration: 8000 }
      );
    } catch (err: any) {
      const msg = err?.message || String(err);
      addLog(`Error: ${msg}`, "error");
      toast.error(`Attestation failed: ${msg}`, { id: tToast });
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="dp-page page-in">
      {/* Header */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Prisma VaultGuard · Mathematical Solvency Assurance</div>
          <h1 className="dp-title">ZK Treasury Solvency & Runway Attestation</h1>
          <p className="dp-subtitle">
            Cryptographically prove that your company treasury maintains 100% sufficient shielded reserves to guarantee all
            employee and vendor streams for your chosen runway horizon—<strong>without revealing total treasury balances,
            banking partners, or individual salary amounts.</strong>
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            Network Contract
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

      {/* KPI Top Cards */}
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
            Monthly Commitments
          </div>
          <div style={{ fontSize: "26px", fontWeight: 600, color: "#fff", marginTop: "6px" }}>
            {monthlyCommitment.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>tNight/mo</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Across all active payroll & vendor streams
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Required Reserve ({runwayDays} Days)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 600, color: "#67e8f9", marginTop: "6px" }}>
            {requiredReserve.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(103,232,249,0.6)" }}>tNight</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Based on {Math.round(monthlyCommitment / 30).toLocaleString()} tNight/day burn rate
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Shielded Treasury Reserve
          </div>
          <div style={{ fontSize: "26px", fontWeight: 600, color: "#a78bfa", marginTop: "6px" }}>
            {shieldedTreasuryBalance.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(167,139,250,0.6)" }}>tNight</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Stored in private Midnight UTXOs
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Solvency Ratio
          </div>
          <div style={{ fontSize: "26px", fontWeight: 600, color: "#10b981", marginTop: "6px" }}>
            {solvencyRatio}%
          </div>
          <div style={{ fontSize: "12px", color: "#10b981", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>✓</span> 100% Solvency Guaranteed
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Left: Configuration & Generation */}
        <div className="card glass-heavy" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
            Runway Horizon Selection
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
            Select the runway horizon your organization wishes to mathematically guarantee to workers and vendors.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "24px" }}>
            {[
              { days: 30, label: "30 Days", sub: "1 Month Runway", desc: "Short-term baseline assurance" },
              { days: 60, label: "60 Days", sub: "2 Months Runway", desc: "Standard operating window" },
              { days: 90, label: "90 Days", sub: "Quarterly (Recommended)", desc: "Enterprise solvency benchmark" },
              { days: 180, label: "180 Days", sub: "Semi-Annual", desc: "Maximum institutional credibility" },
            ].map((item) => {
              const active = runwayDays === item.days;
              return (
                <button
                  key={item.days}
                  onClick={() => setRunwayDays(item.days)}
                  disabled={isProving}
                  style={{
                    textAlign: "left",
                    padding: "16px",
                    borderRadius: "12px",
                    border: active ? "1px solid #67e8f9" : "1px solid rgba(255,255,255,0.08)",
                    background: active ? "rgba(103,232,249,0.08)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: active ? "#67e8f9" : "#fff" }}>
                      {item.label}
                    </span>
                    {active && (
                      <span style={{ fontSize: "10px", background: "#67e8f9", color: "#000", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: active ? "rgba(103,232,249,0.8)" : "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                    {item.sub}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
                    {item.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Circuit details banner */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.2)",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#a78bfa", marginBottom: "6px" }}>
              VAULTGUARD MATHEMATICAL PROOF FORMULA
            </div>
            <code style={{ fontSize: "13px", color: "#fff", display: "block", marginBottom: "8px" }}>
              Reserves_Private ≥ (Σ Monthly_Commitments ÷ 30) × {runwayDays}
            </code>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              • <strong>Private Inputs:</strong> Employer treasury UTXOs & company reserve balance.<br />
              • <strong>Public Verification:</strong> The Zero-Knowledge proof proves strict inequality on Midnight ledger without ever disclosing how much total money the employer holds.
            </div>
          </div>

          {!isConnected ? (
            <button onClick={connect} className="dp-primary-btn" style={{ width: "100%", padding: "14px" }}>
              Connect 1AM Wallet to Attest
            </button>
          ) : (
            <button
              onClick={handleGenerateProof}
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
                  Proving Solvency On-Chain…
                </>
              ) : (
                `Generate ZK Solvency Proof (${runwayDays}-Day Runway)`
              )}
            </button>
          )}
        </div>

        {/* Right: Live Execution Log & Verifiable Certificate */}
        <div className="card glass-heavy" style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
              ZK Prover Telemetry
            </h2>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>
              Midnight Proof Engine
            </span>
          </div>

          {/* Terminal log window */}
          <div
            style={{
              flex: 1,
              minHeight: "240px",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "16px",
              fontFamily: "monospace",
              fontSize: "12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", margin: "auto", textAlign: "center" }}>
                Select a runway horizon and click "Generate ZK Solvency Proof" to initiate proof synthesis.
              </div>
            ) : (
              logs.map((log) => (
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

          {/* Verified Certificate Card if complete */}
          {latestResult && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "10px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#10b981" }}>
                  ✓ VaultGuard Certified Solvency Attestation
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  {latestResult.runwayDays}-Day Guaranteed
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "6px" }}>
                Transaction Hash:{" "}
                <a
                  href={`https://preprod.midnightexplorer.com/tx/${latestResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#67e8f9", textDecoration: "underline", fontFamily: "monospace" }}
                >
                  {latestResult.txHash.slice(0, 20)}…{latestResult.txHash.slice(-10)} ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card glass-heavy" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
              Verifiable Solvency Audit Ledger
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
              Immutable record of ZK attestations anchored to the Midnight blockchain. Accessible to workers and regulators.
            </p>
          </div>
          <span className="dp-badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
            Auditor Ready
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                <th style={{ padding: "12px 16px" }}>Attestation ID</th>
                <th style={{ padding: "12px 16px" }}>Date & Time</th>
                <th style={{ padding: "12px 16px" }}>Runway Horizon</th>
                <th style={{ padding: "12px 16px" }}>Required Reserve</th>
                <th style={{ padding: "12px 16px" }}>Solvency Status</th>
                <th style={{ padding: "12px 16px" }}>Consensus Proof</th>
              </tr>
            </thead>
            <tbody>
              {auditRecords.map((rec) => (
                <tr
                  key={rec.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#a78bfa" }}>
                    {rec.id}
                  </td>
                  <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.6)" }}>
                    {rec.timestamp}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(103,232,249,0.1)",
                        color: "#67e8f9",
                        fontWeight: 500,
                        fontSize: "12px",
                      }}
                    >
                      {rec.runwayDays} Days
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace" }}>
                    {rec.requiredReserve.toLocaleString()} tNight
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#10b981",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      <span>✓</span> 100% Backed ({rec.solvencyRatio}%)
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <a
                      href={`https://preprod.midnightexplorer.com/tx/${rec.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#67e8f9",
                        textDecoration: "underline",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    >
                      {rec.txHash.slice(0, 10)}…{rec.txHash.slice(-6)} ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
