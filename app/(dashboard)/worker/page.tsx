"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletContext';
import { supabase } from '@/lib/supabase';
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profile) return;

      const { data, error } = await supabase.from('payroll_streams')
        .select(`
          id, amount, duration_seconds, withdrawn_amount, start_time, status, contract_address,
          profiles!payroll_streams_user_id_fkey ( full_name )
        `)
        .eq('employee_id', session.user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      const mapped = (data as any[]).map(s => ({
        ...s,
        employer_name: s.profiles?.full_name || 'Unknown Company',
      }));
      setStreams(mapped);
    } catch (err: any) {
      toast.error('Failed to load streams: ' + err.message);
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
                    <div className="dp-badge dp-badge--confirmed">{stream.status}</div>
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

                  <button 
                    onClick={() => handleWithdraw(stream, unlocked)}
                    disabled={unlocked <= 0 || stream.status === 'Revoked'}
                    className="dp-primary-btn"
                    style={{ width: '100%', padding: '12px', marginTop: '4px' }}
                  >
                    Withdraw Funds to 1AM
                  </button>
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
