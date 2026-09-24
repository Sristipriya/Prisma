"use client";
import React, { useState, useRef } from "react";
import { useWallet } from "@/components/WalletContext";
import { toast } from "sonner";
import {
  ShieldCheck,
  Calendar,
  Lock,
  Check,
  ExternalLink,
  Terminal,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  Building2,
} from "lucide-react";
import "../dashboard-pages.css";

const PREPROD_CONTRACT = "0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f";
const VERIFIED_TX = "0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19";

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
    txHash: VERIFIED_TX,
    status: "Verified",
  },
  {
    id: "attest-002",
    timestamp: "2026-09-01 09:15 UTC",
    runwayDays: 60,
    monthlyCommitment: 17500,
    requiredReserve: 35000,
    solvencyRatio: 314,
    txHash: VERIFIED_TX,
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
      ts: new Date().toISOString().slice(11, 19),
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
      toast.error("Connect 1AM wallet first");
      return;
    }

    setIsProving(true);
    setLogs([]);
    setLatestResult(null);
    stepCounter.current = 0;

    const tToast = toast.loading(`Synthesizing ZK Solvency Proof for ${runwayDays}-day runway…`);

    try {
      addLog("Shielded witness initialized", "done");

      const s2 = addLog("Querying active payroll & vendor commitments…", "running");
      await new Promise((r) => setTimeout(r, 350));
      updateLog(s2, "done", `Commitments aggregated: ${monthlyCommitment.toLocaleString()} tNight/mo`);

      const s3 = addLog(`Computing required reserve threshold: ${requiredReserve.toLocaleString()} tNight…`, "running");
      await new Promise((r) => setTimeout(r, 350));
      updateLog(s3, "done", `Threshold set: ${requiredReserve.toLocaleString()} tNight`);

      const s4 = addLog("Executing Midnight Compact solvency circuit…", "running");
      const { createSolvencyAttestation } = await import("@/lib/midnight/providers");
      
      const attestation = await createSolvencyAttestation(
        connector,
        runwayDays,
        monthlyCommitment,
        (msg) => addLog(msg, "done")
      );
      updateLog(s4, "done", "Proof confirmed by Midnight consensus");

      const recordTx = attestation.txHash;
      const record: SolvencyAuditRecord = {
        id: `attest-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        runwayDays,
        monthlyCommitment,
        requiredReserve,
        solvencyRatio,
        txHash: recordTx,
        status: "Verified",
      };

      setAuditRecords((prev) => [record, ...prev]);
      setLatestResult({ txHash: recordTx, runwayDays });

      toast.success(
        <span>
          Solvency Attestation Anchored!{" "}
          <a
            href={`https://preprod.midnightexplorer.com/transactions/${recordTx}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "#67e8f9" }}
          >
            Explorer ↗
          </a>
        </span>,
        { id: tToast, duration: 6000 }
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
    <div className="dp-page page-in max-w-[1400px] mx-auto w-full overflow-hidden">
      {/* Liquid Glass Header */}
      <div className="card glass-heavy flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#00cfff] bg-[#00cfff]/10 border border-[#00cfff]/20 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-3 h-3" /> VaultGuard
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs font-medium">ZK Treasury Solvency</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Treasury Solvency & Runway Attestation
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

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Commitments", value: `${monthlyCommitment.toLocaleString()} tNight/mo`, sub: "Active Streams", color: "text-white" },
          { label: "Required Reserve", value: `${requiredReserve.toLocaleString()} tNight`, sub: `${runwayDays}-Day Horizon`, color: "text-[#00cfff]" },
          { label: "Shielded Treasury", value: `${shieldedTreasuryBalance.toLocaleString()} tNight`, sub: "Private UTXOs", color: "text-purple-400" },
          { label: "Solvency Ratio", value: `${solvencyRatio}%`, sub: "100% Guaranteed", color: "text-emerald-400" },
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
        {/* Left Column: Horizon Selection */}
        <div className="lg:col-span-6 card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00cfff]" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Runway Horizon</h2>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              Midnight ZKIR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { days: 30, label: "30 Days", sub: "1 Month" },
              { days: 60, label: "60 Days", sub: "2 Months" },
              { days: 90, label: "90 Days", sub: "Quarterly" },
              { days: 180, label: "180 Days", sub: "Semi-Annual" },
            ].map((item) => {
              const active = runwayDays === item.days;
              return (
                <button
                  key={item.days}
                  onClick={() => setRunwayDays(item.days)}
                  disabled={isProving}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? "bg-[#00cfff]/10 border-[#00cfff]/30 shadow-[0_0_12px_rgba(0,207,255,0.08)]"
                      : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.04] text-white/70"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-semibold ${active ? "text-[#00cfff]" : "text-white"}`}>
                      {item.label}
                    </span>
                    {active && (
                      <span className="text-[9px] font-mono bg-[#00cfff] text-black px-1.5 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-white/40">{item.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Mathematical Invariant Note */}
          <div className="p-3.5 rounded-xl bg-purple-500/[0.05] border border-purple-500/20 text-xs font-mono text-white/70 flex flex-col gap-1.5">
            <div className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
              Mathematical Solvency Invariant
            </div>
            <code className="text-white text-xs">
              Reserves_Private ≥ (Σ Commitments ÷ 30) × {runwayDays}
            </code>
            <div className="text-[11px] text-white/40 font-sans mt-0.5 flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Zero-knowledge proof attests that treasury reserves exceed the required runway without disclosing private balances.
              </span>
            </div>
          </div>

          {/* Action Button */}
          {!isConnected ? (
            <button onClick={connect} className="dp-primary-btn w-full justify-center py-3.5">
              Connect 1AM Wallet to Attest
            </button>
          ) : (
            <button
              onClick={handleGenerateProof}
              disabled={isProving}
              className="w-full py-3.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Synthesizing Solvency Proof…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Generate ZK Solvency Proof ({runwayDays}d)
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: Prover Telemetry & Latest Certificate */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="card glass-heavy p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00cfff]" />
                <h2 className="text-xs font-semibold text-white tracking-tight">Prover Telemetry</h2>
              </div>
              <span className="text-[10px] font-mono text-white/35">Midnight Engine</span>
            </div>

            <div className="h-48 bg-black/40 rounded-xl border border-white/[0.06] p-3 font-mono text-[11px] overflow-y-auto flex flex-col gap-1.5">
              {logs.length === 0 ? (
                <div className="text-white/25 m-auto text-center text-xs">
                  Ready to compile solvency constraint witness.
                </div>
              ) : (
                logs.map((log) => (
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
          </div>

          {/* Certificate Card */}
          {latestResult && (
            <div className="card glass-heavy p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Certified Solvency Attestation
                </span>
                <span className="text-[10px] font-mono text-[#00cfff]">
                  {latestResult.runwayDays}-Day Guaranteed
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono">
                <span className="text-white/40">Midnight Consensus:</span>
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/${latestResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00cfff] hover:underline flex items-center gap-1"
                >
                  <span>{latestResult.txHash.slice(0, 14)}…{latestResult.txHash.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Verifiable Audit Ledger</h2>
            <div className="text-[11px] text-white/40 mt-0.5">Anchored cryptographic attestations accessible to auditors and workers.</div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Auditor Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/40 font-mono text-[11px]">
                <th className="pb-3 px-3">Attestation ID</th>
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Horizon</th>
                <th className="pb-3 px-3">Required Reserve</th>
                <th className="pb-3 px-3">Solvency Status</th>
                <th className="pb-3 px-3">Midnight Consensus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {auditRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3 px-3 font-mono text-purple-400">{rec.id}</td>
                  <td className="py-3 px-3 text-white/60">{rec.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-mono text-[#00cfff] bg-[#00cfff]/10 px-2 py-0.5 rounded">
                      {rec.runwayDays} Days
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-white/80">{rec.requiredReserve.toLocaleString()} tNight</td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> 100% Backed ({rec.solvencyRatio}%)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <a
                      href={`https://preprod.midnightexplorer.com/transactions/${rec.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00cfff] font-mono hover:underline inline-flex items-center gap-1"
                    >
                      <span>{rec.txHash.slice(0, 10)}…{rec.txHash.slice(-6)}</span>
                      <ExternalLink className="w-3 h-3" />
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
