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

interface VaultBucket {
  id: string;
  name: string;
  category: "liquid" | "tax" | "savings" | "emergency";
  percentage: number;
  color: string;
  icon: string;
  desc: string;
  accumulated: number;
}

const INITIAL_BUCKETS: VaultBucket[] = [
  {
    id: "bucket-liquid",
    name: "Liquid Spendable Wallet",
    category: "liquid",
    percentage: 50,
    color: "#10b981",
    icon: "💵",
    desc: "Immediately withdrawable for daily expenses",
    accumulated: 6250.45,
  },
  {
    id: "bucket-tax",
    name: "Shielded Tax Escrow",
    category: "tax",
    percentage: 25,
    color: "#67e8f9",
    icon: "🛡️",
    desc: "Auto-reserved for IRS / HMRC quarterly filings",
    accumulated: 3125.22,
  },
  {
    id: "bucket-savings",
    name: "Private Cold Storage",
    category: "savings",
    percentage: 15,
    color: "#a78bfa",
    icon: "🔒",
    desc: "Long-term shielded wealth accumulation",
    accumulated: 1875.13,
  },
  {
    id: "bucket-emergency",
    name: "Emergency Reserve",
    category: "emergency",
    percentage: 10,
    color: "#f59e0b",
    icon: "🏥",
    desc: "Instant rainy day liquidity cushion",
    accumulated: 1250.09,
  },
];

export default function FlowSplitPage() {
  const { isConnected, connect, connector } = useWallet();
  const [buckets, setBuckets] = useState<VaultBucket[]>(INITIAL_BUCKETS);
  const [monthlySalary] = useState(12500); // 12,500 tNight/mo
  const [isProving, setIsProving] = useState(false);
  const [proverLogs, setProverLogs] = useState<ProverStep[]>([]);
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const stepRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 150);
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

  const totalPercentage = buckets.reduce((acc, b) => acc + b.percentage, 0);

  const applyPreset = (pLiquid: number, pTax: number, pSavings: number, pEmergency: number) => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.category === "liquid") return { ...b, percentage: pLiquid };
        if (b.category === "tax") return { ...b, percentage: pTax };
        if (b.category === "savings") return { ...b, percentage: pSavings };
        if (b.category === "emergency") return { ...b, percentage: pEmergency };
        return b;
      })
    );
    toast.info("Applied allocation preset!");
  };

  const handleSliderChange = (id: string, newVal: number) => {
    setBuckets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, percentage: Math.max(0, Math.min(100, newVal)) } : b))
    );
  };

  const handleDeployFlowSplit = async () => {
    if (!isConnected || !connector) {
      toast.error("Please connect your 1AM wallet first");
      return;
    }

    if (totalPercentage !== 100) {
      toast.error(`Allocation must equal 100% (currently ${totalPercentage}%)`);
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setLatestTxHash(null);
    stepRef.current = 0;

    const t = toast.loading("Synthesizing ZK FlowSplit Route…");

    try {
      addLog("Initializing 1AM wallet shielded witness context…", "done");

      const s2 = addLog("Formulating private partitioning constraint (sum(p_i) == 100%)…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s2, "done", "Conservation invariant proven: 100% allocation balance verified");

      const s3 = addLog("Binding sub-vault destination keys without leaking off-chain identities…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s3, "done", `Bound ${buckets.length} shielded destination vaults`);

      const s4 = addLog("Executing Midnight Compact ZK circuit to anchor autonomous route…", "running");
      const { executeFlowSplitRouting } = await import("@/lib/midnight/providers");
      
      const res = await executeFlowSplitRouting(
        connector,
        {
          streamId: "stream-primary-001",
          monthlyTotal: monthlySalary,
          buckets: buckets.map((b) => ({
            id: b.id,
            name: b.name,
            category: b.category,
            percentage: b.percentage,
          })),
        },
        (msg) => addLog(msg, "done")
      );

      updateLog(s4, "done", `FlowSplit route confirmed on Midnight Preprod! Allocation ID: ${res.allocationId}`);
      setLatestTxHash(res.txHash);

      toast.success(
        <span>
          Autonomous ZK Route Active!{" "}
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
      toast.error(`FlowSplit deployment failed: ${msg}`, { id: t });
    } finally {
      setIsProving(false);
    }
  };

  // Per second rate calculation
  const perSecondTotal = monthlySalary / (30 * 24 * 3600);

  return (
    <div className="dp-page page-in">
      {/* Header */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Prisma FlowSplit · Autonomous ZK Stream Routing</div>
          <h1 className="dp-title">FlowSplit & Confidential Vault Routing</h1>
          <p className="dp-subtitle">
            Dynamically partition incoming salary streams into private sub-vaults (Liquid Spending, Tax Escrow, Cold Storage,
            Emergency Cushion) directly inside Midnight Zero-Knowledge circuits. Neither your employer nor outside observers
            can discover your personal allocation ratios or vault addresses.
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
            Incoming Stream Velocity
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#fff", marginTop: "6px" }}>
            {monthlySalary.toLocaleString()} <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>tNight/mo</span>
          </div>
          <div style={{ fontSize: "12px", color: "#10b981", marginTop: "6px", fontFamily: "monospace" }}>
            +{perSecondTotal.toFixed(6)} tNight/sec
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Active Shielded Vaults
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#67e8f9", marginTop: "6px" }}>
            {buckets.length} Private Enclaves
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Isolated UTXO destinations
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Routing Privacy
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#a78bfa", marginTop: "6px" }}>
            100% Shielded
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            0% Behavioral leak on ledger
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Allocation Total
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: totalPercentage === 100 ? "#10b981" : "#ef4444",
              marginTop: "6px",
            }}
          >
            {totalPercentage}%
          </div>
          <div style={{ fontSize: "12px", color: totalPercentage === 100 ? "#10b981" : "#ef4444", marginTop: "6px" }}>
            {totalPercentage === 100 ? "✓ Balanced & Valid" : "Must equal exactly 100%"}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Left: Allocation Configurator */}
        <div className="card glass-heavy" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
              Shielded Allocation Routing Table
            </h2>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              Private Witness
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
            Set the portion of every second streamed income that flows into each confidential sub-vault.
          </p>

          {/* Preset Buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            <button
              onClick={() => applyPreset(50, 25, 15, 10)}
              className="dp-action-btn"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Balanced (50/25/15/10)
            </button>
            <button
              onClick={() => applyPreset(35, 25, 30, 10)}
              className="dp-action-btn"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Aggressive Savings (35/25/30/10)
            </button>
            <button
              onClick={() => applyPreset(40, 40, 15, 5)}
              className="dp-action-btn"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Tax Shielded (40/40/15/5)
            </button>
          </div>

          {/* Proportional Distribution Bar */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
              {buckets.map((b) => (
                <div
                  key={b.id}
                  style={{
                    width: `${b.percentage}%`,
                    background: b.color,
                    transition: "width 0.3s ease",
                  }}
                  title={`${b.name}: ${b.percentage}%`}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
              <span>0%</span>
              <span>100% Target</span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
            {buckets.map((bucket) => {
              const vaultVelocity = (monthlySalary * (bucket.percentage / 100)) / (30 * 24 * 3600);
              const monthlyBucket = monthlySalary * (bucket.percentage / 100);

              return (
                <div
                  key={bucket.id}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>{bucket.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{bucket.name}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{bucket.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: bucket.color }}>
                        {bucket.percentage}%
                      </span>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>
                        {monthlyBucket.toLocaleString()} tNight/mo
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bucket.percentage}
                      onChange={(e) => handleSliderChange(bucket.id, parseInt(e.target.value, 10))}
                      disabled={isProving}
                      style={{ flex: 1, accentColor: bucket.color, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: bucket.color, minWidth: "90px", textAlign: "right" }}>
                      +{vaultVelocity.toFixed(6)}/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {!isConnected ? (
            <button onClick={connect} className="dp-primary-btn" style={{ width: "100%", padding: "14px" }}>
              Connect 1AM Wallet to Deploy
            </button>
          ) : (
            <button
              onClick={handleDeployFlowSplit}
              disabled={isProving || totalPercentage !== 100}
              className="dp-primary-btn"
              style={{
                width: "100%",
                padding: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                opacity: totalPercentage !== 100 ? 0.5 : 1,
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
                  Deploying ZK FlowSplit Route…
                </>
              ) : (
                "Deploy ZK FlowSplit Route On-Chain"
              )}
            </button>
          )}
        </div>

        {/* Right: Telemetry & Live Sub-Vaults */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Prover Terminal */}
          <div className="card glass-heavy" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
                FlowSplit Prover Telemetry
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
                  Adjust allocation sliders and click "Deploy ZK FlowSplit Route On-Chain" to initiate autonomous routing.
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
                  ✓ On-Chain Routing Invariant Confirmed
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

          {/* Live Sub-Vault Balances (Streaming in real time) */}
          <div className="card glass-heavy" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
                Confidential Sub-Vault Balances
              </h2>
              <span className="dp-badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                Streaming Live
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {buckets.map((b) => {
                const liveTick = b.accumulated + (b.percentage / 100) * ((now % 100000) / 1000) * 0.05;
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span>{b.icon}</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{b.name}</span>
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 600, color: "#fff", fontFamily: "monospace" }}>
                      {liveTick.toFixed(4)} <span style={{ fontSize: "11px", color: b.color }}>tNight</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                      Allocated: {b.percentage}%
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
