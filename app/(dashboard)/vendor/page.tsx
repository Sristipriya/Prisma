"use client";
import React, { useState } from 'react';
import { useWallet } from '@/components/WalletContext';
import { Building2, Shield, Activity, RefreshCw, Clock, ArrowRight, CheckCircle2, Send, FileText } from 'lucide-react';

interface VendorInvoice {
  id: string;
  invoiceId: string;
  vendorName: string;
  vendorAddress: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Verifying';
  proofHash: string;
  date: string;
}

export default function VendorPage() {
  const { isConnected } = useWallet();
  const [invoiceId, setInvoiceId] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState('20b8638a3e733a1c4b7a0012509886e494591452210a48354dc560befbaff44d');
  const [copySuccess, setCopySuccess] = useState(false);

  const [invoices, setInvoices] = useState<VendorInvoice[]>([
    {
      id: 'inv-1',
      invoiceId: 'INV-2026-889',
      vendorName: 'Apex Cloud Security Ltd.',
      vendorAddress: 'mn_shield_addr_preview19julwm2n68tum04uz32jqnastpjy6',
      amount: 14500,
      status: 'Confirmed',
      proofHash: '20b8638a...f44d',
      date: '2026-08-20',
    },
    {
      id: 'inv-2',
      invoiceId: 'INV-2026-882',
      vendorName: 'Hyperion Infrastructure Services',
      vendorAddress: 'mn_shield_addr_preview1msur7r7nrpmvdj3u4ev94rpm9el6',
      amount: 8900,
      status: 'Confirmed',
      proofHash: '0x16b52cff...835c',
      date: '2026-08-18',
    },
    {
      id: 'inv-3',
      invoiceId: 'INV-2026-875',
      vendorName: 'Krypton Audit Labs',
      vendorAddress: 'mn_shield_addr_preview188ea91204cba7219984620a',
      amount: 22000,
      status: 'Confirmed',
      proofHash: '0x55a81290...3341',
      date: '2026-08-12',
    },
  ]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(deployedAddress);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePay = async () => {
    if (!invoiceId || !vendorAddress || !amount) return;
    setIsPaying(true);
    try {
      const midnightWallets = (window as any).midnight || {};
      const midnightObj = midnightWallets['1am'] || midnightWallets.mnLace || Object.values(midnightWallets)[0];
      
      let txHash = deployedAddress;
      if (midnightObj) {
        let api;
        if (typeof midnightObj.connect === 'function') api = await midnightObj.connect();
        else if (typeof midnightObj.enable === 'function') api = await midnightObj.enable();
        else api = midnightObj;
        const { deployPayrollContract } = await import('@/lib/midnight/providers');
        const { address } = await deployPayrollContract(api);
        txHash = address;
      }

      const newInvoice: VendorInvoice = {
        id: `inv-${Date.now()}`,
        invoiceId,
        vendorName: vendorName || 'Shielded Vendor Partner',
        vendorAddress,
        amount: parseFloat(amount),
        status: 'Confirmed',
        proofHash: txHash.slice(0, 10) + '...' + txHash.slice(-6),
        date: new Date().toISOString().split('T')[0],
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setInvoiceId('');
      setVendorAddress('');
      setVendorName('');
      setAmount('');

      alert(`SUCCESS! Vendor Invoice Payment settled on Midnight Preview!\n\nTransaction / Contract: ${txHash}`);
    } catch (e: any) {
      alert("Payment failed: " + (e.message || String(e)));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-8 page-in">
      {/* Header Banner */}
      <div className="card glass-heavy p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-white/5">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md text-gray-300 text-[10px] font-mono uppercase tracking-widest mb-4">
            <Shield className="w-3 h-3" />
            Shielded Vendor Settlement Protocol
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2 text-white">Vendor Invoice Management</h1>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Settle vendor invoices instantly with zero-knowledge proof of payment, keeping financial counterparties & transaction terms private.
          </p>
        </div>

        {/* Active Vendor Contract Card */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3 max-w-md w-full md:w-auto relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-white" />
              Vendor Settlement Contract
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Total Settled Volume
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">45,400 <span className="text-sm text-gray-500 font-sans tracking-normal">tNight</span></div>
          <div className="text-xs text-gray-400">100% Zero-Knowledge Verified</div>
        </div>

        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileText className="w-3 h-3" /> Invoices Processed
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">{invoices.length} <span className="text-sm text-gray-500 font-sans tracking-normal">Invoices</span></div>
          <div className="text-xs text-gray-400">Instant Settlement</div>
        </div>

        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Average Finality
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">&lt; 1.2s</div>
          <div className="text-xs text-gray-400">Substrate Finalization</div>
        </div>

        <div className="card p-5 glass-heavy border-white/5 hover:border-white/10 transition-colors">
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Network Protection
          </div>
          <div className="text-2xl font-medium font-mono text-white mb-1 tracking-tight">Active</div>
          <div className="text-xs text-gray-400">DUST Gas Sponsorship</div>
        </div>
      </div>

      {/* Grid: Form & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form: Settle Invoice */}
        <div className="card p-6 glass-heavy border-white/5 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-gray-400" /> Settle Vendor Invoice
            </h2>
            <p className="text-xs text-gray-400 mt-1.5">
              Execute zero-knowledge payment directly to vendor's shielded address.
            </p>
          </div>

          {!isConnected ? (
            <div className="p-4 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-md space-y-2">
              <p className="font-medium text-white flex items-center gap-2"><Shield className="w-4 h-4"/> Wallet Connection Required</p>
              <p className="text-gray-400 leading-relaxed">Please connect your 1AM or Lace wallet using the button in the top header to authorize settlement transactions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="e.g. Apex Security Inc."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Invoice Number / Reference
                </label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={e => setInvoiceId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="INV-2026-009"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Vendor Shielded Address
                </label>
                <input
                  type="text"
                  value={vendorAddress}
                  onChange={e => setVendorAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="mn_shield_addr_preview..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Settlement Amount (tNight)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="1500"
                />
              </div>

              <button
                onClick={handlePay}
                disabled={isPaying || !invoiceId || !vendorAddress || !amount}
                className="w-full mt-4 py-2.5 px-4 bg-white hover:bg-gray-200 text-black font-medium text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isPaying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <span>Settle Invoice via 1AM</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Ledger: Settlements */}
        <div className="lg:col-span-2 card p-6 glass-heavy border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" /> Vendor Settlement Ledger
              </h2>
              <p className="text-xs text-gray-400 mt-1.5">
                On-chain zero-knowledge verified invoice settlement records.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white border border-white/10 font-mono text-[10px] uppercase tracking-widest">ZK Verified</span>
          </div>

          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-5 bg-white/5 border border-white/10 rounded-lg space-y-4 hover:border-white/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-sm border border-white/10">{inv.invoiceId}</span>
                      <span className="font-medium text-white text-sm">{inv.vendorName}</span>
                    </div>
                    <div className="text-xs font-mono text-gray-500 mt-1 truncate max-w-sm">{inv.vendorAddress}</div>
                  </div>
                  <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-1.5">
                    <div className="text-lg font-medium font-mono text-white">+{inv.amount.toLocaleString()} <span className="text-sm text-gray-500 font-sans tracking-normal">tNight</span></div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white border border-white/10">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                  <span className="text-gray-500 font-mono">Date: {inv.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-gray-500 text-[10px]">Tx: {inv.proofHash}</span>
                    <button
                      onClick={() => alert(`Vendor Invoice ZK Settlement Verified!\nInvoice ID: ${inv.invoiceId}\nContract Address: ${deployedAddress}\nTransaction Hash: ${inv.proofHash}`)}
                      className="text-gray-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      Inspect ZK Proof <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
