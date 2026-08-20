"use client";
import React, { useState } from 'react';
import { useWallet } from '@/components/WalletContext';
import { Activity, Shield, Cpu, Database, Network, Clock, ShieldCheck, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const { isConnected, address } = useWallet();

  return (
    <div className="space-y-8 page-in">
      {/* Header Banner */}
      <div className="card glass-heavy p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-white/5">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-gray-300 text-[10px] font-mono uppercase tracking-widest mb-4">
            <Activity className="w-3 h-3" />
            Midnight Zero-Knowledge Telemetry
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2 text-white">Zero-Knowledge Analytics</h1>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Real-time monitoring of zero-knowledge proof generation, shielded ledger state, and privacy-preserving compliance proofs.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-right">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Proof Server Status</div>
            <div className="text-sm font-medium text-white flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white live-dot"></span>
              Operational (127.0.0.1:6300)
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-6 glass-heavy border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Database className="w-3 h-3" /> Total Shielded Volume
          </div>
          <div className="text-3xl font-medium font-mono tracking-tight text-white mb-1">124,500 <span className="text-sm font-sans text-gray-500 tracking-normal">tNight</span></div>
          <div className="text-xs text-white flex items-center gap-1 font-medium">
            <span>↑ 14.2%</span> <span className="text-gray-500 font-normal">vs last cycle</span>
          </div>
        </div>

        <div className="card p-6 glass-heavy border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Cpu className="w-3 h-3" /> ZK Proofs Generated
          </div>
          <div className="text-3xl font-medium font-mono tracking-tight text-white mb-1">348</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>Avg time: 1.14s</span>
          </div>
        </div>

        <div className="card p-6 glass-heavy border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Layers className="w-3 h-3" /> Dust Sponsorship
          </div>
          <div className="text-3xl font-medium font-mono tracking-tight text-white mb-1">5,000 <span className="text-sm font-sans text-gray-500 tracking-normal">DUST</span></div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>Zero User Gas Fees</span>
          </div>
        </div>

        <div className="card p-6 glass-heavy border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Privacy Score
          </div>
          <div className="text-3xl font-medium font-mono tracking-tight text-white mb-1">100%</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>Zero-Leakage Verified</span>
          </div>
        </div>
      </div>

      {/* Network Audit & Proof System Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Telemetry Box */}
        <div className="lg:col-span-2 card p-6 glass-heavy border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-medium flex items-center gap-2 text-white">
              <Network className="w-5 h-5 text-gray-400" />
              Midnight ZK Circuit Performance
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">Network: PREVIEW</span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">ZK Proof Prover Server Latency</span>
                <span className="font-mono text-white">142ms</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Compact Runtime Key Verification</span>
                <span className="font-mono text-white">0.08ms</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Shielded Ledger State Sync</span>
                <span className="font-mono text-white">100% Synced</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg font-mono text-[10px] uppercase tracking-widest space-y-3 text-gray-400">
            <div className="flex flex-col sm:flex-row justify-between gap-1 border-b border-white/5 pb-2">
              <span className="text-gray-500">[ZK-ENGINE]</span>
              <span className="text-white">Substrate Node: rpc.preview.midnight.network</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-1 border-b border-white/5 pb-2">
              <span className="text-gray-500">[VERIFIER]</span>
              <span className="text-white">Zswap Parameters: Enabled (v8.1.0)</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-1">
              <span className="text-gray-500">[PROOF-SERVER]</span>
              <span className="text-white">127.0.0.1:6300 (WASM / Native)</span>
            </div>
          </div>
        </div>

        {/* Audit Log Box */}
        <div className="card p-6 glass-heavy border-white/5 space-y-4">
          <h3 className="text-lg font-medium border-b border-white/10 pb-4 flex items-center justify-between text-white">
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Audit Trail</span>
            <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white border border-white/10 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white live-dot"></span> Live
            </span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2 hover:border-white/20 transition-colors">
              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                <span>10 mins ago</span>
                <span className="text-white">Verified</span>
              </div>
              <div className="font-medium text-white font-sans text-sm">Payroll Stream Created</div>
              <div className="truncate text-gray-500">Tx: 0x16b52cff...835c</div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2 hover:border-white/20 transition-colors">
              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                <span>18 mins ago</span>
                <span className="text-white">Verified</span>
              </div>
              <div className="font-medium text-white font-sans text-sm">Vendor Payment Settled</div>
              <div className="truncate text-gray-500">Tx: 20b8638a...f44d</div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2 hover:border-white/20 transition-colors">
              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                <span>1 hour ago</span>
                <span className="text-gray-400">Proof Generated</span>
              </div>
              <div className="font-medium text-white font-sans text-sm">Dust Token Sponsor Check</div>
              <div className="truncate text-gray-500">Balance: 5000 DUST</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
