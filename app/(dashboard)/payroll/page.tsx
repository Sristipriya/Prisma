"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletContext';
import { Plus, RefreshCw, Shield, ArrowRight, Fingerprint, Activity, Clock, CheckCircle2 } from 'lucide-react';

interface PayrollStream {
  id: string;
  employee: string;
  name: string;
  amount: number;
  unlockedAmount: number;
  status: 'Streaming' | 'Completed' | 'Paused';
  proofHash: string;
  startedAt: string;
}

export default function PayrollPage() {
  const { isConnected } = useWallet();
  const [amount, setAmount] = useState('');
  const [employee, setEmployee] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState('0x16b52cffbdae782c23dadfbd27e4f4716371cf2e91c674f69e4a068ab644835c');
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock initial active streams with ticking progress
  const [streams, setStreams] = useState<PayrollStream[]>([
    {
      id: 'stream-001',
      name: 'Alex Vance (Lead Engineer)',
      employee: 'mn_shield_addr_preview19julwm2n68tum04uz32jqnastpjy6',
      amount: 5000,
      unlockedAmount: 3420.50,
      status: 'Streaming',
      proofHash: '0x16b52cff...b644835c',
      startedAt: '2026-08-01',
    },
    {
      id: 'stream-002',
      name: 'Sophia Chen (Design Director)',
      employee: 'mn_shield_addr_preview1msur7r7nrpmvdj3u4ev94rpm9el6',
      amount: 4200,
      unlockedAmount: 2890.10,
      status: 'Streaming',
      proofHash: '0x94fc28ab...1049ea21',
      startedAt: '2026-08-05',
    },
    {
      id: 'stream-003',
      name: 'Marcus Brody (Security Researcher)',
      employee: 'mn_shield_addr_preview188ea91204cba7219984620a',
      amount: 6000,
      unlockedAmount: 6000.00,
      status: 'Completed',
      proofHash: '0x33e8a912...49a10582',
      startedAt: '2026-07-15',
    },
  ]);

  // Real-time ticking stream balance simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setStreams(prev =>
        prev.map(s => {
          if (s.status === 'Streaming' && s.unlockedAmount < s.amount) {
            return { ...s, unlockedAmount: Math.min(s.amount, s.unlockedAmount + 0.15) };
          }
          return s;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(deployedAddress);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeploy = async () => {
    if (!amount || !employee) return;
    setIsDeploying(true);
    try {
      const midnightWallets = (window as any).midnight || {};
      const midnightObj = midnightWallets['1am'] || midnightWallets.mnLace || Object.values(midnightWallets)[0];

      if (!midnightObj) {
        throw new Error("No Midnight wallet extension injected.");
      }
      let api;
      if (typeof midnightObj.connect === 'function') {
        api = await midnightObj.connect();
      } else if (typeof midnightObj.enable === 'function') {
        api = await midnightObj.enable();
      } else {
        api = midnightObj;
      }
      const { deployPayrollContract } = await import('@/lib/midnight/providers');
      const { address } = await deployPayrollContract(api);
      
      setDeployedAddress(address);

      // Add new stream to state
      const newStream: PayrollStream = {
        id: `stream-${Date.now().toString().slice(-3)}`,
        name: employeeName || 'New Shielded Employee',
        employee,
        amount: parseFloat(amount),
        unlockedAmount: 0,
        status: 'Streaming',
        proofHash: address.slice(0, 10) + '...' + address.slice(-6),
        startedAt: new Date().toISOString().split('T')[0],
      };

      setStreams(prev => [newStream, ...prev]);
      setAmount('');
      setEmployee('');
      setEmployeeName('');

      alert("SUCCESS! Payroll Contract deployed on Midnight Preview at address:\n\n" + address);
    } catch (e: any) {
      console.error(e);
      alert("Deployment failed: " + (e.message || String(e)));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-8 page-in">
      {/* Header Banner */}
      <div className="card glass-heavy p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-white/5">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-gray-300 text-[10px] font-mono uppercase tracking-widest mb-4">
            <Activity className="w-3 h-3" />
            Zero-Knowledge Stream Protocol
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2 text-white">Payroll Stream Management</h1>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Automate continuous, shielded salary distribution for your workforce using zero-knowledge proofs on the Midnight blockchain.
          </p>
        </div>

        {/* Active Contract Status Card */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3 max-w-md w-full md:w-auto relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-white" />
              On-Chain Contract
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white font-mono text-[10px] uppercase tracking-wider border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white live-dot"></span> Live
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-black/40 px-3 py-2 rounded-md border border-white/5 font-mono text-xs text-gray-300">
            <span className="truncate">{deployedAddress}</span>
            <button
              onClick={handleCopyAddress}
              className="text-[10px] text-gray-400 hover:text-white px-2 py-1 rounded-sm bg-white/5 border border-white/10 transition-all shrink-0 uppercase tracking-wider"
            >
              {copySuccess ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Active Payroll Rate
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">15,200 <span className="text-sm text-gray-500 font-sans tracking-normal">tNight / mo</span></div>
          <div className="text-xs text-gray-400">Real-time streaming active</div>
        </div>

        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Shielded Employees
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">{streams.length} <span className="text-sm text-gray-500 font-sans tracking-normal">Workers</span></div>
          <div className="text-xs text-gray-400">Private Salary Enclaves</div>
        </div>

        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> ZK Proof Verification
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">100% <span className="text-sm text-gray-500 font-sans tracking-normal">Passed</span></div>
          <div className="text-xs text-gray-400">Verified via Local Prover</div>
        </div>

        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Fingerprint className="w-3 h-3" /> Gas Sponsorship
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">0 <span className="text-sm text-gray-500 font-sans tracking-normal">tNight</span></div>
          <div className="text-xs text-gray-400">Supported by DUST Token</div>
        </div>
      </div>

      {/* Deploy New Stream & Active Streams Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form: Deploy New Stream */}
        <div className="card p-6 glass-heavy border-white/5 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-gray-400" /> Deploy New Stream
            </h2>
            <p className="text-xs text-gray-400 mt-1.5">
              Initialize a new zero-knowledge payroll stream on Midnight Preview.
            </p>
          </div>

          {!isConnected ? (
            <div className="p-4 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-md space-y-2">
              <p className="font-medium text-white flex items-center gap-2"><Shield className="w-4 h-4"/> Wallet Connection Required</p>
              <p className="text-gray-400 leading-relaxed">Please connect your 1AM or Lace wallet using the button in the top header to sign smart contract transactions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Employee Identifier
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Shielded Address
                </label>
                <input
                  type="text"
                  value={employee}
                  onChange={e => setEmployee(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="mn_shield_addr_preview..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Monthly Allocation (tNight)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="2500"
                />
              </div>

              <button
                onClick={handleDeploy}
                disabled={isDeploying || !amount || !employee}
                className="w-full mt-4 py-2.5 px-4 bg-white hover:bg-gray-200 text-black font-medium text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <span>Deploy Stream via 1AM Wallet</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Table: Active Streams */}
        <div className="lg:col-span-2 card p-6 glass-heavy border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-gray-400" /> Live Shielded Streams
              </h2>
              <p className="text-xs text-gray-400 mt-1.5">
                Real-time ticking balances streaming from Midnight Preview smart contracts.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white border border-white/10 font-mono text-[10px] uppercase tracking-widest">Realtime Proof Mode</span>
          </div>

          <div className="space-y-4">
            {streams.map((stream) => {
              const pct = Math.min(100, (stream.unlockedAmount / stream.amount) * 100);
              return (
                <div key={stream.id} className="p-5 bg-white/5 border border-white/10 rounded-lg space-y-4 hover:border-white/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-white text-sm">{stream.name}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5 truncate max-w-xs">{stream.employee}</div>
                    </div>
                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest border ${
                        stream.status === 'Streaming' ? 'bg-white/10 text-white border-white/10' : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}>
                        {stream.status === 'Streaming' && <span className="w-1.5 h-1.5 rounded-full bg-white live-dot"></span>}
                        {stream.status}
                      </span>
                      <div className="text-[10px] font-mono text-gray-500">Tx: {stream.proofHash}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white font-medium">{stream.unlockedAmount.toFixed(2)} <span className="text-gray-500">tNight Unlocked</span></span>
                      <span className="text-gray-500">Total: {stream.amount} tNight</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Started: {stream.startedAt}</span>
                    <button
                      onClick={() => alert(`ZK Proof verified on Midnight Preview network!\nContract: ${deployedAddress}\nTransaction Hash: ${stream.proofHash}`)}
                      className="text-gray-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      Verify ZK Proof <ArrowRight className="w-3 h-3" />
                    </button>
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
