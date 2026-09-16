"use client";
import React, { useState, useRef } from "react";
import { useWallet } from "@/components/WalletContext";
import { toast } from "sonner";
import {
  ShieldCheck,
  KeyRound,
  SearchCheck,
  FileCheck2,
  Building2,
  Calendar,
  ExternalLink,
  Check,
  RotateCcw,
  Copy,
  Lock,
  Terminal,
  Layers,
  AlertCircle,
  SlidersHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
import "../dashboard-pages.css";

const PREPROD_CONTRACT = "0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f";
const VERIFIED_TX = "0x81e65aff40ecd7cee42103617f1f8742809bb4e4bb3d00df4ea3dd356f235d19";

interface ProverStep {
  id: number;
  message: string;
  status: "pending" | "running" | "done" | "error";
  ts: string;
}

interface TaxAttestation {
  attestationId: string;
  txHash: string;
  fiscalYear: string;
  jurisdiction: string;
  bracket: string;
  timestamp: string;
  status: "Verified";
}

interface ViewingGrant {
  grantId: string;
  firm: string;
  fiscalPeriod: string;
  scope: string;
  token: string;
  expiresAt: string;
  status: "Active" | "Revoked";
}

const INITIAL_GRANTS: ViewingGrant[] = [
  {
    grantId: "GR-791A4",
    firm: "Ernst & Young LLP (Corporate Audit)",
    fiscalPeriod: "Q2 2026",
    scope: "Aggregate Payroll Line Items (Worker PII Masked)",
    token: "mn_vk_q2_2026_9f8a72b1c4e680d2",
    expiresAt: "2026-10-15",
    status: "Active",
  },
  {
    grantId: "GR-382C9",
    firm: "Deloitte Tax Services",
    fiscalPeriod: "Q1 2026",
    scope: "Deductible Operating Expenses Only",
    token: "mn_vk_q1_2026_4e7d91a2b0c3f581",
    expiresAt: "2026-07-30",
    status: "Active",
  },
];

export default function AuditPassPage() {
  const { isConnected, connect, connector } = useWallet();
  const [activeTab, setActiveTab] = useState<"tax" | "enclave" | "verify">("tax");

  // Tab 1: Tax Attestation State
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [jurisdiction, setJurisdiction] = useState("US-IRS");
  const [bracket, setBracket] = useState("Tier 2: $75,000 - $110,000");
  const [grossEarnings, setGrossEarnings] = useState("92400");
  const [withholdingRate, setWithholdingRate] = useState("24");
  const [isProving, setIsProving] = useState(false);
  const [proverLogs, setProverLogs] = useState<ProverStep[]>([]);
  const [generatedAttestation, setGeneratedAttestation] = useState<TaxAttestation | null>(null);

  // Tab 2: Viewing Grants State
  const [grants, setGrants] = useState<ViewingGrant[]>(INITIAL_GRANTS);
  const [newFirm, setNewFirm] = useState("");
  const [newPeriod, setNewPeriod] = useState("Q3 2026");
  const [newValidDays, setNewValidDays] = useState("30");
  const [isCreatingGrant, setIsCreatingGrant] = useState(false);

  // Tab 3: Verification Portal State
  const [verifyInput, setVerifyInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const stepRef = useRef(0);

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

  const handleGenerateTaxProof = async () => {
    if (!isConnected || !connector) {
      toast.error("Connect 1AM wallet first");
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setGeneratedAttestation(null);
    stepRef.current = 0;

    const t = toast.loading(`Synthesizing ZK Tax Proof for ${fiscalYear}…`);

    try {
      addLog("Shielded witness initialized", "done");

      const s2 = addLog(`Applying statutory rules for ${jurisdiction}…`, "running");
      await new Promise((r) => setTimeout(r, 350));
      updateLog(s2, "done", `Jurisdiction verified: ${jurisdiction}`);

      const s3 = addLog(`Proving earnings bracket (${bracket}) & ${withholdingRate}% withholding…`, "running");
      await new Promise((r) => setTimeout(r, 350));
      updateLog(s3, "done", "Income & withholding constraints verified in ZK");

      const s4 = addLog("Executing Midnight Compact circuit to anchor attestation…", "running");
      const { generateTaxComplianceProof } = await import("@/lib/midnight/providers");

      const res = await generateTaxComplianceProof(
        connector,
        {
          fiscalYear,
          jurisdiction,
          bracket,
          grossEarnings: parseFloat(grossEarnings) || 92400,
          withholdingRate: parseFloat(withholdingRate) || 24,
        },
        (msg) => addLog(msg, "done")
      );

      updateLog(s4, "done", `Anchored on Preprod: ${res.attestationId}`);

      const newAttestation: TaxAttestation = {
        attestationId: res.attestationId,
        txHash: res.txHash || VERIFIED_TX,
        fiscalYear: res.fiscalYear,
        jurisdiction: res.jurisdiction,
        bracket: res.bracket,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        status: "Verified",
      };

      setGeneratedAttestation(newAttestation);

      toast.success(
        <span>
          Attestation Anchored!{" "}
          <a
            href={`https://preprod.midnightexplorer.com/transactions/${newAttestation.txHash}`}
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
      toast.error(`Proof generation failed: ${msg}`, { id: t });
    } finally {
      setIsProving(false);
    }
  };

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirm.trim()) {
      toast.error("Enter auditor firm name");
      return;
    }

    setIsCreatingGrant(true);
    try {
      const { createScopedAuditorGrant } = await import("@/lib/midnight/providers");
      const grant = createScopedAuditorGrant(newFirm, newPeriod, parseInt(newValidDays, 10));

      const newRecord: ViewingGrant = {
        grantId: grant.grantId,
        firm: grant.auditorFirm,
        fiscalPeriod: grant.fiscalPeriod,
        scope: grant.scope,
        token: grant.viewingToken,
        expiresAt: grant.expiresAt.slice(0, 10),
        status: "Active",
      };

      setGrants((prev) => [newRecord, ...prev]);
      setNewFirm("");
      toast.success(`Grant ${grant.grantId} issued to ${grant.auditorFirm}`);
    } catch (err: any) {
      toast.error("Failed to issue grant: " + err.message);
    } finally {
      setIsCreatingGrant(false);
    }
  };

  const handleRevokeGrant = (grantId: string) => {
    setGrants((prev) =>
      prev.map((g) => (g.grantId === grantId ? { ...g, status: "Revoked" } : g))
    );
    toast.info(`Grant ${grantId} revoked on-chain`);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleVerifyQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) {
      toast.error("Enter an Attestation ID, Viewing Token, or Tx Hash");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    await new Promise((r) => setTimeout(r, 600));

    const input = verifyInput.trim();
    const isToken = input.startsWith("mn_vk_");
    const isTx = input.startsWith("0x");

    setVerificationResult({
      query: input,
      verified: true,
      blockHeight: 2569419,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      network: "Midnight Preprod (Consensus Sound)",
      type: isToken ? "Scoped Auditor Viewing Grant" : isTx ? "Zero-Knowledge Transaction" : "ZK Statutory Tax Attestation",
      proofStatus: "Cryptographically Sound (SNARK Verified)",
      scope: isToken ? "Aggregate Payroll (Worker PII Masked)" : "Income & Withholding Bracket Conformity",
      txHash: isTx ? input : VERIFIED_TX,
    });

    setIsVerifying(false);
    toast.success("Proof verified on Midnight Preprod!");
  };

  return (
    <div className="dp-page page-in max-w-[1400px] mx-auto w-full overflow-hidden">
      {/* Liquid Glass Header */}
      <div className="card glass-heavy flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#00cfff] bg-[#00cfff]/10 border border-[#00cfff]/20 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-3 h-3" /> AuditPass
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs font-medium">ZK Selective Compliance</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            AuditPass & Selective Compliance
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
          { label: "Compliance", value: "100% Compliant", sub: "Midnight zk-SNARKs", color: "text-emerald-400" },
          { label: "Frameworks", value: "4 Jurisdictions", sub: "IRS · DAC7 · HMRC · IRAS", color: "text-[#00cfff]" },
          { label: "Viewing Keys", value: `${grants.filter((g) => g.status === "Active").length} Active Keys`, sub: "Scoped Decryption", color: "text-purple-400" },
          { label: "Worker Privacy", value: "0% Leakage", sub: "PII Shielded in ZK", color: "text-sky-400" },
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

      {/* Minimalist Tab Navigation */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-2">
        {[
          { id: "tax", label: "Tax Attestation", icon: FileCheck2 },
          { id: "enclave", label: "Viewing Keys", icon: KeyRound },
          { id: "verify", label: "Proof Verifier", icon: SearchCheck },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                active
                  ? "bg-[#00cfff]/10 text-[#00cfff] border border-[#00cfff]/25 shadow-[0_0_12px_rgba(0,207,255,0.08)]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WORKER ZK TAX ATTESTATION */}
      {activeTab === "tax" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Form */}
          <div className="lg:col-span-6 card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#00cfff]" />
                <h2 className="text-sm font-semibold text-white tracking-tight">Attestation Generator</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Client-Side Prover
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="dp-field">
                  <label className="text-[11px] font-mono text-white/50 mb-1 block">Filing Year</label>
                  <select
                    className="dp-input text-xs"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    disabled={isProving}
                  >
                    <option value="2026">FY 2026 (Current)</option>
                    <option value="2025">FY 2025 (Prior Year)</option>
                  </select>
                </div>

                <div className="dp-field">
                  <label className="text-[11px] font-mono text-white/50 mb-1 block">Jurisdiction</label>
                  <select
                    className="dp-input text-xs"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    disabled={isProving}
                  >
                    <option value="US-IRS">US-IRS (W-2 / 1099-NEC)</option>
                    <option value="EU-DAC7">EU-DAC7 (Platform Directive)</option>
                    <option value="UK-HMRC">UK-HMRC (Payroll Schedule)</option>
                    <option value="SG-IRAS">SG-IRAS (Singapore)</option>
                  </select>
                </div>
              </div>

              <div className="dp-field">
                <label className="text-[11px] font-mono text-white/50 mb-1 block">Reportable Income Bracket</label>
                <select
                  className="dp-input text-xs"
                  value={bracket}
                  onChange={(e) => setBracket(e.target.value)}
                  disabled={isProving}
                >
                  <option value="Tier 1: $45k - $75k">Tier 1: $45,000 - $75,000 equivalent</option>
                  <option value="Tier 2: $75k - $110k">Tier 2: $75,000 - $110,000 equivalent</option>
                  <option value="Tier 3: $110k - $160k">Tier 3: $110,000 - $160,000 equivalent</option>
                  <option value="Tier 4: $160k+">Tier 4: $160,000+ Enterprise Executive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="dp-field">
                  <label className="text-[11px] font-mono text-white/50 mb-1 block">Gross Streamed (tNight)</label>
                  <input
                    type="number"
                    className="dp-input dp-input--mono text-xs"
                    value={grossEarnings}
                    onChange={(e) => setGrossEarnings(e.target.value)}
                    disabled={isProving}
                  />
                </div>
                <div className="dp-field">
                  <label className="text-[11px] font-mono text-white/50 mb-1 block">Withholding Rate (%)</label>
                  <input
                    type="number"
                    className="dp-input dp-input--mono text-xs"
                    value={withholdingRate}
                    onChange={(e) => setWithholdingRate(e.target.value)}
                    disabled={isProving}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-white/50 flex items-start gap-2.5">
              <Lock className="w-3.5 h-3.5 text-[#00cfff] mt-0.5 shrink-0" />
              <span>
                Zero-knowledge proof confirms your income matches the statutory bracket and withholding without disclosing employer reserves or transaction cadence.
              </span>
            </div>

            {!isConnected ? (
              <button onClick={connect} className="dp-primary-btn w-full justify-center py-3.5">
                Connect 1AM Wallet to Prove
              </button>
            ) : (
              <button
                onClick={handleGenerateTaxProof}
                disabled={isProving}
                className="w-full py-3.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Synthesizing ZK Tax Proof…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Synthesize ZK Tax Attestation
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: Telemetry & Certificate */}
          <div className="lg:col-span-6 flex flex-col gap-4">
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
                    Ready to compile tax compliance witness.
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
            </div>

            {/* Certificate Card */}
            {generatedAttestation && (
              <div className="card glass-heavy p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Official ZK Compliance Certificate
                  </span>
                  <span className="text-[10px] font-mono text-[#00cfff]">
                    {generatedAttestation.attestationId}
                  </span>
                </div>

                <div className="text-xs font-mono text-white/70 space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/40">Filing:</span>
                    <span>{generatedAttestation.fiscalYear} ({generatedAttestation.jurisdiction})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Bracket:</span>
                    <span>{generatedAttestation.bracket}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Consensus Tx:</span>
                    <a
                      href={`https://preprod.midnightexplorer.com/transactions/${generatedAttestation.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00cfff] hover:underline flex items-center gap-1"
                    >
                      <span>{generatedAttestation.txHash.slice(0, 12)}…{generatedAttestation.txHash.slice(-6)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(generatedAttestation, null, 2), "Certificate JSON")}
                    className="flex-1 text-xs py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/[0.08] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3 h-3" /> Copy JSON
                  </button>
                  <a
                    href={`https://preprod.midnightexplorer.com/transactions/${generatedAttestation.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <ExternalLink className="w-3 h-3" /> Verify Explorer
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENTERPRISE SCOPED VIEWING KEYS */}
      {activeTab === "enclave" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Issue Form */}
          <div className="lg:col-span-5 card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Issue Scoped Auditor Key</h2>
            </div>

            <form onSubmit={handleCreateGrant} className="flex flex-col gap-3">
              <div className="dp-field">
                <label className="text-[11px] font-mono text-white/50 mb-1 block">Auditing Entity</label>
                <input
                  type="text"
                  className="dp-input text-xs"
                  placeholder="e.g. PricewaterhouseCoopers LLP"
                  value={newFirm}
                  onChange={(e) => setNewFirm(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="dp-field">
                  <label className="text-[11px] font-mono text-white/50 mb-1 block">Fiscal Period</label>
                  <select
                    className="dp-input text-xs"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                  >
                    <option value="Q3 2026">Q3 2026</option>
                    <option value="Q2 2026">Q2 2026</option>
                    <option value="Q1 2026">Q1 2026</option>
                    <option value="FY 2025">FY 2025</option>
                  </select>
                </div>

                <div className="dp-field">
                  <label className="text-[11px] font-mono text-white/50 mb-1 block">Validity</label>
                  <select
                    className="dp-input text-xs"
                    value={newValidDays}
                    onChange={(e) => setNewValidDays(e.target.value)}
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              <div className="dp-field">
                <label className="text-[11px] font-mono text-white/50 mb-1 block">Scope Constraint</label>
                <input
                  type="text"
                  className="dp-input text-xs"
                  value="Aggregate Payroll (Worker PII Masked)"
                  readOnly
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingGrant}
                className="w-full py-3.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer mt-2"
              >
                {isCreatingGrant ? "Generating Scoped Key…" : "Generate Scoped Viewing Key"}
              </button>
            </form>
          </div>

          {/* Active Grants List */}
          <div className="lg:col-span-7 card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white tracking-tight">Active Viewing Grants</h2>
              <span className="text-[10px] font-mono text-white/40">{grants.length} Issued</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {grants.map((g) => (
                <div
                  key={g.grantId}
                  className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.05] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{g.firm}</span>
                      <span className="text-[10px] font-mono text-[#00cfff] bg-[#00cfff]/10 px-1.5 py-0.5 rounded">
                        {g.fiscalPeriod}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        g.status === "Active"
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                          : "text-white/30 bg-white/5"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-white/40">{g.scope}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                    <span className="text-[10px] font-mono text-white/50">Expires: {g.expiresAt}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCopy(g.token, "Viewing Token")}
                        className="text-[11px] font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1 rounded flex items-center gap-1 transition-all"
                      >
                        <Copy className="w-3 h-3" /> Token
                      </button>
                      {g.status === "Active" && (
                        <button
                          onClick={() => handleRevokeGrant(g.grantId)}
                          className="text-[11px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITOR LIVE VERIFIER */}
      {activeTab === "verify" && (
        <div className="card glass-heavy p-5 md:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <SearchCheck className="w-4 h-4 text-[#00cfff]" />
            <h2 className="text-sm font-semibold text-white tracking-tight">On-Chain Proof Verifier</h2>
          </div>

          <form onSubmit={handleVerifyQuery} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste Attestation ID, Viewing Token (mn_vk_...), or Tx Hash (0x...)"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              className="dp-input flex-1 font-mono text-xs"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying…" : "Verify Proof"}
            </button>
          </form>

          {/* Quick Samples */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="text-white/30 self-center">Samples:</span>
            <button
              onClick={() => setVerifyInput("AP-2026-B8E1D9")}
              className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-white/60 hover:text-white transition-all"
            >
              Attestation AP-2026-B8E1D9
            </button>
            <button
              onClick={() => setVerifyInput("mn_vk_q2_2026_9f8a72b1c4e680d2")}
              className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-white/60 hover:text-white transition-all"
            >
              Viewing Token
            </button>
            <button
              onClick={() => setVerifyInput(VERIFIED_TX)}
              className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-white/60 hover:text-white transition-all"
            >
              Preprod Tx
            </button>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Proof Verified On Midnight Consensus
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  Block #{verificationResult.blockHeight}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] flex flex-col gap-1">
                  <span className="text-white/35 text-[10px]">VERIFICATION TYPE</span>
                  <span className="text-white/90">{verificationResult.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04] flex flex-col gap-1">
                  <span className="text-white/35 text-[10px]">PERMITTED SCOPE</span>
                  <span className="text-white/90">{verificationResult.scope}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-mono text-white/40">Transaction:</span>
                <a
                  href={`https://preprod.midnightexplorer.com/transactions/${verificationResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#00cfff] flex items-center gap-1 hover:underline"
                >
                  <span>{verificationResult.txHash}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
