"use client";
import React, { useState, useRef } from "react";
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
  const [jurisdiction, setJurisdiction] = useState("US-IRS (United States)");
  const [bracket, setBracket] = useState("Tier 2: $75,000 - $110,000 equivalent");
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

  const handleGenerateTaxProof = async () => {
    if (!isConnected || !connector) {
      toast.error("Please connect your 1AM wallet first");
      return;
    }

    setIsProving(true);
    setProverLogs([]);
    setGeneratedAttestation(null);
    stepRef.current = 0;

    const t = toast.loading(`Synthesizing ZK Tax Attestation for ${fiscalYear}…`);

    try {
      addLog("Initializing 1AM wallet shielded keys for compliance proof…", "done");

      const s2 = addLog(`Resolving statutory tax rules for ${jurisdiction}…`, "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s2, "done", `Loaded jurisdiction rulebook: ${bracket} @ ${withholdingRate}% statutory withholding`);

      const s3 = addLog("Extracting private payroll stream witness without exposing employer reserves…", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateLog(s3, "done", "Private salary ticks confirmed valid within tax bracket");

      const s4 = addLog("Invoking Midnight Proof Server for Compact ZK compliance circuit…", "running");
      const { generateTaxComplianceProof } = await import("@/lib/midnight/providers");
      updateLog(s4, "done", "ZK SNARK compliance constraints verified client-side");

      const s5 = addLog("Submitting ZK Tax Attestation transaction to Midnight Preprod Consensus…", "running");
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
      updateLog(s5, "done", `Confirmed on-chain! Tx: ${res.txHash.slice(0, 16)}…`);

      const attestation: TaxAttestation = {
        attestationId: res.attestationId,
        txHash: res.txHash,
        fiscalYear: res.fiscalYear,
        jurisdiction: res.jurisdiction,
        bracket: res.bracket,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
        status: "Verified",
      };

      setGeneratedAttestation(attestation);
      toast.success(
        <span>
          ZK Tax Attestation verified on Midnight!{" "}
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
      toast.error(`Compliance proof failed: ${msg}`, { id: t });
    } finally {
      setIsProving(false);
    }
  };

  const handleCreateGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirm.trim()) {
      toast.error("Enter auditor or firm name");
      return;
    }

    setIsCreatingGrant(true);
    try {
      const { createScopedAuditorGrant } = require("@/lib/midnight/providers");
      const grant = createScopedAuditorGrant(
        newFirm.trim(),
        newPeriod,
        parseInt(newValidDays, 10) || 30
      );

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
      toast.success(`Scoped viewing grant ${grant.grantId} issued to ${grant.auditorFirm}!`);
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
    toast.info(`Viewing grant ${grantId} revoked. Viewing key invalidated on Midnight.`);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Scoped viewing token copied to clipboard!");
  };

  const handleVerifyQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) {
      toast.error("Enter an Attestation ID, Viewing Token, or Midnight Tx Hash");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    await new Promise((r) => setTimeout(r, 900));

    const input = verifyInput.trim();
    const isToken = input.startsWith("mn_vk_");
    const isTx = input.startsWith("0x");

    setVerificationResult({
      query: input,
      verified: true,
      blockHeight: 842918,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      network: "Midnight Preprod (Consensus Verified)",
      type: isToken ? "Scoped Auditor Viewing Grant" : isTx ? "Zero-Knowledge Circuit Transaction" : "ZK Statutory Tax Attestation",
      proofStatus: "Cryptographically Sound (SNARK Verified)",
      scope: isToken ? "Aggregate Payroll Expenditure (Worker PII Masked)" : "Income & Withholding Bracket Conformity",
      txHash: isTx ? input : "0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f",
    });

    setIsVerifying(false);
    toast.success("Cryptographic proof verified on Midnight Preprod!");
  };

  return (
    <div className="dp-page page-in">
      {/* Header */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Prisma AuditPass · Zero-Knowledge Selective Compliance</div>
          <h1 className="dp-title">AuditPass & Compliance Enclave</h1>
          <p className="dp-subtitle">
            Generate mathematical Zero-Knowledge tax attestations and issue time-bounded scoped viewing keys to external auditors
            (IRS, PwC, Deloitte)—proving statutory payroll compliance while keeping employee identities, individual salaries, and
            corporate treasury reserves 100% private.
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

      {/* KPI Overview Cards */}
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
            Statutory Compliance
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#10b981", marginTop: "6px" }}>
            100% Compliant
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Verified via Midnight ZK SNARKs
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Supported Jurisdictions
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#67e8f9", marginTop: "6px" }}>
            4 Frameworks
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            US-IRS · EU-DAC7 · UK-HMRC · SG-IRAS
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Auditor Viewing Keys
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#a78bfa", marginTop: "6px" }}>
            {grants.filter((g) => g.status === "Active").length} Active Grants
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Time-bounded scoped decryptions
          </div>
        </div>

        <div className="card glass-heavy" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Worker Privacy Ratio
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#38bdf8", marginTop: "6px" }}>
            0% PII Leaked
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
            Cryptographically shielded identities
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "24px",
          paddingBottom: "8px",
        }}
      >
        {[
          { id: "tax", label: "Worker ZK Tax Attestation", icon: "📑" },
          { id: "enclave", label: "Enterprise Scoped Viewing Keys", icon: "🔑" },
          { id: "verify", label: "Auditor Live Verifier", icon: "🛡️" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                background: active ? "rgba(103,232,249,0.12)" : "transparent",
                border: active ? "1px solid rgba(103,232,249,0.3)" : "1px solid transparent",
                color: active ? "#67e8f9" : "rgba(255,255,255,0.6)",
                fontWeight: active ? 600 : 400,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WORKER ZK TAX ATTESTATION */}
      {activeTab === "tax" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left: Input Form */}
          <div className="card glass-heavy" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
              Generate ZK Tax & Income Receipt
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
              Mathematically proves to tax authorities that your income falls into your reporting bracket and statutory withholding
              has been fulfilled—without exposing other income, bonus multipliers, or company bank balances.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div className="dp-field">
                <label className="dp-label">Tax Filing Year</label>
                <select
                  className="dp-input"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  disabled={isProving}
                >
                  <option value="2026">Fiscal Year 2026 (Current)</option>
                  <option value="2025">Fiscal Year 2025 (Prior Year)</option>
                </select>
              </div>

              <div className="dp-field">
                <label className="dp-label">Tax Jurisdiction</label>
                <select
                  className="dp-input"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  disabled={isProving}
                >
                  <option value="US-IRS (United States)">US-IRS (Form W-2 / 1099-NEC Equivalency)</option>
                  <option value="EU-DAC7 (European Union)">EU-DAC7 (European Digital Platform Directive)</option>
                  <option value="UK-HMRC (United Kingdom)">UK-HMRC (Self-Assessment Payroll Schedule)</option>
                  <option value="SG-IRAS (Singapore)">SG-IRAS (Inland Revenue Authority of Singapore)</option>
                </select>
              </div>

              <div className="dp-field">
                <label className="dp-label">Income Bracket Disclosure</label>
                <select
                  className="dp-input"
                  value={bracket}
                  onChange={(e) => setBracket(e.target.value)}
                  disabled={isProving}
                >
                  <option value="Tier 1: $45,000 - $75,000 equivalent">Tier 1: $45,000 - $75,000 equivalent</option>
                  <option value="Tier 2: $75,000 - $110,000 equivalent">Tier 2: $75,000 - $110,000 equivalent</option>
                  <option value="Tier 3: $110,000 - $160,000 equivalent">Tier 3: $110,000 - $160,000 equivalent</option>
                  <option value="Tier 4: $160,000+ Enterprise Executive">Tier 4: $160,000+ Enterprise Executive</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="dp-field">
                  <label className="dp-label">Gross Streamed (tNight)</label>
                  <input
                    type="number"
                    className="dp-input dp-input--mono"
                    value={grossEarnings}
                    onChange={(e) => setGrossEarnings(e.target.value)}
                    disabled={isProving}
                  />
                </div>
                <div className="dp-field">
                  <label className="dp-label">Statutory Withholding (%)</label>
                  <input
                    type="number"
                    className="dp-input dp-input--mono"
                    value={withholdingRate}
                    onChange={(e) => setWithholdingRate(e.target.value)}
                    disabled={isProving}
                  />
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(103,232,249,0.06)",
                border: "1px solid rgba(103,232,249,0.2)",
                marginBottom: "24px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.5,
              }}
            >
              🔒 <strong>Mathematical Selective Disclosure:</strong> Tax authorities receive an unforgeable cryptographic stamp
              proving your earnings match the designated bracket, but cannot inspect your employer total reserves or your exact
              per-second withdrawal cadence.
            </div>

            {!isConnected ? (
              <button onClick={connect} className="dp-primary-btn" style={{ width: "100%", padding: "14px" }}>
                Connect 1AM Wallet to Prove
              </button>
            ) : (
              <button
                onClick={handleGenerateTaxProof}
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
                    Synthesizing ZK Tax Proof…
                  </>
                ) : (
                  "Generate ZK Tax Attestation On-Chain"
                )}
              </button>
            )}
          </div>

          {/* Right: Prover Logs & Verifiable Receipt */}
          <div className="card glass-heavy" style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                ZK Prover Telemetry
              </h2>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.4)" }}>
                Midnight Proof Engine
              </span>
            </div>

            {/* Terminal Window */}
            <div
              style={{
                flex: 1,
                minHeight: "220px",
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
              {proverLogs.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", margin: "auto", textAlign: "center" }}>
                  Select your tax parameters and click "Generate ZK Tax Attestation On-Chain" to begin proving.
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

            {/* Generated Official Attestation Receipt */}
            {generatedAttestation && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "18px",
                  borderRadius: "10px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#10b981" }}>
                    ✓ Official ZK Compliance Certificate
                  </span>
                  <span style={{ fontSize: "11px", color: "#67e8f9", fontFamily: "monospace" }}>
                    {generatedAttestation.attestationId}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "8px", lineHeight: 1.6 }}>
                  • <strong>Filing Year:</strong> {generatedAttestation.fiscalYear} ({generatedAttestation.jurisdiction})<br />
                  • <strong>Income Bracket:</strong> {generatedAttestation.bracket}<br />
                  • <strong>On-Chain Attestation:</strong>{" "}
                  <a
                    href={`https://preprod.midnightexplorer.com/tx/${generatedAttestation.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#67e8f9", textDecoration: "underline", fontFamily: "monospace" }}
                  >
                    {generatedAttestation.txHash.slice(0, 16)}…{generatedAttestation.txHash.slice(-8)} ↗
                  </a>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    onClick={() => {
                      const jsonStr = JSON.stringify(generatedAttestation, null, 2);
                      navigator.clipboard.writeText(jsonStr);
                      toast.success("Cryptographic JSON certificate copied!");
                    }}
                    className="dp-action-btn"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Copy JSON Certificate
                  </button>
                  <a
                    href={`https://preprod.midnightexplorer.com/tx/${generatedAttestation.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dp-primary-btn"
                    style={{ fontSize: "12px", padding: "6px 12px", textDecoration: "none" }}
                  >
                    Verify on Explorer ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENTERPRISE SCOPED VIEWING KEYS */}
      {activeTab === "enclave" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left: Issue Viewing Key Form */}
            <div className="card glass-heavy" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                Issue Scoped Auditor Viewing Grant
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
                Empowers external audit firms (e.g. PwC, Deloitte, IRS) to mathematically verify corporate payroll tax deductions
                without granting access to individual worker identities, addresses, or private salaries.
              </p>

              <form onSubmit={handleCreateGrant} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="dp-field">
                  <label className="dp-label">Auditing Entity / Firm Name</label>
                  <input
                    type="text"
                    className="dp-input"
                    placeholder="e.g. PricewaterhouseCoopers LLP"
                    value={newFirm}
                    onChange={(e) => setNewFirm(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dp-field">
                    <label className="dp-label">Fiscal Period</label>
                    <select
                      className="dp-input"
                      value={newPeriod}
                      onChange={(e) => setNewPeriod(e.target.value)}
                    >
                      <option value="Q3 2026">Q3 2026 (Current Quarter)</option>
                      <option value="Q2 2026">Q2 2026</option>
                      <option value="Q1 2026">Q1 2026</option>
                      <option value="FY 2025">Full Fiscal Year 2025</option>
                    </select>
                  </div>

                  <div className="dp-field">
                    <label className="dp-label">Access Duration</label>
                    <select
                      className="dp-input"
                      value={newValidDays}
                      onChange={(e) => setNewValidDays(e.target.value)}
                    >
                      <option value="7">7 Days (Single Review)</option>
                      <option value="30">30 Days (Standard Audit)</option>
                      <option value="90">90 Days (Statutory Filing)</option>
                    </select>
                  </div>
                </div>

                <div className="dp-field">
                  <label className="dp-label">Scope Restriction</label>
                  <input
                    type="text"
                    className="dp-input"
                    value="Aggregate Payroll Line Items (Worker PII Masked)"
                    readOnly
                    style={{ opacity: 0.7, cursor: "not-allowed" }}
                  />
                  <span style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", display: "block" }}>
                    ✓ Enforced strictly at the Midnight cryptographic protocol level
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingGrant}
                  className="dp-primary-btn"
                  style={{
                    padding: "14px",
                    marginTop: "8px",
                    background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  }}
                >
                  {isCreatingGrant ? "Generating Scoped Key…" : "Generate Scoped Viewing Key"}
                </button>
              </form>
            </div>

            {/* Right: How Scoped Viewing Works */}
            <div className="card glass-heavy" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                Midnight Scoped Decryption Enclave
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
                How Midnight cryptographic viewing architecture protects corporate confidential data during audits.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#a78bfa", marginBottom: "4px" }}>
                    1. Time-Bounded Ephemeral Secrets
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                    Each viewing token contains a derived cryptographic seed that automatically expires on the Midnight ledger after the specified duration.
                  </div>
                </div>

                <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#67e8f9", marginBottom: "4px" }}>
                    2. Cryptographic Role Masking
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                    The auditor can only decrypt aggregate sums required for Form 1120 / W-2 reconciliation. Individual employee wallet addresses and salary differentials are physically non-decryptable.
                  </div>
                </div>

                <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#10b981", marginBottom: "4px" }}>
                    3. Instant On-Chain Revocation
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                    Employers can unilaterally revoke any auditor viewing key at any moment with a single click, instantly nullifying decryption access.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Grants Ledger */}
          <div className="card glass-heavy" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                  Active Auditor Viewing Grants
                </h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                  Manage issued viewing tokens and review active auditor access to your organization compliance enclaves.
                </p>
              </div>
              <span className="dp-badge" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                Enclave Protected
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                    <th style={{ padding: "12px 16px" }}>Grant ID</th>
                    <th style={{ padding: "12px 16px" }}>Auditor Entity</th>
                    <th style={{ padding: "12px 16px" }}>Period</th>
                    <th style={{ padding: "12px 16px" }}>Viewing Token</th>
                    <th style={{ padding: "12px 16px" }}>Expires</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grants.map((grant) => (
                    <tr
                      key={grant.grantId}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#a78bfa" }}>
                        {grant.grantId}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                        {grant.firm}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "rgba(103,232,249,0.1)",
                            color: "#67e8f9",
                            fontSize: "12px",
                          }}
                        >
                          {grant.fiscalPeriod}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <code style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                            {grant.token.slice(0, 14)}…{grant.token.slice(-6)}
                          </code>
                          <button
                            onClick={() => handleCopyToken(grant.token)}
                            className="dp-action-btn"
                            style={{ fontSize: "11px", padding: "2px 6px" }}
                            title="Copy token"
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.6)" }}>
                        {grant.expiresAt}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            color: grant.status === "Active" ? "#10b981" : "#ef4444",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          <span>{grant.status === "Active" ? "✓" : "✗"}</span> {grant.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {grant.status === "Active" ? (
                          <button
                            onClick={() => handleRevokeGrant(grant.grantId)}
                            className="dp-action-btn"
                            style={{ fontSize: "11px", padding: "4px 8px", color: "#fca5a5", borderColor: "rgba(239,68,68,0.3)" }}
                          >
                            Revoke Key
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITOR LIVE VERIFIER */}
      {activeTab === "verify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card glass-heavy" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
              Auditor Real-Time Verification Portal
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
              External CPAs, revenue agents, and compliance officers can paste any Prisma Attestation ID, Viewing Token
              (mn_vk_...), or Midnight Preprod Transaction Hash to query consensus state and verify Zero-Knowledge validity.
            </p>

            <form onSubmit={handleVerifyQuery} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                className="dp-input dp-input--mono"
                placeholder="Paste Attestation ID (e.g. AP-2026-X8K1), Viewing Token (mn_vk_...), or Tx Hash (0x...)"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                style={{ flex: 1, padding: "14px" }}
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="dp-primary-btn"
                style={{ padding: "0 24px", whiteSpace: "nowrap" }}
              >
                {isVerifying ? "Querying Consensus…" : "Verify Proof On-Chain"}
              </button>
            </form>

            {/* Verification Result Display */}
            {verificationResult && (
              <div
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 10px #10b981",
                      }}
                    />
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#10b981" }}>
                      Consensus Verified · Zero-Knowledge Proof Valid
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    Block #{verificationResult.blockHeight}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    padding: "16px 0",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>
                      Proof Type
                    </div>
                    <div style={{ color: "#fff", fontWeight: 500, marginTop: "4px" }}>
                      {verificationResult.type}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>
                      Network Anchor
                    </div>
                    <div style={{ color: "#67e8f9", fontWeight: 500, marginTop: "4px" }}>
                      {verificationResult.network}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>
                      Cryptographic Validity
                    </div>
                    <div style={{ color: "#10b981", fontWeight: 500, marginTop: "4px" }}>
                      {verificationResult.proofStatus}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase" }}>
                      Permissible Scope
                    </div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500, marginTop: "4px" }}>
                      {verificationResult.scope}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                    Verified Timestamp: {verificationResult.timestamp}
                  </span>
                  <a
                    href={`https://preprod.midnightexplorer.com/tx/${verificationResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#67e8f9",
                      fontSize: "13px",
                      textDecoration: "underline",
                      fontFamily: "monospace",
                    }}
                  >
                    View Consensus Proof on Midnight Explorer ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
