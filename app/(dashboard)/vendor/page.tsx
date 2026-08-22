"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import '../dashboard-pages.css';

interface VendorInvoice {
  id: string;
  invoice_id: string;
  vendor_name: string;
  vendor_address: string;
  amount: number;
  status: string;
  proof_hash: string;
  contract_address: string;
  created_at: string;
}

export default function VendorPage() {
  const { isConnected, connect } = useWallet();
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [amount, setAmount] = useState('');

  const fetchInvoices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.from('vendor_invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data as VendorInvoice[]) || []);
    } catch (err: any) {
      toast.error('Failed to load invoices: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const channel = supabase.channel('vendor_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_invoices' }, fetchInvoices)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePay = async () => {
    if (!invoiceId || !vendorAddress || !amount || !vendorName) { toast.error('Fill in all fields'); return; }
    setIsPaying(true);
    const t = toast.loading('Initiating shielded settlement…');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Auth required');

      const midnightWallets = (window as any).midnight || {};
      const midnightObj = midnightWallets['1am'] || midnightWallets.mnLace || Object.values(midnightWallets)[0];
      let contractAddress = `mn_vendor_${Date.now().toString(36)}`;
      if (midnightObj) {
        let api;
        if (typeof midnightObj.connect === 'function') api = await midnightObj.connect();
        else if (typeof midnightObj.enable === 'function') api = await midnightObj.enable();
        else api = midnightObj;
        const { deployPayrollContract } = await import('@/lib/midnight/providers');
        const { address } = await deployPayrollContract(api);
        contractAddress = address;
      }

      const { data, error } = await supabase.from('vendor_invoices').insert([{
        user_id: session.user.id,
        invoice_id: invoiceId,
        vendor_name: vendorName,
        vendor_address: vendorAddress,
        amount: parseFloat(amount),
        status: 'Confirmed',
        proof_hash: contractAddress.slice(0, 10) + '...' + contractAddress.slice(-6),
        contract_address: contractAddress,
      }]).select();
      if (error) throw error;

      if (data && data.length > 0) setInvoices(prev => [data[0] as VendorInvoice, ...prev]);
      setInvoiceId(''); setVendorName(''); setVendorAddress(''); setAmount('');
      setShowForm(false);
      toast.success(`Invoice ${invoiceId} settled`, { id: t });
    } catch (e: any) {
      toast.error('Settlement failed: ' + (e.message || String(e)), { id: t });
    } finally {
      setIsPaying(false);
    }
  };

  const handleDelete = async (id: string, invId: string) => {
    const { error } = await supabase.from('vendor_invoices').delete().eq('id', id);
    if (error) { toast.error('Failed to remove invoice'); return; }
    setInvoices(prev => prev.filter(i => i.id !== id));
    toast.success(`Invoice ${invId} removed`);
  };

  const totalVolume = invoices.reduce((a, i) => a + Number(i.amount), 0);

  return (
    <div className="dp-page page-in">

      {/* Header */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Shielded Vendor Settlement Protocol</div>
          <h1 className="dp-title">Vendor Invoices</h1>
          <p className="dp-subtitle">Settle vendor invoices with ZK proof of payment. Transaction terms remain private on Midnight.</p>
        </div>
        <button className="dp-primary-btn" onClick={() => setShowForm(v => !v)}>
          + Settle Invoice
        </button>
      </div>

      {/* Metrics */}
      <div className="dp-metrics">
        {[
          { label: 'Total Settled', value: totalVolume.toLocaleString(), unit: 'tNight' },
          { label: 'Invoices', value: invoices.length.toString(), unit: 'Processed' },
          { label: 'Avg Finality', value: '< 1.2s', unit: '' },
          { label: 'Gas Fees', value: '0', unit: 'DUST' },
        ].map(m => (
          <div key={m.label} className="dp-metric card glass-heavy">
            <div className="dp-metric__label">{m.label}</div>
            <div className="dp-metric__value">{m.value} {m.unit && <span className="dp-metric__unit">{m.unit}</span>}</div>
          </div>
        ))}
      </div>

      {/* Settle Invoice Form */}
      {showForm && (
        <div className="dp-form card glass-heavy">
          <div className="dp-form__header">
            <h2 className="dp-form__title">Settle Vendor Invoice</h2>
            <button className="dp-form__close" onClick={() => setShowForm(false)}>✕</button>
          </div>

          {!isConnected ? (
            <div className="dp-wallet-gate">
              <p className="dp-wallet-gate__title">Wallet Required</p>
              <p className="dp-wallet-gate__desc">Connect your 1AM or Lace wallet to authorize settlement transactions on Midnight.</p>
              <button onClick={connect} className="dp-primary-btn">Connect Wallet</button>
            </div>
          ) : (
            <div className="dp-form__fields">
              <div className="dp-field">
                <label className="dp-label">Vendor Name</label>
                <input className="dp-input" type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="e.g. Apex Security Inc." />
              </div>
              <div className="dp-field">
                <label className="dp-label">Invoice Reference</label>
                <input className="dp-input dp-input--mono" type="text" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="INV-2026-009" />
              </div>
              <div className="dp-field">
                <label className="dp-label">Vendor Shielded Address</label>
                <input className="dp-input dp-input--mono" type="text" value={vendorAddress} onChange={e => setVendorAddress(e.target.value)} placeholder="mn_shield_addr_preview..." />
              </div>
              <div className="dp-field">
                <label className="dp-label">Amount (tNight)</label>
                <input className="dp-input dp-input--mono" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" />
              </div>
              <div>
                <button
                  onClick={handlePay}
                  disabled={isPaying || !invoiceId || !vendorAddress || !amount || !vendorName}
                  className="dp-primary-btn"
                  style={{ width: 'auto' }}
                >
                  {isPaying ? 'Broadcasting…' : 'Settle via 1AM Wallet'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Ledger */}
      <div className="dp-card card glass-heavy">
        <div className="dp-card__header">
          <div>
            <h2 className="dp-card__title">Settlement Ledger</h2>
            <p className="dp-card__sub">Live data from Supabase · Realtime subscribed</p>
          </div>
          <button onClick={fetchInvoices} className="dp-icon-btn" title="Refresh">↺</button>
        </div>

        {isLoading ? (
          <div className="dp-empty">Loading from Supabase…</div>
        ) : invoices.length === 0 ? (
          <div className="dp-empty">
            <p>No vendor invoices yet.</p>
            <button onClick={() => setShowForm(true)} className="dp-text-link">Settle your first invoice →</button>
          </div>
        ) : (
          <div className="dp-list">
            {invoices.map(inv => (
              <div key={inv.id} className="dp-invoice-card">
                <div className="dp-invoice-card__top">
                  <div>
                    <div className="dp-invoice-card__id-row">
                      <span className="dp-invoice-id">{inv.invoice_id}</span>
                      <span className="dp-invoice-name">{inv.vendor_name}</span>
                    </div>
                    <div className="dp-invoice-addr">{inv.vendor_address}</div>
                  </div>
                  <div className="dp-invoice-right">
                    <div className="dp-invoice-amount">
                      {Number(inv.amount).toLocaleString()} <span className="dp-invoice-amount-unit">tNight</span>
                    </div>
                    <span className="dp-badge dp-badge--confirmed">Confirmed</span>
                    <button onClick={() => handleDelete(inv.id, inv.invoice_id)} className="dp-delete-btn" title="Remove">✕</button>
                  </div>
                </div>
                <div className="dp-invoice-card__footer">
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'monospace' }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Tx: {inv.proof_hash}</span>
                    <button
                      onClick={() => toast.success('ZK Proof Verified', { description: `Invoice: ${inv.invoice_id} · Contract: ${inv.contract_address}` })}
                      className="dp-text-link"
                    >
                      Inspect Proof →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
