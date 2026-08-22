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
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWithdraw = async (stream: WorkerStream, unlockedAmount: number) => {
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
    const elapsedSec = Math.max(0, Math.floor((now - startMs) / 1000));
    const durationSec = stream.duration_seconds || 2592000; // default 30 days
    
    const totalUnlocked = Math.min(Number(stream.amount), (Number(stream.amount) * elapsedSec) / durationSec);
    return Math.max(0, totalUnlocked - Number(stream.withdrawn_amount));
  };

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
            <h2 className="dp-card__title">Incoming Streams</h2>
          </div>
          <button onClick={fetchStreams} className="dp-icon-btn" title="Refresh">↺</button>
        </div>

        {isLoading ? (
          <div className="dp-empty">Loading streams…</div>
        ) : streams.length === 0 ? (
          <div className="dp-empty">
            <p>You have no active incoming streams.</p>
          </div>
        ) : (
          <div className="dp-list">
            {streams.map(stream => {
              const unlocked = calculateUnlocked(stream);
              const totalUnlockedStr = (Number(stream.withdrawn_amount) + unlocked).toFixed(4);
              const pct = Math.min(100, ((Number(stream.withdrawn_amount) + unlocked) / Number(stream.amount)) * 100);
              
              return (
                <div key={stream.id} className="dp-stream-card">
                  <div className="dp-stream-card__top">
                    <div>
                      <div className="dp-stream-card__name">{stream.employer_name}</div>
                      <div className="dp-stream-card__addr">Total: {stream.amount} tNight</div>
                    </div>
                    <div className="dp-stream-card__actions">
                      <button 
                        onClick={() => handleWithdraw(stream, unlocked)}
                        disabled={unlocked <= 0 || stream.status === 'Revoked'}
                        className="dp-primary-btn"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        Withdraw {unlocked > 0 ? unlocked.toFixed(2) : '0.00'}
                      </button>
                    </div>
                  </div>

                  <div className="dp-progress">
                    <div className="dp-progress__labels">
                      <span>{totalUnlockedStr} <span style={{ color: 'rgba(255,255,255,0.3)' }}>tNight earned</span></span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="dp-progress__bar">
                      <div className="dp-progress__fill" style={{ width: `${pct}%` }} />
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
