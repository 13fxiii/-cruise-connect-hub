'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

type Mode = 'login' | 'forgot';

export default function LoginForm() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [xLoading, setXLoading]   = useState(false);
  const [error, setError]         = useState('');
  const [mode, setMode]           = useState<Mode>('login');
  const [resetSent, setResetSent] = useState(false);
  const router      = useRouter();
  const searchParams = useSearchParams();
  const redirectTo  = searchParams.get('redirectTo') || '/feed';
  const supabase    = createClient();

  /* ── Email / Password sign-in ─────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Wrong email or password. Try again or reset your password.'
          : error.message
      );
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  /* ── X OAuth via Supabase ─────────────────────────────────── */
  const handleXLogin = async () => {
    setXLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'tweet.read users.read',
      },
    });
    if (error) {
      setError(error.message);
      setXLoading(false);
    }
  };

  /* ── Forgot password ──────────────────────────────────────── */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter your email first'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); }
    else        { setResetSent(true); setLoading(false); }
  };

  /* ── Reset-sent screen ────────────────────────────────────── */
  if (resetSent) {
    return (
      <AuthShell>
        <div className="text-center py-6">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-black text-white mb-2">Check your email</h2>
          <p className="text-zinc-400 text-sm mb-6">
            We sent a password reset link to <span className="text-yellow-400 font-semibold">{email}</span>
          </p>
          <button onClick={() => { setMode('login'); setResetSent(false); }}
            className="text-yellow-400 text-sm hover:underline">
            ← Back to Sign In
          </button>
        </div>
      </AuthShell>
    );
  }

  /* ── Forgot password form ─────────────────────────────────── */
  if (mode === 'forgot') {
    return (
      <AuthShell>
        <h2 className="text-lg font-black text-white mb-1">Reset password</h2>
        <p className="text-zinc-500 text-xs mb-6">Enter your email and we'll send a reset link.</p>
        <form onSubmit={handleForgot} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
          </button>
          <button type="button" onClick={() => { setMode('login'); setError(''); }}
            className="w-full text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
            ← Back to Sign In
          </button>
        </form>
      </AuthShell>
    );
  }

  /* ── Main login form ──────────────────────────────────────── */
  return (
    <AuthShell>
      <h2 className="text-lg font-black text-white mb-1">Welcome back 👋</h2>
      <p className="text-zinc-500 text-xs mb-6">Sign in to your CC Hub account</p>

      {/* X OAuth — primary CTA */}
      <button
        onClick={handleXLogin}
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
        {xLoading ? 'Connecting to X...' : 'Continue with X'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 text-xs font-medium">or use email</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-zinc-400 font-medium">Password</label>
            <button type="button" onClick={() => { setMode('forgot'); setError(''); }}
              className="text-xs text-yellow-400 hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            : <><ArrowRight className="w-4 h-4" /> Sign In</>}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-zinc-500 text-xs mt-5">
        No account?{' '}
        <Link href="/auth/signup" className="text-yellow-400 hover:underline font-semibold">
          Join the Hub 🚌
        </Link>
      </p>
    </AuthShell>
  );
}

/* ── Shared shell ─────────────────────────────────────────────── */
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-yellow-400/30">
              <Image src="/logo.jpeg" alt="Cruise Connect Hub" fill sizes="64px" className="object-cover" priority />
            </div>
            <div>
              <div className="font-black text-white text-base leading-tight">Cruise Connect Hub</div>
              <div className="text-yellow-400 text-xs font-bold">〽️ The home of Naija culture</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/50">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-4">
          By signing in, you agree to cruise responsibly 🚌
        </p>
      </div>
    </div>
  );
}
