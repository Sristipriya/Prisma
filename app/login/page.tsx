"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PrismaLogo } from '@/components/glowinn/icons';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [role, setRole] = useState<'employer' | 'employee'>('employer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userId = '';
      if (mode === 'signup') {
        if (password !== confirmPw) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          setLoading(false);
          return;
        }
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;
        
        userId = signUpData.user?.id || '';
        
        // Immediately sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        // Wait for profile row to be available (inserted by trigger, or we insert it manually)
        // Since we didn't add a trigger, we insert it manually:
        if (userId) {
          await supabase.from('profiles').upsert([{ 
            id: userId, 
            role: role, 
            full_name: name 
          }]);
        }
        
        router.push(role === 'employer' ? '/payroll' : '/worker');
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        userId = signInData.user?.id || '';
        if (userId) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
          if (profile?.role === 'employee') {
            router.push('/worker');
            return;
          }
        }
        router.push('/payroll');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050a07',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      fontFamily: "'Jost', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(110,231,183,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(110,231,183,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', color: '#fff', marginBottom: '12px',
          }}>
            <PrismaLogo size={32} />
            <span style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em' }}>Prisma</span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
            Zero-Knowledge Shielded Financial Infrastructure
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(8, 14, 10, 0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(40px) saturate(150%)',
          padding: '36px',
          boxShadow: '0 2px 0 rgba(255,255,255,0.05) inset, 0 24px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                  background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: mode === m ? '#fff' : 'rgba(255,255,255,0.45)',
                  boxShadow: mode === m ? '0 1px 0 rgba(255,255,255,0.08) inset' : 'none',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Role selector — only for signup */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>I am a...</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                      borderColor: role === 'employer' ? '#6ee7b7' : 'rgba(255,255,255,0.1)',
                      background: role === 'employer' ? 'rgba(110,231,183,0.1)' : 'rgba(0,0,0,0.3)',
                      color: role === 'employer' ? '#6ee7b7' : 'rgba(255,255,255,0.5)',
                      fontSize: '13px', fontFamily: "'Jost', sans-serif", cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Company / Employer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                      borderColor: role === 'employee' ? '#93c5fd' : 'rgba(255,255,255,0.1)',
                      background: role === 'employee' ? 'rgba(147,197,253,0.1)' : 'rgba(0,0,0,0.3)',
                      color: role === 'employee' ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                      fontSize: '13px', fontFamily: "'Jost', sans-serif", cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Worker / Vendor
                  </button>
                </div>
              </div>
            )}

            {/* Name field — only for signup */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={mode === 'signup'}
                  placeholder="Jane Smith"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Work Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={e => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={e => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                color: '#f87171',
                fontSize: '13px',
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px',
                padding: '13px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(110,231,183,0.3)',
                background: loading ? 'rgba(110,231,183,0.05)' : 'rgba(110,231,183,0.12)',
                color: loading ? 'rgba(167,243,208,0.5)' : '#a7f3d0',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: '0.02em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
              }}
            >
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign In to Dashboard →' : 'Create Account & Launch →')}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                style={{
                  background: 'none', border: 'none', color: '#6ee7b7',
                  cursor: 'pointer', fontSize: '12px', fontFamily: "'Jost', sans-serif",
                }}
              >
                {mode === 'signin' ? 'Create one free' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '11px', color: 'rgba(255,255,255,0.2)',
        }}>
          Protected by zero-knowledge cryptography · Midnight Network
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: '8px',
  fontFamily: 'monospace',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: "'Jost', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'rgba(110,231,183,0.4)',
  boxShadow: '0 0 0 3px rgba(110,231,183,0.06)',
};
