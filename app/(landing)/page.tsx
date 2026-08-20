"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Users, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#020202] overflow-hidden noise">
      {/* Navbar */}
      <nav className="liquid-glass-bar fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-md bg-white text-black flex items-center justify-center font-bold text-lg tracking-tighter group-hover:bg-gray-200 transition-colors">
              P
            </div>
            <span className="text-xl font-medium tracking-tight text-white font-sans">
              Prisma <span className="text-[10px] font-mono text-gray-400 font-normal px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 uppercase tracking-widest ml-1">dApp</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-all active:scale-95 flex items-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm mb-4 mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
            <span className="text-[10px] font-mono text-white uppercase tracking-widest">Prisma v2.0 is Live on Midnight</span>
          </div>

          <h1 className="text-5xl md:text-7xl text-white font-medium tracking-tighter leading-tight">
            Financial infrastructure <br /> for the shielded web
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-sans font-light tracking-wide">
            A premium, zero-knowledge financial platform designed for modern enterprises.
            Execute payroll and settle vendors with unparalleled privacy and speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/payroll" className="px-6 py-3 text-sm font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] w-full sm:w-auto">
              Launch Dashboard
            </Link>
            <Link href="/vendor" className="px-6 py-3 text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-md transition-all active:scale-95 w-full sm:w-auto">
              Vendor Settlements
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid / Mock UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          className="w-full max-w-5xl mt-24"
        >
          <div className="glass-heavy rounded-xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Card 1 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-4 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 rounded-md bg-white/10 border border-white/10 flex items-center justify-center text-white mb-2">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-white font-medium text-lg">Instant Payroll</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  Execute payroll instantly across borders with our high-performance zero-knowledge infrastructure.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-4 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 rounded-md bg-white/10 border border-white/10 flex items-center justify-center text-white mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-white font-medium text-lg">Vendor Management</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  Settle external contractors and vendor invoices effortlessly in one unified, private dashboard.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-lg flex flex-col gap-4 hover:border-white/20 transition-colors">
                <div className="w-10 h-10 rounded-md bg-white/10 border border-white/10 flex items-center justify-center text-white mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-white font-medium text-lg">Cryptographic Proofs</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  Verify transactions mathematically with our advanced local proof generation system.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-auto border-t border-white/5 relative z-10">
        <p>© 2026 Prisma Global. All rights reserved.</p>
      </footer>
    </div>
  );
}
