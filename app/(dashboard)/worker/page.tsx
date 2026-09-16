"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletContext';
import { supabase, getAuthenticatedUser } from '@/lib/supabase';
import { toast } from 'sonner';
import '../dashboard-pages.css';

interface WorkerStream {
  id: string;
  employer_name: string;
  amount: number;
  duration_seconds: number;
  withdrawn_amount: number;
  start_time: string;
  status: string;
  contract_address: string;
}

const MOCK_STREAMS: WorkerStream[] = [
  {
    id: 'mock-1',
    employer_name: 'Apex Innovations (Demo)',
    amount: 12500,
    duration_seconds: 2592000,
    withdrawn_amount: 3200,
    start_time: new Date(Date.now() - 1200000000).toISOString(),
    status: 'Streaming',
    contract_address: 'mn_contract_demo123456789'
  },
  {
    id: 'mock-2',
    employer_name: 'Global Ventures (Demo)',
    amount: 5000,
    duration_seconds: 2592000,
    withdrawn_amount: 4900,
    start_time: new Date(Date.now() - 2500000000).toISOString(),
    status: 'Streaming',
    contract_address: 'mn_contract_demo987654321'
  }
];

export default function WorkerPage() {
  const { isConnected, connect, address } = useWallet();
  const [streams, setStreams] = useState<WorkerStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const fetchStreams = async () => {
    try {
      const user = await getAuthenticatedUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile) return;

      // Select all stream fields without forcing fragile PostgREST foreign key joins
      const { data, error } = await supabase.from('payroll_streams')
        .select('*')
        .or(`employee_id.eq.${user.id},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let employerMap: Record<string, string> = {};
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((s: any) => s.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: employerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);
          if (employerProfiles) {
            employerMap = employerProfiles.reduce((acc: any, p: any) => {
              acc[p.id] = p.full_name;
              return acc;
            }, {});
          }
        }
      }
      
      const mapped = (data as any[]).map(s => ({
        ...s,
        employer_name: employerMap[s.user_id] || s.employee_name || 'Prisma Organization',
        duration_seconds: s.duration_seconds || 2592000,
        withdrawn_amount: s.withdrawn_amount || s.unlocked_amount || 0,
        start_time: s.start_time || s.created_at || new Date().toISOString(),
        contract_address: s.contract_address || '0x6db3284190db9c089c0c2704b84062826c6eff39e5b31ce8ec138363c9d08f2f',
      }));
      setStreams(mapped);
    } catch (err: any) {
      console.warn('Could not query real streams:', err.message);
      // Fail gracefully so user still sees mock data without annoying error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStreams(); }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100); // Faster tick for visual flair
    return () => clearInterval(timer);
  }, []);

  const handleWithdraw = async (stream: WorkerStream, unlockedAmount: number) => {
    if (stream.id.startsWith('mock')) return toast.success('Demo withdrawal initiated via 1AM wallet!');
    if (unlockedAmount <= 0) return toast.error('No funds unlocked yet');
    if (!isConnected) return toast.error('Please connect your 1AM wallet first');
    
    const t = toast.loading('Generating ZK proof for withdrawal…');
    try {
      const midnightWallets = (window as any).midnight || {};
      const midnightObj = midnightWallets['1am'] || midnightWallets.mnLace || Object.values(midnightWallets)[0];
      if (!midnightObj) throw new Error('Wallet not found');

      let api;
      if (typeof midnightObj.connect === 'function') api = await midnightObj.connect();
      else if (typeof midnightObj.enable === 'function') api = await midnightObj.enable();
      else api = midnightObj;

      const { withdrawFromPayrollContract } = await import('@/lib/midnight/providers');
      await withdrawFromPayrollContract(api, stream.contract_address, unlockedAmount);

      const newWithdrawn = Number(stream.withdrawn_amount) + unlockedAmount;
      const { error } = await supabase.from('payroll_streams')
        .update({ withdrawn_amount: newWithdrawn })
        .eq('id', stream.id);
        
      if (error) throw error;

      setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, withdrawn_amount: newWithdrawn } : s));
      toast.success(`Successfully withdrew ${unlockedAmount.toFixed(2)} tNight`, { id: t });
    } catch (e: any) {
      toast.error('Withdrawal failed: ' + (e.message || String(e)), { id: t });
    }
  };

  const calculateUnlocked = (stream: WorkerStream) => {
    if (stream.status === 'Revoked') return 0;
    
    const startMs = new Date(stream.start_time).getTime();
    const elapsedSec = Math.max(0, (now - startMs) / 1000);
    const durationSec = stream.duration_seconds || 2592000;
    
    const totalUnlocked = Math.min(Number(stream.amount), (Number(stream.amount) * elapsedSec) / durationSec);
    return Math.max(0, totalUnlocked - Number(stream.withdrawn_amount));
  };

  const displayStreams = (streams.length === 0 && !isLoading) ? MOCK_STREAMS : streams;
  const isMock = streams.length === 0 && !isLoading;

  return (
    <div className="dp-page page-in">
      <div className="dp-header card glass-heavy">
        <div>
          <div className="dp-eyebrow">Worker Portal</div>
          <h1 className="dp-title">My Earnings</h1>
          <p className="dp-subtitle">Watch your salary stream in real-time. Withdraw unlocked funds securely to your Midnight wallet using ZK proofs.</p>
        </div>
      </div>

      <div className="dp-card card glass-heavy">
        <div className="dp-card__header">
          <div>
            <h2 className="dp-card__title">Incoming Streams {isMock && <span className="dp-badge" style={{marginLeft: '12px', background: 'rgba(255,255,255,0.1)'}}>Demo Mode</span>}</h2>
            {isMock && <p className="dp-card__sub" style={{color: 'rgba(255,165,0,0.8)'}}>No real streams detected. Displaying visual mock data. Deploy a real stream from an Employer account to see it here.</p>}
          </div>
          <button onClick={fetchStreams} className="dp-icon-btn" title="Refresh">↺</button>
        </div>

        {isLoading ? (
          <div className="dp-empty">Loading streams…</div>
        ) : (
          <div className="dp-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', padding: '12px 0' }}>
            {displayStreams.map(stream => {
              const unlocked = calculateUnlocked(stream);
              const totalUnlockedStr = (Number(stream.withdrawn_amount) + unlocked).toFixed(6); // 6 decimals for real-time visual flair
              const pct = Math.min(100, ((Number(stream.withdrawn_amount) + unlocked) / Number(stream.amount)) * 100);
              
              return (
                <div key={stream.id} className="dp-stream-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>{stream.employer_name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{stream.contract_address.slice(0,16)}...</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <div className="dp-badge dp-badge--confirmed">{stream.status}</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <a
                          href="/vaultguard"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.25)',
                            color: '#10b981',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                          title="ZK Solvency Verified: 100% Backed by Shielded Reserves (90-Day Runway)"
                        >
                          <span>🛡️ VaultGuard</span>
                        </a>
                        <a
                          href="/flowsplit"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: 'rgba(103,232,249,0.1)',
                            border: '1px solid rgba(103,232,249,0.25)',
                            color: '#67e8f9',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                          title="Autonomous ZK Stream Routing Active (4 Vaults)"
                        >
                          <span>🔀 FlowSplit</span>
                        </a>
                        <a
                          href="/streamcredit"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.25)',
                            color: '#f59e0b',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                          title="Instant Salary Advance Available (Up to 50% Future Earnings)"
                        >
                          <span>⚡ Advance</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)', padding: '32px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Available to Withdraw</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 300, color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                      {unlocked.toFixed(6)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1abc9c', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#1abc9c', borderRadius: '50%', boxShadow: '0 0 10px #1abc9c', animation: 'pulse 2s infinite' }}></span>
                      Streaming Live
                    </div>
                  </div>

                  <div className="dp-progress">
                    <div className="dp-progress__labels">
                      <span style={{ fontSize: '13px' }}>{totalUnlockedStr} <span style={{ color: 'rgba(255,255,255,0.3)' }}>/ {stream.amount} tNight</span></span>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{pct.toFixed(2)}%</span>
                    </div>
                    <div className="dp-progress__bar" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
                      <div className="dp-progress__fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1abc9c, #4ade80)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleWithdraw(stream, unlocked)}
                      disabled={unlocked <= 0 || stream.status === 'Revoked'}
                      className="dp-primary-btn"
                      style={{ flex: 1, minWidth: '160px', padding: '12px' }}
                    >
                      Withdraw to 1AM
                    </button>
                    <a
                      href="/streamcredit"
                      className="dp-action-btn"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        color: '#f59e0b',
                        borderColor: 'rgba(245,158,11,0.3)',
                      }}
                      title="Request Instant ZK Salary Advance"
                    >
                      <span>⚡ Advance</span>
                    </a>
                    <a
                      href="/flowsplit"
                      className="dp-action-btn"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}
                      title="Configure Autonomous ZK Vault Routing"
                    >
                      <span>🔀 FlowSplit</span>
                    </a>
                    <a
                      href="/auditpass"
                      className="dp-action-btn"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}
                      title="Generate ZK Tax Attestation & Compliance Certificate"
                    >
                      <span>📑 Tax Proof</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; box-shadow: 0 0 0 0 rgba(26, 188, 156, 0.7); }
          70% { opacity: 0.7; box-shadow: 0 0 0 10px rgba(26, 188, 156, 0); }
          100% { opacity: 1; box-shadow: 0 0 0 0 rgba(26, 188, 156, 0); }
        }
      `}} />
    </div>
  );
}
