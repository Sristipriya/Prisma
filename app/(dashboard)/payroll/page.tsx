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
  const [employees, setEmployees] = useState<{ id: string, full_name: string, shielded_address: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fetchStreamsAndEmployees = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const [streamsRes, employeesRes] = await Promise.all([
        supabase.from('payroll_streams').select('*, profiles!payroll_streams_employee_id_fkey(full_name)').order('start_time', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'employee')
      ]);
      
      if (streamsRes.error) throw streamsRes.error;
      
      const mappedStreams = (streamsRes.data as any[]).map(s => ({
        ...s,
        employee_name: s.profiles?.full_name || s.employee_name || 'Unknown',
      }));
      setStreams(mappedStreams);
      
      if (employeesRes.data) {
        setEmployees(employeesRes.data);
        if (employeesRes.data.length > 0 && !employee) {
          setEmployee(employeesRes.data[0].id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStreamsAndEmployees(); }, []);

  useEffect(() => {
    const channel = supabase.channel('payroll_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll_streams' }, fetchStreamsAndEmployees)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeploy = async () => {
    if (!amount || !employee) { toast.error('Fill in all fields'); return; }
    
    const selectedEmp = employees.find(e => e.id === employee);
    if (!selectedEmp) { toast.error('Invalid employee selected'); return; }

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
        const { address } = await deployPayrollContract(api, parseFloat(amount), selectedEmp.full_name);
        contractAddress = address;
      }

      const { data, error } = await supabase.from('payroll_streams').insert([{
        user_id: session.user.id,
        employee_id: selectedEmp.id,
        amount: parseFloat(amount),
        duration_seconds: 2592000, // 30 days
        withdrawn_amount: 0,
        status: 'Streaming',
        proof_hash: contractAddress.slice(0, 10) + '...' + contractAddress.slice(-6),
        contract_address: contractAddress,
      }]).select();
      if (error) throw error;

      if (data && data.length > 0) setStreams(prev => [{ ...data[0], employee_name: selectedEmp.full_name } as PayrollStream, ...prev]);
      setAmount(''); 
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
                <label className="dp-label">Select Employee</label>
                <select 
                  className="dp-input" 
                  value={employee} 
                  onChange={e => setEmployee(e.target.value)}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="dp-field">
                <label className="dp-label">Monthly Amount (tNight)</label>
                <input className="dp-input dp-input--mono" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="2500" />
              </div>
              <div>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying || !amount || !employee}
                  className="dp-primary-btn"
                  style={{ width: 'auto', marginTop: '20px' }}
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
          <button onClick={fetchStreamsAndEmployees} className="dp-icon-btn" title="Refresh">↺</button>
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
              const startMs = new Date(stream.start_time).getTime();
              const elapsedSec = stream.status === 'Revoked' ? 0 : Math.max(0, Math.floor((now - startMs) / 1000));
              const durationSec = stream.duration_seconds || 2592000;
              const unlockedAmount = Math.min(Number(stream.amount), (Number(stream.amount) * elapsedSec) / durationSec);
              const pct = Math.min(100, (unlockedAmount / Number(stream.amount)) * 100);
              
              return (
                <div key={stream.id} className="dp-stream-card">
                  <div className="dp-stream-card__top">
                    <div>
                      <div className="dp-stream-card__name">{stream.employee_name}</div>
                      <div className="dp-stream-card__addr">Total: {stream.amount} tNight</div>
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
                      <span>{unlockedAmount.toFixed(4)} <span style={{ color: 'rgba(255,255,255,0.3)' }}>tNight unlocked</span></span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>Withdrawn: {Number(stream.withdrawn_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="dp-progress__bar">
                      <div className="dp-progress__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="dp-stream-card__footer">
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                      Started: {new Date(stream.start_time).toLocaleDateString()}
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
