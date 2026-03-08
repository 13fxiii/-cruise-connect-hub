'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from 'lucide-react';

function ResetForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const router  = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else        { setDone(true); setTimeout(() => router.push('/auth/login'), 2500); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-yellow-400/30">
              <Image src="/logo.jpeg" alt="CC Hub" fill sizes="56px" className="object-cover" />
            </div>
            <div className="font-black text-white text-sm">Cruise Connect Hub</div>
          </Link>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <h2 className="text-lg font-black text-white mb-1">Password updated!</h2>
              <p className="text-zinc-400 text-xs">Redirecting to sign in...</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-black text-white mb-1">Set new password</h2>
              <p className="text-zinc-500 text-xs mb-5">Choose a strong password for your account.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-medium">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" required minLength={8}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type={showPw ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat password" required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
