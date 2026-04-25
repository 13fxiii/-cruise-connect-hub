// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Loader2, QrCode } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const INTERESTS = [
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'movies', label: 'Movies' },
  { id: 'business', label: 'Business' },
  { id: 'afrobeats', label: 'Afrobeats' },
  { id: 'tech', label: 'Tech' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'sports', label: 'Sports' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'art', label: 'Art' },
  { id: 'food', label: 'Food' },
  { id: 'travel', label: 'Travel' },
];

const STEPS = ['Profile', 'Interests', 'Done'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ display_name: '', username: '', twitter_handle: '', bio: '' });
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        router.replace('/auth/login');
        return;
      }

      setUser(data.user);

      const meta = data.user.user_metadata || {};
      setForm((f) => ({
        ...f,
        display_name: meta.full_name || meta.name || '',
        username: (meta.username || meta.preferred_username || '')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 30),
        twitter_handle: meta.username ? `@${meta.username}` : '',
      }));

      // If profile already complete, skip onboarding.
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.display_name && profile?.username) {
        router.replace('/feed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const inp =
    'w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400 transition-colors placeholder-zinc-600';

  const field = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleProfile = () => {
    setError('');
    setStep(1);
  };

  const handleFinish = async () => {
    if (!user || interests.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          display_name: form.display_name.trim(),
          twitter_handle: form.twitter_handle.trim(),
          bio: form.bio.trim(),
          interests,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Username taken — suggest a fix
        if (res.status === 409) {
          setError(`@${form.username} is taken. Try @${form.username}_${user.id.slice(0, 4)}`);
          setStep(0);
          setLoading(false);
          return;
        }
        throw new Error(json.error || 'Failed to save profile');
      }

      // Verify it actually saved (don’t leave user stuck on /onboarding).
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) throw new Error('Profile saved but not found. Please try again.');

      setStep(2);
      setLoading(false);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-yellow-400 font-black text-sm tracking-wider">CRUISE CONNECT HUB</div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center transition-all ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 rounded-full ${i < step ? 'bg-green-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 0: PROFILE */}
        {step === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-black text-lg">Welcome to the Bus 🚌</h2>
            <p className="text-zinc-400 text-xs">Your X profile data is synced automatically.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs">
              <p className="text-zinc-500">Display Name</p>
              <p className="text-white font-bold">{form.display_name || 'Connected X User'}</p>
              <p className="text-zinc-500 mt-2">Username</p>
              <p className="text-yellow-400 font-bold">@{form.username || 'member'}</p>
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">
                X / Twitter Handle <span className="text-zinc-600">(optional)</span>
              </label>
              <input className={inp} placeholder="@yourhandle" value={form.twitter_handle} onChange={field('twitter_handle')} />
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">
                Bio <span className="text-zinc-600">(optional)</span>
              </label>
              <textarea
                className={inp + ' resize-none'}
                rows={2}
                placeholder="Tell the community about yourself..."
                value={form.bio}
                onChange={field('bio')}
              />
            </div>

            <button
              onClick={handleProfile}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: INTERESTS */}
        {step === 1 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-black text-lg">Your Vibe</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Pick at least 1 interest (max 6)</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {INTERESTS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() =>
                    setInterests((p) =>
                      p.includes(id) ? p.filter((x) => x !== id) : p.length < 6 ? [...p, id] : p
                    )
                  }
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    interests.includes(id)
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                      : 'border-zinc-700 text-zinc-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={interests.length === 0 || loading}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating your profile...
                </>
              ) : (
                <>
                  Finish Setup <QrCode className="w-4 h-4" />
                </>
              )}
            </button>

            <button onClick={() => setStep(0)} className="w-full text-zinc-500 text-xs py-2">
              Back
            </button>
          </div>
        )}

        {/* STEP 2: DONE */}
        {step === 2 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
            <div>
              <h2 className="text-white font-black text-xl animate-pulse">WELCOME TO THE CRUISE CONNECT HUB〽️ BUS</h2>
              <p className="text-zinc-400 text-sm mt-1">Hi {form.display_name || `@${form.username}`}, your profile is ready.</p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 text-left">
              <p className="text-zinc-300 text-xs font-bold mb-2">Community Rules — DOs ✅</p>
              <ul className="text-zinc-400 text-xs space-y-1 list-disc pl-4">
                <li>Respect everyone in the community.</li>
                <li>Share useful updates, music, movies, and opportunities.</li>
                <li>Report spam, scams, and abusive behavior.</li>
              </ul>
              <p className="text-zinc-300 text-xs font-bold mt-4 mb-2">DON’Ts ❌</p>
              <ul className="text-zinc-400 text-xs space-y-1 list-disc pl-4">
                <li>No harassment, hate speech, or impersonation.</li>
                <li>No scam links, fake giveaways, or fraud.</li>
                <li>No leaking private chats or personal data.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  window.location.href = '/community-id';
                }}
                className="w-full border border-yellow-400/40 text-yellow-400 font-black py-3 rounded-xl text-sm"
              >
                View, Download & Share Community ID
              </button>
              <button
                onClick={() => {
                  window.location.href = '/feed';
                }}
                className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl text-sm"
              >
                Enter the Hub (Quick Tour)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
