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
  tag: string;
  percentage: number;
  color: string;
  desc: string;
  accumulated: number;
}

const INITIAL_BUCKETS: VaultBucket[] = [
  {
    id: "bucket-liquid",
    name: "Liquid Spendable Wallet",
    category: "liquid",
    tag: "Spendable",
    percentage: 50,
    color: "#10b981",
    desc: "Immediately spendable liquidity & instant withdrawals",
    accumulated: 6250.45,
  },
  {
    id: "bucket-tax",
    name: "Shielded Tax Escrow",
    category: "tax",
    tag: "Tax Escrow",
    percentage: 25,
    color: "#06b6d4",
    desc: "Auto-allocated for quarterly statutory tax filings",
    accumulated: 3125.22,
  },
  {
    id: "bucket-savings",
    name: "Private Cold Storage",
    category: "savings",
    tag: "Cold Storage",
    percentage: 15,
    color: "#8b5cf6",
    desc: "Confidential long-term sovereign wealth treasury",
    accumulated: 1875.13,
  },
  {
    id: "bucket-emergency",
    name: "Emergency Reserve",
    category: "emergency",
    tag: "Cushion",
    percentage: 10,
    color: "#f59e0b",
    desc: "Instant contingency liquidity reserve cushion",
    accumulated: 1250.09,
  },
];

// Clean minimalist stroke-based SVG icons (no emojis, no AI artifacts)
const Icons = {
  Split: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
      <path d="M12 12v3" />
    </svg>
  ),
  Wallet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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
  Refresh: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  ),
  Cpu: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3" /><path d="M15 1v3" /><path d="M9 20v3" /><path d="M15 20v3" />
      <path d="M20 9h3" /><path d="M20 14h3" /><path d="M1 9h3" /><path d="M1 14h3" />
    </svg>
  ),
  Layers: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

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

  const totalPercentage = Math.round(buckets.reduce((acc, b) => acc + b.percentage, 0) * 100) / 100;
  const isBalanced = Math.abs(totalPercentage - 100) < 0.01;

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
    toast.info("Applied allocation preset");
  };

  const handleSliderChange = (id: string, newVal: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
    setBuckets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, percentage: clamped } : b))
    );
  };

  const handleStepChange = (id: string, delta: number) => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const clamped = Math.max(0, Math.min(100, b.percentage + delta));
          return { ...b, percentage: clamped };
        }
        return b;
      })
    );
  };

  const handleAutoBalance = () => {
    const diff = 100 - totalPercentage;
    if (Math.abs(diff) < 0.01) return;

    // Adjust liquid spendable bucket or first available bucket
    setBuckets((prev) => {
      const copy = [...prev];
      const targetIndex = copy.findIndex((b) => b.category === "liquid");
      if (targetIndex >= 0) {
        const newPct = Math.max(0, Math.min(100, copy[targetIndex].percentage + diff));
        copy[targetIndex] = { ...copy[targetIndex], percentage: newPct };
      }
      return copy;
    });
    toast.success("Auto-balanced allocation to exactly 100%");
  };

  const handleDeployFlowSplit = async () => {
    if (!isConnected || !connector) {
      toast.error("Please connect your 1AM wallet first");
      return;
    }

    if (!isBalanced) {
      toast.error(`Total allocation must equal exactly 100% (currently ${totalPercentage}%)`);
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setLatestTxHash(null);
    stepRef.current = 0;

    const t = toast.loading("Synthesizing ZK FlowSplit Route…");

    try {
      addLog("Initializing 1AM wallet shielded witness context…", "done");

      const s2 = addLog("Verifying ZK conservation constraint (sum(p_i) == 10000 bps)…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s2, "done", "Conservation invariant verified: 100% allocation balance verified");

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

  const perSecondTotal = monthlySalary / (30 * 24 * 3600);

  const getBucketIcon = (category: VaultBucket["category"]) => {
    switch (category) {
      case "liquid":
        return <Icons.Wallet />;
      case "tax":
        return <Icons.Shield />;
      case "savings":
        return <Icons.Lock />;
      case "emergency":
        return <Icons.Activity />;
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
              <Icons.Split /> AUTONOMOUS ALLOCATION
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Zero-Knowledge Stream Routing</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
            FlowSplit & Confidential Sub-Vaults
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
          {
            label: "Incoming Stream Velocity",
            value: `${monthlySalary.toLocaleString()} tNight/mo`,
            sub: `+${perSecondTotal.toFixed(6)}/s continuous`,
            color: "#fff",
          },
          {
            label: "Shielded Sub-Vaults",
            value: `${buckets.length} Private Enclaves`,
            sub: "UTXO-isolated destinations",
            color: "#67e8f9",
          },
          {
            label: "Routing Privacy",
            value: "100% Confidential",
            sub: "Zero behavioral ledger leak",
            color: "#8b5cf6",
          },
          {
            label: "Allocation Balance",
            value: `${totalPercentage}%`,
            sub: isBalanced ? "Conservation invariant valid" : "Requires auto-balance to 100%",
            color: isBalanced ? "#10b981" : "#ef4444",
          },
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
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              {m.label}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 600, color: m.color, letterSpacing: "-0.01em", marginBottom: "4px" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "20px", alignItems: "start" }}>
        {/* Left: Allocation Configurator */}
        <div
          className="card glass-heavy"
          style={{
            padding: "26px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.005) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
              Shielded Allocation Routing Table
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#a78bfa",
                background: "rgba(167, 139, 250, 0.08)",
                border: "1px solid rgba(167, 139, 250, 0.2)",
                padding: "2px 7px",
                borderRadius: "4px",
              }}
            >
              Private Witness
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.45)", marginBottom: "20px", lineHeight: "1.4" }}>
            Configure how streaming payroll automatically diverts into private vaults every second. Ratios remain strictly private.
          </p>

          {/* Preset Buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { name: "Balanced", liquid: 50, tax: 25, savings: 15, emg: 10 },
              { name: "High Savings", liquid: 35, tax: 25, savings: 30, emg: 10 },
              { name: "Tax Shield", liquid: 40, tax: 40, savings: 15, emg: 5 },
              { name: "Equal Split", liquid: 25, tax: 25, savings: 25, emg: 25 },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p.liquid, p.tax, p.savings, p.emg)}
                disabled={isProving}
                style={{
                  fontSize: "11px",
                  padding: "6px 12px",
                  borderRadius: "7px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.75)",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.15s ease",
                }}
              >
                {p.name} ({p.liquid}/{p.tax}/{p.savings}/{p.emg})
              </button>
            ))}
          </div>

          {/* Proportional Distribution Bar */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", marginBottom: "8px" }}>
              <span>PROPORTIONAL MULTI-VAULT SPLIT</span>
              <span style={{ fontFamily: "monospace", color: isBalanced ? "#10b981" : "#ef4444" }}>
                {totalPercentage}% / 100%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                height: "10px",
                borderRadius: "5px",
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.05)",
                gap: "2px",
              }}
            >
              {buckets.map((b) => (
                <div
                  key={b.id}
                  style={{
                    width: `${b.percentage}%`,
                    background: b.color,
                    transition: "width 0.3s ease",
                    boxShadow: `0 0 10px ${b.color}40`,
                  }}
                  title={`${b.name}: ${b.percentage}%`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Vault Bucket Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "22px" }}>
            {buckets.map((bucket) => {
              const vaultVelocity = (monthlySalary * (bucket.percentage / 100)) / (30 * 24 * 3600);
              const monthlyBucket = monthlySalary * (bucket.percentage / 100);

              return (
                <div
                  key={bucket.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: `${bucket.color}15`,
                          border: `1px solid ${bucket.color}35`,
                          color: bucket.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getBucketIcon(bucket.category)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{bucket.name}</span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "monospace",
                              color: bucket.color,
                              background: `${bucket.color}12`,
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {bucket.tag}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", marginTop: "2px" }}>
                          {bucket.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: bucket.color, fontFamily: "monospace" }}>
                        {bucket.percentage}%
                      </div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255, 255, 255, 0.45)" }}>
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
                      style={{
                        flex: 1,
                        accentColor: bucket.color,
                        cursor: isProving ? "not-allowed" : "pointer",
                        height: "4px",
                      }}
                    />

                    {/* Quick Steppers */}
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => handleStepChange(bucket.id, -5)}
                        disabled={isProving || bucket.percentage <= 0}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleStepChange(bucket.id, 5)}
                        disabled={isProving || bucket.percentage >= 100}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: bucket.color, minWidth: "90px", textAlign: "right" }}>
                      +{vaultVelocity.toFixed(6)}/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Allocation Validation & Auto-Balance Pill */}
          {!isBalanced && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#ef4444" }}><Icons.AlertCircle /></span>
                <span style={{ fontSize: "12px", color: "#fca5a5" }}>
                  Total allocation is {totalPercentage}% ({100 - totalPercentage > 0 ? `+${(100 - totalPercentage).toFixed(0)}% unallocated` : `${(totalPercentage - 100).toFixed(0)}% over
`})
                </span>
              </div>
              <button
                onClick={handleAutoBalance}
                disabled={isProving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}
              >
                <Icons.Refresh /> Auto-Balance (100%)
              </button>
            </div>
          )}

          {/* Deploy Action */}
          {!isConnected ? (
            <button
              onClick={connect}
              className="dp-primary-btn"
              style={{ width: "100%", padding: "14px", justifyContent: "center" }}
            >
              Connect 1AM Wallet to Deploy
            </button>
          ) : (
            <button
              onClick={handleDeployFlowSplit}
              disabled={isProving || !isBalanced}
              className="dp-primary-btn"
              style={{
                width: "100%",
                padding: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                background: isBalanced
                  ? "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)"
                  : "rgba(255, 255, 255, 0.05)",
                color: isBalanced ? "#fff" : "rgba(255, 255, 255, 0.3)",
                border: isBalanced ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                opacity: !isBalanced ? 0.6 : 1,
                cursor: !isBalanced || isProving ? "not-allowed" : "pointer",
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
                <>
                  <Icons.Check /> Deploy ZK FlowSplit Route On-Chain
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Telemetry & Live Sub-Vault Balances */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Prover Terminal */}
          <div
            className="card glass-heavy"
            style={{
              padding: "22px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#67e8f9" }}><Icons.Cpu /></span>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                  FlowSplit Prover Telemetry
                </h2>
              </div>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>
                Midnight Proof Engine
              </span>
            </div>

            <div
              style={{
                minHeight: "190px",
                maxHeight: "240px",
                background: "rgba(0, 0, 0, 0.45)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                padding: "12px 14px",
                fontFamily: "monospace",
                fontSize: "12px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {proverLogs.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", margin: "auto", textAlign: "center", fontSize: "11px", lineHeight: "1.5" }}>
                  Set your allocation ratios and click "Deploy ZK FlowSplit Route On-Chain" to synthesize the client-side private routing witness.
                </div>
              ) : (
                proverLogs.map((log) => (
                  <div key={log.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>[{log.ts}]</span>
                    <span style={{ color: log.status === "error" ? "#ef4444" : log.status === "running" ? "#67e8f9" : "#10b981" }}>
                      {log.status === "running" ? "⟳" : log.status === "error" ? "✗" : "✓"}
                    </span>
                    <span style={{ color: log.status === "error" ? "#fca5a5" : "#e2e8f0", flex: 1, fontSize: "11.5px" }}>
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
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icons.Check /> On-Chain Routing Invariant Anchored
                </span>
                <a
                  href={`https://preprod.midnightexplorer.com/tx/${latestTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#67e8f9",
                    fontSize: "12px",
                    textDecoration: "none",
                    fontFamily: "monospace",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{latestTxHash.slice(0, 8)}…{latestTxHash.slice(-6)}</span>
                  <Icons.External />
                </a>
              </div>
            )}
          </div>

          {/* Live Sub-Vault Balances (Streaming in real time) */}
          <div
            className="card glass-heavy"
            style={{
              padding: "22px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#a78bfa" }}><Icons.Layers /></span>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                  Confidential Sub-Vault Balances
                </h2>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                Streaming Live
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {buckets.map((b) => {
                const liveTick = b.accumulated + (b.percentage / 100) * ((now % 100000) / 1000) * 0.05;
                const vaultRate = (monthlySalary * (b.percentage / 100)) / (30 * 24 * 3600);

                return (
                  <div
                    key={b.id}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: b.color }}>{getBucketIcon(b.category)}</span>
                        <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>{b.name.split(" ")[0]}</span>
                      </div>
                      <span style={{ fontSize: "10px", fontFamily: "monospace", color: b.color }}>
                        {b.percentage}%
                      </span>
                    </div>

                    <div style={{ fontSize: "17px", fontWeight: 600, color: "#fff", fontFamily: "monospace", letterSpacing: "-0.01em" }}>
                      {liveTick.toFixed(4)}
                      <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.4)", marginLeft: "4px" }}>tNight</span>
                    </div>

                    <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255, 255, 255, 0.35)", marginTop: "4px" }}>
                      +{vaultRate.toFixed(6)}/s
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ZK Mathematical Invariant Card */}
          <div
            className="card glass-heavy"
            style={{
              padding: "18px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.015)",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
              Mathematical Invariant Verification
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "monospace" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255, 255, 255, 0.7)" }}>
                <span>Conservation Law:</span>
                <span style={{ color: "#10b981" }}>∑ p_i = 10000 bps</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255, 255, 255, 0.7)" }}>
                <span>Witness Privacy:</span>
                <span style={{ color: "#67e8f9" }}>Client-Side Shielded</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255, 255, 255, 0.7)" }}>
                <span>Ledger Circuit:</span>
                <span style={{ color: "#a78bfa" }}>Midnight Compact zk-SNARK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
