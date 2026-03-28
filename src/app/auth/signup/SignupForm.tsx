'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignupForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [xLoading, setXLoading] = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  /* ── X OAuth ──────────────────────────────────────────────── */
  const handleXSignup = async () => {
    setXLoading(true);
    setError('');
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: callbackUrl },
    });
    if (error) {
      setError(error.message);
      setXLoading(false);
    }
  };

  /* ── Email sign-up ────────────────────────────────────────── */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase().replace(/\s/g,''), full_name: username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) { setError(error.message); setLoading(false); }
    else        { setDone(true); setLoading(false); }
  };

  /* ── Confirmation screen ──────────────────────────────────── */
  if (done) {
    return (
      <AuthShell>
        <div className="text-center py-6">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-black text-white mb-2">You're in!</h2>
          <p className="text-zinc-400 text-sm mb-2">
            Check <span className="text-yellow-400 font-semibold">{email}</span> for a confirmation link.
          </p>
          <p className="text-zinc-600 text-xs">Click the link to activate your CC Hub account.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h2 className="text-lg font-black text-white mb-1">Join the Hub 🚌</h2>
      <p className="text-zinc-500 text-xs mb-6">Create your CC Hub account</p>

      {/* X OAuth — primary */}
      <button
        onClick={handleXSignup}
        disabled={xLoading}
        className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-black font-black text-sm py-3 rounded-xl transition-all disabled:opacity-60 mb-5"
      >
        {xLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )}
        {xLoading ? 'Connecting to X...' : 'Sign up with X'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 text-xs font-medium">or use email</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="yourhandle" required minLength={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={8}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <><ArrowRight className="w-4 h-4" /> Create Account</>}
        </button>
      </form>

      <p className="text-center text-zinc-500 text-xs mt-4">
        Already on board?{' '}
        <Link href="/auth/login" className="text-yellow-400 hover:underline font-semibold">Sign in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-yellow-400/30">
              <Image src="/logo.jpeg" alt="Cruise Connect Hub" fill sizes="56px" className="object-cover" priority />
            </div>
            <div>
              <div className="font-black text-white text-sm">Cruise Connect Hub</div>
              <div className="text-yellow-400 text-xs font-bold">〽️ The home of Naija culture</div>
            </div>
          </Link>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/50">
          {children}
        </div>
        <p className="text-center text-zinc-700 text-xs mt-4">
          By joining, you agree to cruise responsibly 🚌
        </p>
      </div>
    </div>
  );
}
