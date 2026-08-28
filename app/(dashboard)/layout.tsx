"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/components/WalletContext';
import { supabase } from '@/lib/supabase';
import { PrismaLogo } from '@/components/glowinn/icons';
import './dashboard.css';

const NAV_ITEMS = [
  { name: 'Payroll Streams', href: '/payroll', desc: 'Shielded salary distribution' },
  { name: 'Vendor Settlements', href: '/vendor', desc: 'ZK invoice payments' },
  { name: 'ZK Analytics', href: '/analytics', desc: 'Live proof telemetry' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, address, connect, disconnect, error: walletError, networkName } = useWallet();
  const [authChecking, setAuthChecking] = React.useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const [userRole, setUserRole] = useState<'employer' | 'employee' | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) setUserRole(profile.role as 'employer' | 'employee');
        setAuthChecking(false);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const navItems = userRole === 'employee' 
    ? [{ name: 'My Portal', href: '/worker', desc: 'Manage your salary streams' }]
    : [
        { name: 'Payroll Streams', href: '/payroll', desc: 'Shielded salary distribution' },
        { name: 'Vendor Settlements', href: '/vendor', desc: 'ZK invoice payments' },
        { name: 'ZK Analytics', href: '/analytics', desc: 'Live proof telemetry' },
        { name: 'ZK Circuit Demo', href: '/circuit-demo', desc: 'Live circuit call on Preprod' },
      ];

  const handleConnect = async () => {
    setWalletLoading(true);
    try { await connect(); } finally { setWalletLoading(false); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (authChecking) {
    return (
      <div className="db-loading">
        <div className="db-loading__spinner" />
        <span>Verifying session…</span>
      </div>
    );
  }

  return (
    <div className="db-root">
      {/* ── SIDEBAR ── */}
      <aside className="db-sidebar">
        {/* Brand */}
        <div className="db-sidebar__brand">
          <Link href="/" className="db-brand-link">
            <PrismaLogo size={22} />
            <div>
              <div className="db-brand-name">Prisma</div>
              <div className="db-brand-sub">dApp Dashboard</div>
            </div>
          </Link>
        </div>

        {/* Network chip */}
        <div className="db-sidebar__section">
          <div className="db-network-chip" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/>
              <path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17"/>
              <path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            {isConnected ? networkName : 'No Network'}
          </div>
        </div>

        {/* Nav */}
        <nav className="db-sidebar__nav">
          <div className="db-nav-label">Modules</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`db-nav-item${isActive ? ' db-nav-item--active' : ''}`}
              >
                <div className="db-nav-item__text">
                  <span className="db-nav-item__name">{item.name}</span>
                  <span className="db-nav-item__desc">{item.desc}</span>
                </div>
                {isActive && <span className="db-nav-item__arrow">›</span>}
              </Link>
            );
          })}
        </nav>

        {/* Wallet + Sign Out */}
        <div className="db-sidebar__bottom">
          {isConnected ? (
            <div className="db-wallet-card db-wallet-card--connected">
              <div className="db-wallet-card__status">
                <span className="db-live-dot db-live-dot--green" />
                <span className="db-wallet-card__label">Wallet Connected</span>
              </div>
              <div className="db-wallet-card__address">
                {address ? `${address.slice(0, 12)}…${address.slice(-8)}` : '1AM Connected'}
              </div>
              <button onClick={disconnect} className="db-btn db-btn--disconnect">
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="db-wallet-card">
              <div className="db-wallet-card__status">
                <span className="db-live-dot db-live-dot--off" />
                <span className="db-wallet-card__label" style={{ color: 'rgba(255,255,255,0.4)' }}>No Wallet</span>
              </div>
              {walletError && <p className="db-wallet-card__error">{walletError}</p>}
              <button onClick={handleConnect} disabled={walletLoading} className="db-btn db-btn--connect">
                {walletLoading ? 'Connecting…' : 'Connect Wallet'}
              </button>
              <p className="db-wallet-card__hint">Requires 1AM or Lace extension</p>
            </div>
          )}

          <button onClick={handleSignOut} className="db-signout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="db-main">
        {/* Top Bar */}
        <header className="db-topbar">
          <button className="db-topbar__menu-btn" onClick={() => setMobileNavOpen(v => !v)}>
            <span>{mobileNavOpen ? '✕' : '☰'}</span>
          </button>

          <div className="db-topbar__title">
            {navItems.find(n => n.href === pathname)?.name ?? 'Dashboard'}
          </div>

          <div className="db-topbar__right">
            {isConnected ? (
              <div className="db-topbar__wallet-chip">
                <span className="db-live-dot db-live-dot--green" />
                <span>{address ? `${address.slice(0, 8)}…` : '1AM'} · Connected</span>
              </div>
            ) : (
              <button onClick={handleConnect} disabled={walletLoading} className="db-btn db-btn--connect-sm">
                {walletLoading ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
            <button onClick={handleSignOut} className="db-topbar__signout" title="Sign Out">⎋</button>
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
  );
}
