"use client";
import React, { useState, useRef } from "react";
import { useWallet } from "@/components/WalletContext";
import { toast } from "sonner";
import "../dashboard-pages.css";

interface Step {
  id: number;
  message: string;
  status: "pending" | "running" | "done" | "error";
  ts: string;
}

const CONTRACT_ADDRESS =
  "0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f";

export default function CircuitDemoPage() {
  const { isConnected, connect, connector } = useWallet();
  const [amount, setAmount] = useState("10");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState<{ txHash: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stepRef = useRef(0);

  const addStep = (message: string, status: Step["status"] = "done") => {
    stepRef.current += 1;
    const step: Step = {
      id: stepRef.current,
      message,
      status,
      ts: new Date().toISOString().slice(11, 23),
    };
    setSteps((prev) => [...prev, step]);
    return step.id;
  };

  const updateStep = (id: number, status: Step["status"], message?: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, ...(message ? { message } : {}) } : s
      )
    );
  };

  const handleRun = async () => {
    if (!isConnected || !connector) {
      toast.error("Connect your 1AM wallet first");
      return;
    }
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum < 1) {
      toast.error("Enter a valid amount (≥ 1 tNight)");
      return;
    }

    setRunning(true);
    setSteps([]);
    setResult(null);
    setError(null);
    stepRef.current = 0;

    try {
      addStep("Wallet connected — reading shielded keys…", "done");

      const s2 = addStep("Loading Midnight SDK providers…", "running");
      const { callPayrollCircuit } = await import("@/lib/midnight/providers");
      updateStep(s2, "done", "Midnight SDK providers ready");

      addStep(
        `Target contract: ${CONTRACT_ADDRESS.slice(0, 20)}…${CONTRACT_ADDRESS.slice(-8)} (Preprod)`,
        "done"
      );

      const s4 = addStep("Calling spend() circuit — building ZK transaction…", "running");

      const txResult = await callPayrollCircuit(connector, amtNum, (msg) => {
        addStep(msg, "done");
      });

      updateStep(s4, "done", "ZK transaction built and signed");

      setResult(txResult);
      addStep(`Circuit call complete. Tx hash: ${txResult.txHash}`, "done");
      toast.success("ZK circuit executed successfully!");
    } catch (err: any) {
      const msg = err?.message || String(err);
      addStep(`Error: ${msg}`, "error");
      setError(msg);
      toast.error("Circuit call failed: " + msg);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setSteps([]);
    setResult(null);
    setError(null);
    stepRef.current = 0;
  };

  return (
    <div className="dp-page page-in">
      {/* Header */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Live Midnight Network</div>
          <h1 className="dp-title">ZK Circuit Demo</h1>
          <p className="dp-subtitle">
            Executes the <code>spend()</code> circuit on the deployed Preprod
            contract in real-time. Generates a ZK proof and submits a live
            transaction to Midnight Preprod.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "monospace",
            }}
          >
            Contract
          </span>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              color: "rgba(139,92,246,0.9)",
            }}
          >
            {CONTRACT_ADDRESS.slice(0, 22)}…
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Midnight Preprod
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left: Input Panel */}
        <div className="card glass-heavy" style={{ padding: "28px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "20px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Circuit Parameters
          </h2>

          {/* Circuit info */}
          <div
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "rgba(139,92,246,0.8)",
                fontFamily: "monospace",
                marginBottom: "6px",
              }}
            >
              CIRCUIT
            </div>
            <code
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              payroll::spend(amount: Uint&lt;32&gt;)
            </code>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                marginTop: "6px",
              }}
            >
              Verifies spend ≤ budget · Updates total_paid ledger state
            </div>
          </div>

          {/* Wallet gate */}
          {!isConnected ? (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "rgba(239,68,68,0.9)",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              >
                1AM / Lace wallet required
              </p>
              <button onClick={connect} className="dp-primary-btn">
                Connect Wallet
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
                padding: "10px 14px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  boxShadow: "0 0 6px #10b981",
                }}
              />
              <span style={{ fontSize: "13px", color: "rgba(16,185,129,0.9)" }}>
                Wallet connected — ready to sign
              </span>
            </div>
          )}

          {/* Amount input */}
          <div className="dp-field" style={{ marginBottom: "20px" }}>
            <label className="dp-label">Spend Amount (tNight)</label>
            <input
              className="dp-input dp-input--mono"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              disabled={running}
            />
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                marginTop: "4px",
                display: "block",
              }}
            >
              Must be ≤ contract budget · Proved by ZK circuit
            </span>
          </div>

          {/* Run / Reset buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleRun}
              disabled={running || !isConnected}
              className="dp-primary-btn"
              style={{ flex: 1 }}
            >
              {running ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Running…
                </span>
              ) : (
                "▶ Run ZK Circuit"
              )}
            </button>
            <button
              onClick={reset}
              disabled={running}
              className="dp-action-btn"
              style={{ padding: "0 16px" }}
            >
              Reset
            </button>
          </div>

          {/* Privacy model note */}
          <div
            style={{
              marginTop: "24px",
              padding: "14px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Privacy Model
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.6" }}>
              <b style={{ color: "rgba(139,92,246,0.8)" }}>Public ledger:</b> total_paid counter only
              <br />
              <b style={{ color: "rgba(139,92,246,0.8)" }}>Private witness:</b> exact amount, employer identity
              <br />
              <b style={{ color: "rgba(139,92,246,0.8)" }}>ZK proof:</b> cryptographically proves amount ≤ budget
            </div>
          </div>
        </div>

        {/* Right: Live Log Panel */}
        <div className="card glass-heavy" style={{ padding: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
              Live Execution Log
            </h2>
            {running && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                />
                LIVE
              </span>
            )}
          </div>

          {/* Terminal log area */}
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "16px",
              minHeight: "240px",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "1.8",
              overflowY: "auto",
              maxHeight: "320px",
            }}
          >
            {steps.length === 0 ? (
              <span style={{ color: "rgba(255,255,255,0.2)" }}>
                Waiting for circuit execution…
              </span>
            ) : (
              steps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    color:
                      step.status === "error"
                        ? "rgba(239,68,68,0.9)"
                        : step.status === "running"
                        ? "rgba(251,191,36,0.9)"
                        : "rgba(16,185,129,0.9)",
                    marginBottom: "2px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.2)", minWidth: "80px" }}>
                    [{step.ts}]
                  </span>
                  <span>
                    {step.status === "error" ? "✗" : step.status === "running" ? "⟳" : "✓"}{" "}
                    {step.message}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Result display */}
          {result && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(16,185,129,0.8)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                ✓ Circuit Succeeded
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                Transaction Hash
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.8)",
                  wordBreak: "break-all",
                  background: "rgba(0,0,0,0.3)",
                  padding: "8px 10px",
                  borderRadius: "6px",
                }}
              >
                {result.txHash}
              </div>
              <a
                href={`https://preprod.midnightexplorer.com/transactions/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dp-text-link"
                style={{ marginTop: "10px", display: "inline-block", fontSize: "12px" }}
              >
                View on Preprod Explorer →
              </a>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "rgba(239,68,68,0.9)",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: how it works */}
      <div
        className="card glass-heavy"
        style={{ padding: "28px", marginTop: "4px" }}
      >
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            marginBottom: "16px",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          How This Circuit Call Works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            fontSize: "12px",
          }}
        >
          {[
            {
              n: "1",
              title: "Wallet Signs",
              desc: "1AM wallet signs the unbound transaction with your shielded spending key",
            },
            {
              n: "2",
              title: "ZK Proof Generated",
              desc: "spend.prover key generates a PLONK proof that amount ≤ budget without revealing amount",
            },
            {
              n: "3",
              title: "Proof Verified On-chain",
              desc: "Midnight nodes verify the proof using spend.verifier before accepting the transaction",
            },
            {
              n: "4",
              title: "Ledger Updated",
              desc: "Only total_paid counter is updated publicly. The spend amount stays private.",
            },
          ].map((item) => (
            <div
              key={item.n}
              style={{
                padding: "14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.2)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  color: "rgba(139,92,246,0.9)",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                {item.n}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: "6px",
                }}
              >
                {item.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.5" }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
