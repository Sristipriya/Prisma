"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/components/WalletContext';
import { supabase, getAuthenticatedUser, getUserProfile, isRouteAuthorized, UserRole } from '@/lib/supabase';
import { PrismaLogo } from '@/components/glowinn/icons';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import './dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, address, connect, disconnect, error: walletError, networkName } = useWallet();
  const [authChecking, setAuthChecking] = React.useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const validateAuthAndAccess = async () => {
      try {
        // 1. Cryptographically validate JWT with Supabase Auth server
        const user = await getAuthenticatedUser();
        if (!user) {
          if (isMounted) {
            const safeRedirect = encodeURIComponent(pathname);
            router.replace(`/login?redirect=${safeRedirect}`);
          }
          return;
        }

        if (isMounted) {
          setUserEmail(user.email || null);
        }

        // 2. Fetch authenticated profile and role
        const profile = await getUserProfile(user.id);
        const role: UserRole = profile?.role === 'employee' ? 'employee' : 'employer';

        if (isMounted) {
          setUserRole(role);
        }

        // 3. Enforce strict Role-Based Access Control (RBAC)
        const { authorized, redirectPath } = isRouteAuthorized(role, pathname);
        if (!authorized && redirectPath) {
          router.replace(redirectPath);
          return;
        }

        if (isMounted) {
          setAuthChecking(false);
        }
      } catch (err) {
        console.error('[AuthGuard] Validation error:', err);
        if (isMounted) {
          router.replace('/login');
        }
      }
    };

    validateAuthAndAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUserRole(null);
        setUserEmail(null);
        router.replace('/login');
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        validateAuthAndAccess();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const navItems = userRole === 'employee' 
    ? [
        { name: 'My Portal', href: '/worker', desc: 'Manage your salary streams' },
        { name: 'StreamCredit', href: '/streamcredit', desc: 'ZK Salary Advance' },
        { name: 'FlowSplit', href: '/flowsplit', desc: 'ZK Stream Routing' },
        { name: 'AuditPass', href: '/auditpass', desc: 'ZK Tax & Scoped Audit' },
      ]
    : [
        { name: 'Payroll Streams', href: '/payroll', desc: 'Shielded salary distribution' },
        { name: 'Worker Portal', href: '/worker', desc: 'Live earnings & claims' },
        { name: 'Vendor Settlements', href: '/vendor', desc: 'ZK invoice payments' },
        { name: 'VaultGuard', href: '/vaultguard', desc: 'ZK Treasury Solvency' },
        { name: 'StreamCredit', href: '/streamcredit', desc: 'ZK Salary Advance' },
        { name: 'FlowSplit', href: '/flowsplit', desc: 'ZK Stream Routing' },
        { name: 'AuditPass', href: '/auditpass', desc: 'ZK Tax & Scoped Audit' },
        { name: 'ZK Analytics', href: '/analytics', desc: 'Live proof telemetry' },
        { name: 'ZK Circuit', href: '/circuit-demo', desc: 'Live circuit call on Preprod' },
      ];

  const handleConnect = async () => {
    setWalletLoading(true);
    try { await connect(); } finally { setWalletLoading(false); }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUserRole(null);
      setUserEmail(null);
      router.replace('/login');
    }
  };

  if (authChecking) {
    return (
      <div className="db-loading">
        <div className="db-loading__spinner" />
        <span>Verifying cryptographic session…</span>
      </div>
    );
  }

  return (
    <DarkGradientBg>
    <div className="flex min-h-screen text-[#f0f0f0] font-sans antialiased">
      {/* ── SIDEBAR (Tailwind Liquid Glass) ── */}
      <aside className="hidden md:flex w-64 min-w-[256px] flex-col h-screen sticky top-0 bg-white/[0.03] border-r border-white/5 backdrop-blur-[48px] saturate-150 shadow-[inset_1px_0_0_rgba(0,207,255,0.03)] z-40">
        {/* Brand */}
        <div className="p-6 pb-3">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <PrismaLogo size={24} />
            <div className="flex flex-col">
              <span className="text-white font-semibold tracking-tight text-[15px] leading-tight">Prisma</span>
              <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">dApp Dashboard</span>
            </div>
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00cfff] shadow-[0_0_6px_rgba(0,207,255,0.6)]" />
            <span className="text-white/60 capitalize font-medium">{userRole === 'employee' ? 'Worker Session' : 'Employer Session'}</span>
          </div>
        </div>

        {/* Network chip */}
        <div className="px-5 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/5 text-[10px] font-mono uppercase tracking-widest text-[#6ee7b7] shadow-[inset_0_0_0_1px_rgba(110,231,183,0.1)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/>
              <path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17"/>
              <path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            {isConnected ? networkName : 'No Network'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white/30 mt-2 mb-1">Modules</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#00cfff]/10 border-[#00cfff]/20 shadow-[inset_0_0_0_1px_rgba(0,207,255,0.06)] backdrop-blur-md' 
                    : 'border-transparent text-white/50 hover:bg-white/5 hover:border-white/10 hover:text-white/90 hover:backdrop-blur-sm'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[13px] font-medium transition-colors ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{item.name}</span>
                  <span className={`text-[10px] font-mono transition-colors ${isActive ? 'text-[#00cfff]/60' : 'text-white/30 group-hover:text-white/40'}`}>{item.desc}</span>
                </div>
                {isActive && <span className="text-[#00cfff]/50 text-lg leading-none">›</span>}
              </Link>
            );
          })}
        </nav>

        {/* Wallet + Sign Out */}
        <div className="p-4 border-t border-white/[0.06] flex flex-col gap-2 mt-4 bg-black/10">
          {isConnected ? (
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.09] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6ee7b7] shadow-[0_0_8px_rgba(110,231,183,0.6)] animate-pulse" />
                <span className="text-[11px] font-semibold text-[#6ee7b7] tracking-wider">Wallet Connected</span>
              </div>
              <div className="font-mono text-[10px] text-white/40 bg-black/40 border border-white/5 rounded-lg py-1.5 px-2.5 break-all">
                {address ? `${address.slice(0, 12)}…${address.slice(-8)}` : '1AM Connected'}
              </div>
              <button onClick={disconnect} className="w-full py-2 rounded-lg text-[12px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[11px] font-semibold text-white/40 tracking-wider">No Wallet</span>
              </div>
              <button onClick={handleConnect} disabled={walletLoading} className="w-full py-2 rounded-lg text-[12px] font-medium bg-white text-black border border-white/10 hover:bg-gray-200 transition-colors disabled:opacity-50">
                {walletLoading ? 'Connecting…' : 'Connect Wallet'}
              </button>
              <p className="text-[9px] text-center text-white/30">Requires 1AM or Lace extension</p>
            </div>
          )}

          <button onClick={handleSignOut} className="w-full py-2 mt-1 rounded-lg text-[12px] font-medium text-white/30 hover:bg-white/5 hover:text-white/90 transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar (Tailwind Liquid Glass) */}
        <header className="sticky top-0 z-50 h-14 px-6 flex items-center justify-between bg-black/20 backdrop-blur-3xl border-b border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <button className="md:hidden p-2 -ml-2 text-white/50 hover:text-white" onClick={() => setMobileNavOpen(v => !v)}>
            <span>{mobileNavOpen ? '✕' : '☰'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="text-[13px] font-medium tracking-wide text-white/90">
              {navItems.find(n => n.href === pathname)?.name ?? 'Dashboard'}
            </div>
            {userRole && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                userRole === 'employee'
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}>
                {userRole === 'employee' ? 'Worker' : 'Employer'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7] shadow-[0_0_8px_rgba(110,231,183,0.6)] animate-pulse" />
                <span className="text-[10px] font-mono text-[#6ee7b7]">{address ? `${address.slice(0, 8)}…` : '1AM'}</span>
              </div>
            ) : (
              <button onClick={handleConnect} disabled={walletLoading} className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50">
                {walletLoading ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
            <button onClick={handleSignOut} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Sign Out">⎋</button>
          </div>
        </header>

        {/* Mobile Nav */}
        {mobileNavOpen && (
          <div className="db-mobile-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`db-mobile-nav__item${pathname === item.href ? ' db-mobile-nav__item--active' : ''}`}
                onClick={() => setMobileNavOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isConnected
              ? <button onClick={disconnect} className="db-mobile-nav__wallet">Disconnect Wallet</button>
              : <button onClick={handleConnect} className="db-mobile-nav__wallet">Connect Wallet</button>
            }
          </div>
        )}

        {/* Page content */}
        <main className="db-content">
          {children}
        </main>

        <footer className="db-footer">
          <span>Prisma Infrastructure</span>
          <span>Network: {isConnected ? networkName : 'Disconnected'}</span>
        </footer>
      </div>
    </div>
    </DarkGradientBg>
  );
}
