'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Bus, Twitter, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const supabase = createClient();

  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleXSignup = async () => {
    setOauthLoading(true);
    setError('');
    const redirectTo = intent === 'pr-ads'
      ? `${window.location.origin}/auth/callback?redirectTo=/pr-ads/submit`
      : `${window.location.origin}/auth/callback?redirectTo=/feed`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo },
    });
    if (error) { setError(error.message); setOauthLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          user_name: form.username.toLowerCase(),
          full_name: form.displayName || form.username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=/feed`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center animate-slide-up">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to the Hub!</h2>
          <p className="text-brand-muted mb-6">
            Check your email to confirm your account, then come back and cruise with us!
          </p>
          <Link href="/auth/login" className="btn-primary">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <Bus className="text-brand-gold w-8 h-8" />
            <span className="font-black text-xl">
              Cruise &amp; Connect <span className="text-brand-gold">Hub〽️</span>
            </span>
          </Link>
          <p className="text-brand-muted mt-2">
            {intent === 'pr-ads' ? '🎵 Create an account to submit your campaign' : 'Join the community today 🚀'}
          </p>
        </div>

        <div className="card">
          {/* X OAuth */}
          <button
            onClick={handleXSignup}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-white font-semibold py-3 rounded-xl hover:bg-[#1DA1F2]/20 transition-all disabled:opacity-50 mb-6"
          >
            {oauthLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Twitter className="w-5 h-5 text-[#1DA1F2]" />}
            Sign up with X (Twitter)
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-brand-border" />
            <span className="text-brand-muted text-xs">or use email</span>
            <div className="flex-1 border-t border-brand-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">@</span>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
                    placeholder="cruiser"
                    required
                    className="input pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-300">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Your Name"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading || oauthLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account 🚀
            </button>

            <p className="text-brand-muted text-xs text-center">
              By joining, you agree to cruise responsibly 🚌
            </p>
          </form>

          <p className="text-center text-brand-muted text-sm mt-6">
            Already on board?{' '}
            <Link href="/auth/login" className="text-brand-gold hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
