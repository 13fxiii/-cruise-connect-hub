'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const intent       = searchParams.get('intent');
  const supabase     = createClient();

  /* ── X OAuth — direct API route ──────────────────────────── */
  const handleXSignup = () => {
    window.location.href = '/api/auth/x';
  };

  const [form, setForm]         = useState({ email: '', password: '', username: '', displayName: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: k === 'username' ? e.target.value.replace(/[^a-z0-9_]/g, '').toLowerCase() : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.username.length < 3)  { setError('Username must be at least 3 characters'); return; }
    if (form.password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          user_name:  form.username.toLowerCase(),
          full_name:  form.displayName || form.username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${intent === 'pr-ads' ? '/ads' : '/feed'}`,
      },
    });

    if (error) { setError(error.message); setLoading(false); }
    else        { setSuccess(true); }
  };

  /* ── Success screen ─────────────────────────────────────── */
  if (success) {
    return (
      <AuthShell>
        <div className="text-center py-4">
          <CheckCircle2 className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">You're on the bus! 🚌</h2>
          <p className="text-zinc-400 text-sm mb-2">
            We sent a confirmation link to{' '}
            <span className="text-yellow-400 font-semibold">{form.email}</span>
          </p>
          <p className="text-zinc-500 text-xs mb-6">
            Click the link in your email to activate your account, then come back and cruise with us!
          </p>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 bg-yellow-400 text-black font-black text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
            <ArrowRight className="w-4 h-4" /> Go to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  /* ── Signup form ──────────────────────────────────────────── */
  return (
    <AuthShell>
      <h2 className="text-lg font-black text-white mb-1">
        {intent === 'pr-ads' ? '🎵 Create account to submit' : 'Join the community 🚀'}
      </h2>
      <p className="text-zinc-500 text-xs mb-5">Sign up with your email — it's free</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username + Display Name */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block font-medium">Username *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
              <input value={form.username} onChange={set('username')}
                placeholder="cruiser" required maxLength={20}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block font-medium">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input value={form.displayName} onChange={set('displayName')}
                placeholder="Your Name"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block font-medium">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="your@email.com" required autoComplete="email"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block font-medium">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Password strength hint */}
          {form.password.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                  form.password.length >= i * 3
                    ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-yellow-400' : 'bg-green-400'
                    : 'bg-zinc-800'
                }`} />
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-all hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
            : <><ArrowRight className="w-4 h-4" /> Create Account 🚀</>}
        </button>

        <p className="text-zinc-600 text-[11px] text-center">By joining, you agree to cruise responsibly 🚌</p>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 text-xs">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
      <button
        type="button"
        onClick={handleXSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        )}
        Sign up with X
      </button>

      <p className="text-center text-zinc-500 text-xs mt-4">
        Already on board?{' '}
        <Link href="/auth/login" className="text-yellow-400 hover:underline font-semibold">Sign in</Link>
      </p>
    </AuthShell>
  );
}

/* ── Shared shell ─────────────────────────────────────────────── */
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
              <div className="font-black text-white text-sm leading-tight">Cruise Connect Hub</div>
              <div className="text-yellow-400 text-xs font-bold">〽️ The home of Naija culture</div>
            </div>
          </Link>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/50">
          {children}
        </div>
      </div>
    </div>
  );
}
