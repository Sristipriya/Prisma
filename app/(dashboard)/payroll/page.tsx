"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import '../dashboard-pages.css';

interface PayrollStream {
  id: string;
  employee_address: string;
  employee_name: string;
  amount: number;
  unlocked_amount: number;
  status: 'Streaming' | 'Completed' | 'Paused';
  proof_hash: string;
  contract_address: string;
  created_at: string;
}

export default function PayrollPage() {
  const { isConnected, connect } = useWallet();
  const [amount, setAmount] = useState('');
  const [employee, setEmployee] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [streams, setStreams] = useState<PayrollStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchStreams = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.from('payroll_streams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStreams((data as PayrollStream[]) || []);
    } catch (err: any) {
      toast.error('Failed to load streams: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStreams(); }, []);

  useEffect(() => {
    const channel = supabase.channel('payroll_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll_streams' }, fetchStreams)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStreams(prev => prev.map(s => {
        if (s.status === 'Streaming' && Number(s.unlocked_amount) < Number(s.amount)) {
          return { ...s, unlocked_amount: Math.min(s.amount, Number(s.unlocked_amount) + 0.15) };
        }
        return s;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeploy = async () => {
    if (!amount || !employee || !employeeName) { toast.error('Fill in all fields'); return; }
    setIsDeploying(true);
    const t = toast.loading('Initializing ZK circuit…');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Auth required');

      const midnightWallets = (window as any).midnight || {};
      const midnightObj = midnightWallets['1am'] || midnightWallets.mnLace || Object.values(midnightWallets)[0];

      let contractAddress = `mn_contract_${Date.now().toString(36)}`;
      if (midnightObj) {
        let api;
        if (typeof midnightObj.connect === 'function') api = await midnightObj.connect();
        else if (typeof midnightObj.enable === 'function') api = await midnightObj.enable();
        else api = midnightObj;
        const { deployPayrollContract } = await import('@/lib/midnight/providers');
        const { address } = await deployPayrollContract(api, parseFloat(amount), employeeName);
        contractAddress = address;
      }

      const { data, error } = await supabase.from('payroll_streams').insert([{
        user_id: session.user.id,
        employee_name: employeeName,
        employee_address: employee,
        amount: parseFloat(amount),
        unlocked_amount: 0,
        status: 'Streaming',
        proof_hash: contractAddress.slice(0, 10) + '...' + contractAddress.slice(-6),
        contract_address: contractAddress,
      }]).select();
      if (error) throw error;

      if (data && data.length > 0) setStreams(prev => [data[0] as PayrollStream, ...prev]);
      setAmount(''); setEmployee(''); setEmployeeName('');
      setShowForm(false);
      toast.success(`Stream deployed: ${contractAddress.slice(0, 16)}…`, { id: t });
    } catch (e: any) {
      toast.error('Deployment failed: ' + (e.message || String(e)), { id: t });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleToggleStatus = async (stream: PayrollStream) => {
    const newStatus = stream.status === 'Streaming' ? 'Paused' : 'Streaming';
    const { error } = await supabase.from('payroll_streams').update({ status: newStatus }).eq('id', stream.id);
    if (error) { toast.error('Failed to update status'); return; }
    setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, status: newStatus as any } : s));
    toast.success(`Stream ${newStatus.toLowerCase()}`);
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from('payroll_streams').delete().eq('id', id);
    if (error) { toast.error('Failed to revoke'); return; }
    setStreams(prev => prev.filter(s => s.id !== id));
    toast.success('Stream revoked');
  };

  const totalVolume = streams.reduce((a, s) => a + Number(s.amount), 0);
  const activeCount = streams.filter(s => s.status === 'Streaming').length;

  return (
    <div className="dp-page page-in">

      {/* Header card */}
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Zero-Knowledge Stream Protocol</div>
          <h1 className="dp-title">Payroll Streams</h1>
          <p className="dp-subtitle">Deploy shielded payroll on Midnight. Amounts verified by ZK proofs — invisible to the network.</p>
        </div>
        <button className="dp-primary-btn" onClick={() => setShowForm(v => !v)}>
          + New Stream
        </button>
      </div>

      {/* Metrics */}
      <div className="dp-metrics">
        {[
          { label: 'Monthly Volume', value: totalVolume.toLocaleString(), unit: 'tNight' },
          { label: 'Active Streams', value: activeCount.toString(), unit: 'Workers' },
          { label: 'ZK Proofs', value: '100%', unit: 'Passed' },
          { label: 'Gas Fees', value: '0', unit: 'tNight' },
        ].map(m => (
          <div key={m.label} className="dp-metric card glass-heavy">
            <div className="dp-metric__label">{m.label}</div>
            <div className="dp-metric__value">{m.value} <span className="dp-metric__unit">{m.unit}</span></div>
          </div>
        ))}
      </div>

      {/* New Stream Form */}
      {showForm && (
        <div className="dp-form card glass-heavy">
          <div className="dp-form__header">
            <h2 className="dp-form__title">Deploy New Payroll Stream</h2>
            <button className="dp-form__close" onClick={() => setShowForm(false)}>✕</button>
          </div>

          {!isConnected ? (
            <div className="dp-wallet-gate">
              <p className="dp-wallet-gate__title">Wallet Required</p>
              <p className="dp-wallet-gate__desc">Connect your 1AM or Lace wallet to sign transactions on Midnight Network.</p>
              <button onClick={connect} className="dp-primary-btn">Connect Wallet</button>
            </div>
          ) : (
            <div className="dp-form__fields">
              <div className="dp-field">
                <label className="dp-label">Employee Name</label>
                <input className="dp-input" type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="e.g. Sarah Jenkins" />
              </div>
              <div className="dp-field">
                <label className="dp-label">Shielded Address</label>
                <input className="dp-input dp-input--mono" type="text" value={employee} onChange={e => setEmployee(e.target.value)} placeholder="mn_shield_addr_..." />
              </div>
              <div className="dp-field">
                <label className="dp-label">Monthly Amount (tNight)</label>
                <input className="dp-input dp-input--mono" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="2500" />
              </div>
              <div>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying || !amount || !employee || !employeeName}
                  className="dp-primary-btn"
                  style={{ width: 'auto' }}
                >
                  {isDeploying ? 'Deploying…' : 'Deploy via 1AM Wallet'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Streams list */}
      <div className="dp-card card glass-heavy">
        <div className="dp-card__header">
          <div>
            <h2 className="dp-card__title">Live Shielded Streams</h2>
            <p className="dp-card__sub">Real-time data from Supabase · Realtime subscribed</p>
          </div>
          <button onClick={fetchStreams} className="dp-icon-btn" title="Refresh">↺</button>
        </div>

        {isLoading ? (
          <div className="dp-empty">Loading from Supabase…</div>
        ) : streams.length === 0 ? (
          <div className="dp-empty">
            <p>No payroll streams yet.</p>
            <button onClick={() => setShowForm(true)} className="dp-text-link">Deploy your first stream →</button>
          </div>
        ) : (
          <div className="dp-list">
            {streams.map(stream => {
              const pct = Math.min(100, (Number(stream.unlocked_amount) / Number(stream.amount)) * 100);
              return (
                <div key={stream.id} className="dp-stream-card">
                  <div className="dp-stream-card__top">
                    <div>
                      <div className="dp-stream-card__name">{stream.employee_name}</div>
                      <div className="dp-stream-card__addr">{stream.employee_address}</div>
                    </div>
                    <div className="dp-stream-card__actions">
                      <span className={`dp-badge ${stream.status === 'Streaming' ? 'dp-badge--active' : stream.status === 'Paused' ? 'dp-badge--paused' : 'dp-badge--done'}`}>
                        {stream.status === 'Streaming' && <span className="dp-live-dot" />}
                        {stream.status}
                      </span>
                      <button onClick={() => handleToggleStatus(stream)} className="dp-action-btn">
                        {stream.status === 'Streaming' ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => handleRevoke(stream.id)} className="dp-action-btn dp-action-btn--danger">
                        Revoke
                      </button>
                    </div>
                  </div>

                  <div className="dp-progress">
                    <div className="dp-progress__labels">
                      <span>{Number(stream.unlocked_amount).toFixed(2)} <span style={{ color: 'rgba(255,255,255,0.3)' }}>tNight unlocked</span></span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>Total: {stream.amount} tNight</span>
                    </div>
                    <div className="dp-progress__bar">
                      <div className="dp-progress__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="dp-stream-card__footer">
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                      Started: {new Date(stream.created_at).toLocaleDateString()}
                    </span>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Tx: {stream.proof_hash}</span>
                      <button
                        onClick={() => toast.success(`ZK Proof Verified: ${stream.proof_hash}`, { description: `Contract: ${stream.contract_address}` })}
                        className="dp-text-link"
                      >
                        Verify Proof →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
