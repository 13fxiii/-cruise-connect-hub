'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [xLoading, setXLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/feed';
  const urlError = searchParams.get('error');

  const handleXLogin = async () => {
    setXLoading(true);
    setError('');
    // Fast path: redirect straight to app-managed X OAuth (PKCE).
    window.location.href = `/api/auth/x?redirectTo=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <AuthShell>
      <h2 className="text-lg font-black text-white mb-1">Continue with X</h2>
      <p className="text-zinc-500 text-xs mb-6">
        Cruise Connect Hub uses X login only. On the next screen, users sign in with their X username/email + password and complete 2FA there when enabled.
      </p>

      {(urlError || error) && (
        <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-4">
          {urlError ? decodeURIComponent(urlError) : error}
        </div>
      )}

      <button
        onClick={handleXLogin}
        disabled={xLoading}
        className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-black font-black text-sm py-3 rounded-xl transition-all disabled:opacity-60"
      >
        {xLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XIcon />}
        {xLoading ? 'Connecting to X...' : 'Continue with X'}
      </button>

      <div className="mt-5 space-y-3">
        <p className="text-zinc-500 text-xs text-center">
          By continuing you agree to the{' '}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
        <a
          href="https://x.com/i/flow/signup"
          target="_blank"
          rel="noreferrer noopener"
          className="w-full block text-center border border-zinc-700 text-white font-bold py-2.5 rounded-xl hover:bg-zinc-900 transition-colors text-sm"
        >
          Create an X account
        </a>
      </div>
    </AuthShell>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-yellow-400/30">
              <Image src="/logo.jpeg" alt="CC Hub" fill sizes="64px" className="object-cover" priority />
            </div>
            <div>
              <div className="font-black text-white text-base leading-tight">Cruise Connect Hub</div>
              <div className="text-yellow-400 text-xs font-bold">〽️ The home of Naija culture</div>
            </div>
          </Link>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/50">{children}</div>
      </div>
    </div>
  );
}
