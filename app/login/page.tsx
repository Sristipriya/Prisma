"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Allow sign up on first login attempt if account doesn't exist
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
            // Attempt to sign up if login fails
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });
            if (signUpError) throw signUpError;
            toast.success("Account created successfully!");
            router.push('/payroll');
        } else {
            throw signInError;
        }
      } else {
          toast.success("Authentication successful");
          router.push('/payroll');
      }

    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[120px] pointer-events-none" />

      <div className="card glass-heavy p-8 w-full max-w-md border-white/10 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-2">Prisma Enterprise</h1>
          <p className="text-sm text-gray-400">Authenticate to access the shielded dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-all"
              placeholder="admin@enterprise.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-white hover:bg-gray-200 text-black font-medium text-sm rounded-md transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Secure Login</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
