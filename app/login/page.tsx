"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  supabase, 
  getAuthenticatedUser, 
  getUserProfile, 
  sanitizeRedirectPath, 
  isRouteAuthorized, 
  UserRole 
} from '@/lib/supabase';
import { PrismaLogo } from '@/components/glowinn/icons';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';

type Mode = 'signin' | 'signup';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const [role, setRole] = useState<UserRole>('employer');

  // If user already holds a valid cryptographic session, navigate to their authorized route
  useEffect(() => {
    let isMounted = true;

    const checkExistingAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (user && isMounted) {
          const profile = await getUserProfile(user.id);
          const activeRole: UserRole = profile?.role === 'employee' ? 'employee' : 'employer';
          const defaultDest = activeRole === 'employee' ? '/worker' : '/payroll';

          if (rawRedirect) {
            const safePath = sanitizeRedirectPath(rawRedirect, defaultDest);
            const { authorized, redirectPath } = isRouteAuthorized(activeRole, safePath);
            router.replace(authorized ? safePath : (redirectPath || defaultDest));
          } else {
            router.replace(defaultDest);
          }
          return;
        }
      } catch (err) {
        console.warn('[Login] Session pre-check error:', err);
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    };

    checkExistingAuth();
    return () => { isMounted = false; };
  }, [rawRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Input Validation
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid corporate or work email address.');
      return;
    }

    if (cleanPassword.length < 8) {
      setError('Password must be at least 8 characters for cryptographic security.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const cleanName = name.trim();
        if (!cleanName || cleanName.length < 2) {
          setError('Please provide your full legal name or organization name.');
          setLoading(false);
          return;
        }

        if (cleanPassword !== confirmPw.trim()) {
          setError('Passwords do not match. Please verify your password confirmation.');
          setLoading(false);
          return;
        }

        // 1. Sign Up user with Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: { 
            data: { full_name: cleanName, role: role } 
          },
        });

        if (signUpError) throw signUpError;

        const userId = signUpData.user?.id;
        
        // Check if session was granted immediately (auto-confirm) or if confirmation email was sent
        if (signUpData.session) {
          if (userId) {
            await supabase.from('profiles').upsert([{ 
              id: userId, 
              role: role, 
              full_name: cleanName 
            }]);
          }

          const defaultDest = role === 'employee' ? '/worker' : '/payroll';
          const safePath = sanitizeRedirectPath(rawRedirect, defaultDest);
          const { authorized, redirectPath } = isRouteAuthorized(role, safePath);
          router.replace(authorized ? safePath : (redirectPath || defaultDest));
        } else {
          // Email confirmation is enabled
          setNotice('Account registered! If confirmation is required, please check your inbox before signing in.');
          setMode('signin');
          setPassword('');
          setConfirmPw('');
        }
      } else {
        // 2. Sign In flow with cryptographic server authentication
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password: cleanPassword 
        });

        if (signInError) throw signInError;

        const userId = signInData.user?.id;
        if (!userId) throw new Error('Authentication returned an invalid user record.');

        // Fetch user profile and RBAC role
        const profile = await getUserProfile(userId);
        const userRole: UserRole = profile?.role === 'employee' ? 'employee' : 'employer';

        const defaultDest = userRole === 'employee' ? '/worker' : '/payroll';
        const safePath = sanitizeRedirectPath(rawRedirect, defaultDest);
        const { authorized, redirectPath } = isRouteAuthorized(userRole, safePath);
        
        router.replace(authorized ? safePath : (redirectPath || defaultDest));
      }
    } catch (err: any) {
      console.warn('[Login Error]', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please verify your credentials and try again.');
      } else if (msg.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please sign in or reset your password.');
      } else {
        setError(msg || 'Authentication failed. Please verify your network and credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontFamily: "'Jost', sans-serif" }}>
          <div className="db-loading__spinner" style={{ margin: '0 auto 16px' }} />
          <span>Verifying existing session…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Jost', sans-serif",
    }}>
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

        {/* Card — liquid glass */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(60px) saturate(180%)',
          WebkitBackdropFilter: 'blur(60px) saturate(180%)',
          padding: '36px',
          boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(0,207,255,0.06) inset, 0 24px 80px rgba(0,0,0,0.7)',
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
                onClick={() => { setMode(m); setError(''); setNotice(''); }}
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
                <label style={labelStyle}>Access Role</label>
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
                <label style={labelStyle}>Full Name / Organization</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={mode === 'signup'}
                  placeholder="Jane Smith or Apex Labs Inc."
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
                placeholder="•••••••• (min 8 chars)"
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

            {/* Error Message */}
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

            {/* Informational Notice */}
            {notice && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(110,231,183,0.08)',
                border: '1px solid rgba(110,231,183,0.2)',
                color: '#6ee7b7',
                fontSize: '13px',
                lineHeight: 1.5,
              }}>
                {notice}
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
                ? (mode === 'signin' ? 'Authenticating…' : 'Provisioning Account…')
                : (mode === 'signin' ? 'Sign In to Dashboard →' : 'Create Account & Launch →')}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }}
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

export default function LoginPage() {
  return (
    <DarkGradientBg>
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="db-loading__spinner" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </DarkGradientBg>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '8px',
  fontFamily: 'monospace',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  fontFamily: "'Jost', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  backdropFilter: 'blur(8px)',
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'rgba(0,207,255,0.45)',
  boxShadow: '0 0 0 3px rgba(0,207,255,0.08)',
};

