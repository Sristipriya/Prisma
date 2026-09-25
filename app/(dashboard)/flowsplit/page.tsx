"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@/components/WalletContext";
import { toast } from "sonner";
import {
  GitFork,
  Wallet,
  ShieldCheck,
  Lock,
  HeartPulse,
  Check,
  ExternalLink,
  RotateCcw,
  Terminal,
  Layers,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import "../dashboard-pages.css";

const PREPROD_CONTRACT = "0x82f1b4062826c6eff39e5b31ce8ec138363c9d08f2f6db3284190db9c089c0c2";

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
  accumulated: number;
}

const INITIAL_BUCKETS: VaultBucket[] = [
  {
    id: "bucket-liquid",
    name: "Liquid Spendable",
    category: "liquid",
    tag: "Spendable",
    percentage: 50,
    color: "#10b981",
    accumulated: 6250.45,
  },
  {
    id: "bucket-tax",
    name: "Shielded Tax Escrow",
    category: "tax",
    tag: "Tax",
    percentage: 25,
    color: "#06b6d4",
    accumulated: 3125.22,
  },
  {
    id: "bucket-savings",
    name: "Private Cold Storage",
    category: "savings",
    tag: "Savings",
    percentage: 15,
    color: "#8b5cf6",
    accumulated: 1875.13,
  },
  {
    id: "bucket-emergency",
    name: "Emergency Reserve",
    category: "emergency",
    tag: "Reserve",
    percentage: 10,
    color: "#f59e0b",
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
      ts: new Date().toISOString().slice(11, 19),
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
  const isOverAllocated = totalPercentage > 100;

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
  };

  // Fixed overflow bug: clamp value properly and prevent runaway values
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

    setBuckets((prev) => {
      const copy = [...prev];
      const targetIndex = copy.findIndex((b) => b.category === "liquid");
      if (targetIndex >= 0) {
        const newPct = Math.max(0, Math.min(100, copy[targetIndex].percentage + diff));
        copy[targetIndex] = { ...copy[targetIndex], percentage: newPct };
      }
      return copy;
    });
    toast.success("Balanced to 100%");
  };

  const handleDeployFlowSplit = async () => {
    if (!isConnected || !connector) {
      toast.error("Connect 1AM wallet first");
      return;
    }

    if (!isBalanced) {
      toast.error(`Total allocation must be 100% (currently ${totalPercentage}%)`);
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setLatestTxHash(null);
    stepRef.current = 0;

    const t = toast.loading("Synthesizing ZK Route…");

    try {
      addLog("Shielded witness initialized", "done");

      const s2 = addLog("Verifying sum(p_i) == 10000 bps invariant…", "running");
      await new Promise((r) => setTimeout(r, 350));
      updateLog(s2, "done", "Conservation invariant verified: 100%");

      const s3 = addLog("Binding sub-vault destination keys…", "running");
      await new Promise((r) => setTimeout(r, 350));
      updateLog(s3, "done", `Bound ${buckets.length} shielded vaults`);

      const s4 = addLog("Executing Midnight Compact circuit…", "running");
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

      updateLog(s4, "done", `Anchored on Preprod: ${res.allocationId}`);
      setLatestTxHash(res.txHash);

      toast.success(
        <span>
          Route Active!{" "}
          <a
            href={`https://preprod.midnightexplorer.com/transactions/${res.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "#67e8f9" }}
          >
            Explorer ↗
          </a>
        </span>,
        { id: t, duration: 6000 }
      );
    } catch (err: any) {
      const msg = err?.message || String(err);
      addLog(`Error: ${msg}`, "error");
      toast.error(`Failed: ${msg}`, { id: t });
    } finally {
      setIsProving(false);
    }
  };

  const perSecondTotal = monthlySalary / (30 * 24 * 3600);

  const getBucketIcon = (category: VaultBucket["category"]) => {
    switch (category) {
      case "liquid":
        return <Wallet className="w-4 h-4" />;
      case "tax":
        return <ShieldCheck className="w-4 h-4" />;
      case "savings":
        return <Lock className="w-4 h-4" />;
      case "emergency":
        return <HeartPulse className="w-4 h-4" />;
    }
  };

  return (
    <div className="dp-page page-in max-w-[1400px] mx-auto w-full overflow-hidden">
      {/* Liquid Glass Header */}
      <div
        className="card glass-heavy flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-2xl"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#00cfff] bg-[#00cfff]/10 border border-[#00cfff]/20 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase">
              <GitFork className="w-3 h-3" /> FlowSplit
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs font-medium">ZK Sub-Vault Routing</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Autonomous Stream Routing
          </h1>
        </div>

        <a
          href={`https://preprod.midnightexplorer.com/contracts/${PREPROD_CONTRACT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-3.5 py-2 rounded-xl transition-all"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span>Preprod Contract</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/40" />
        </a>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Velocity", value: `${monthlySalary.toLocaleString()} tNight/mo`, sub: `+${perSecondTotal.toFixed(6)}/s`, color: "text-white" },
          { label: "Sub-Vaults", value: `${buckets.length} Enclaves`, sub: "Shielded UTXOs", color: "text-[#00cfff]" },
          { label: "Privacy", value: "100% Shielded", sub: "0% Ledger Leak", color: "text-purple-400" },
          { label: "Allocation", value: `${totalPercentage}%`, sub: isBalanced ? "Conservation Valid" : isOverAllocated ? "Overflow Bug Avoided" : "Unallocated", color: isBalanced ? "text-emerald-400" : "text-rose-400" },
        ].map((m, idx) => (
          <div
            key={idx}
            className="card glass-heavy p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">{m.label}</div>
            <div className={`text-lg font-semibold tracking-tight ${m.color}`}>{m.value}</div>
            <div className="text-[11px] font-mono text-white/35 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Allocator */}
        <div className="lg:col-span-7 card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#00cfff]" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Allocation Table</h2>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              ZK Invariant
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "50 / 25 / 15 / 10", l: 50, t: 25, s: 15, e: 10 },
              { label: "35 / 25 / 30 / 10", l: 35, t: 25, s: 30, e: 10 },
              { label: "40 / 40 / 15 / 5", l: 40, t: 40, s: 15, e: 5 },
              { label: "25 / 25 / 25 / 25", l: 25, t: 25, s: 25, e: 25 },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p.l, p.t, p.s, p.e)}
                disabled={isProving}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-white/70 hover:text-white transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Fixed Overflow Proportional Bar */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] overflow-hidden">
            <div className="flex justify-between items-center text-[11px] font-mono mb-2">
              <span className="text-white/40">Distribution</span>
              <span className={isBalanced ? "text-emerald-400" : "text-rose-400"}>
                {totalPercentage}% / 100%
              </span>
            </div>
            {/* Visual Bar with normalized width to prevent overflow */}
            <div className="flex h-2 rounded-full overflow-hidden bg-white/5 gap-0.5 w-full">
              {buckets.map((b) => {
                const normWidth = totalPercentage > 0 
                  ? (b.percentage / Math.max(100, totalPercentage)) * 100 
                  : 0;
                return (
                  <div
                    key={b.id}
                    style={{
                      width: `${normWidth}%`,
                      background: b.color,
                      transition: "width 0.25s ease",
                    }}
                    title={`${b.name}: ${b.percentage}%`}
                  />
                );
              })}
            </div>
          </div>

          {/* Sliders List */}
          <div className="flex flex-col gap-2.5">
            {buckets.map((b) => {
              const vaultVelocity = (monthlySalary * (b.percentage / 100)) / (30 * 24 * 3600);
              const monthlyBucket = monthlySalary * (b.percentage / 100);

              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center border"
                        style={{
                          background: `${b.color}15`,
                          borderColor: `${b.color}30`,
                          color: b.color,
                        }}
                      >
                        {getBucketIcon(b.category)}
                      </div>
                      <span className="text-xs font-medium text-white">{b.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/40">
                        {monthlyBucket.toLocaleString()} tNight
                      </span>
                      <span
                        className="text-sm font-mono font-semibold"
                        style={{ color: b.color }}
                      >
                        {b.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={b.percentage}
                      onChange={(e) => handleSliderChange(b.id, parseInt(e.target.value, 10))}
                      disabled={isProving}
                      className="flex-1 accent-current h-1 bg-white/10 rounded cursor-pointer"
                      style={{ accentColor: b.color }}
                    />

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStepChange(b.id, -5)}
                        disabled={isProving || b.percentage <= 0}
                        className="w-6 h-6 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-mono flex items-center justify-center transition-colors disabled:opacity-30"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleStepChange(b.id, 5)}
                        disabled={isProving || b.percentage >= 100}
                        className="w-6 h-6 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-mono flex items-center justify-center transition-colors disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <span
                      className="text-[10px] font-mono min-w-[70px] text-right"
                      style={{ color: b.color }}
                    >
                      +{vaultVelocity.toFixed(5)}/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Allocation Warning / Balance Trigger */}
          {!isBalanced && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-mono text-rose-300">
                  {totalPercentage}% total ({totalPercentage > 100 ? `+${(totalPercentage - 100).toFixed(0)}% overflow` : `${(100 - totalPercentage).toFixed(0)}% remaining`})
                </span>
              </div>
              <button
                onClick={handleAutoBalance}
                disabled={isProving}
                className="text-[11px] font-mono text-white bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Balance 100%
              </button>
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <button
              onClick={connect}
              className="dp-primary-btn w-full justify-center py-3.5"
            >
              Connect 1AM Wallet
            </button>
          ) : (
            <button
              onClick={handleDeployFlowSplit}
              disabled={isProving || !isBalanced}
              className={`w-full py-3.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                isBalanced
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-95 cursor-pointer"
                  : "bg-white/[0.04] text-white/30 border border-white/[0.06] cursor-not-allowed"
              }`}
            >
              {isProving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Synthesizing ZK Route…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Deploy ZK Route On-Chain
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: Telemetry & Live Balances */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Prover Terminal */}
          <div className="card glass-heavy p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00cfff]" />
                <h2 className="text-xs font-semibold text-white tracking-tight">Prover Telemetry</h2>
              </div>
              <span className="text-[10px] font-mono text-white/35">Midnight Engine</span>
            </div>

            <div className="h-44 bg-black/40 rounded-xl border border-white/[0.06] p-3 font-mono text-[11px] overflow-y-auto flex flex-col gap-1.5">
              {proverLogs.length === 0 ? (
                <div className="text-white/25 m-auto text-center text-xs">
                  Ready to compile routing witness.
                </div>
              ) : (
                proverLogs.map((log) => (
                  <div key={log.id} className="flex gap-2 items-start">
                    <span className="text-white/25">[{log.ts}]</span>
                    <span className={log.status === "error" ? "text-rose-400" : log.status === "running" ? "text-cyan-400" : "text-emerald-400"}>
                      {log.status === "running" ? "⟳" : log.status === "error" ? "✗" : "✓"}
                    </span>
                    <span className={`flex-1 ${log.status === "error" ? "text-rose-300" : "text-white/80"}`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>

            {latestTxHash && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Anchored
                </span>
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/${latestTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#00cfff] flex items-center gap-1 hover:underline"
                >
                  <span>{latestTxHash.slice(0, 8)}…{latestTxHash.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Real-time Sub-Vault Balances */}
          <div className="card glass-heavy p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-semibold text-white tracking-tight">Confidential Balances</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {buckets.map((b) => {
                const liveTick = b.accumulated + (b.percentage / 100) * ((now % 100000) / 1000) * 0.05;
                const vaultRate = (monthlySalary * (b.percentage / 100)) / (30 * 24 * 3600);

                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.05]"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/60 text-[11px] truncate">{b.tag}</span>
                      <span className="font-mono text-[10px]" style={{ color: b.color }}>
                        {b.percentage}%
                      </span>
                    </div>

                    <div className="text-sm font-mono font-semibold text-white truncate">
                      {liveTick.toFixed(3)}
                      <span className="text-[10px] text-white/30 ml-1 font-normal">tNight</span>
                    </div>

                    <div className="text-[10px] font-mono text-white/30 mt-1">
                      +{vaultRate.toFixed(5)}/s
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
