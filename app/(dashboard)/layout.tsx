"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/components/WalletContext';
import { Briefcase, Building2, Activity, Wallet, Power, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected, address, connect, disconnect } = useWallet();

  const navItems = [
    { name: 'Payroll Streams', href: '/payroll', icon: Briefcase },
    { name: 'Vendor Settlements', href: '/vendor', icon: Building2 },
    { name: 'ZK Analytics', href: '/analytics', icon: Activity },
  ];

  const router = useRouter();
  const [authChecking, setAuthChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setAuthChecking(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (authChecking) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm font-mono tracking-widest uppercase">Verifying Enterprise Access...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-ghost-bg)] text-[var(--color-ghost-text)] font-sans antialiased selection:bg-white/20 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 liquid-glass-bar px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-md bg-white text-black flex items-center justify-center font-bold text-lg tracking-tighter group-hover:bg-gray-200 transition-colors">
                P
              </div>
              <span className="text-xl font-medium tracking-tight text-white font-sans">
                Prisma <span className="text-[10px] font-mono text-gray-400 font-normal px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 uppercase tracking-widest ml-1">dApp</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2.5 ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                        : 'text-[var(--color-ghost-text-mid)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Network Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--color-ghost-text-mid)] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white live-dot"></span>
              <span>Midnight Preview</span>
            </div>

            {/* Wallet Button */}
            {isConnected ? (
              <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-1 pl-3.5 rounded-md shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span className="text-xs font-mono font-medium text-white">
                    {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '1AM Connected'}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-sm transition-all"
                  title="Disconnect Wallet"
                >
                  <Wallet className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-5 py-2 text-sm font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-all active:scale-95 flex items-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
            <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all ml-2"
                title="Sign Out of Prisma"
              >
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Subnav for Mobile */}
      <div className="md:hidden flex items-center justify-around border-b border-white/5 liquid-glass-bar px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-xs font-medium flex flex-col items-center gap-1 ${
                isActive ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-400">Prisma</span>
            <span>— Zero-Knowledge Shielded Financial Infrastructure</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest">
            Network: <span className="text-gray-300">Midnight Preview</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
