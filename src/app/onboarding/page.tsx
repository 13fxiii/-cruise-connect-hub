'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type OnboardingState = {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState<OnboardingState>({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
  });

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const meta = user.user_metadata || {};
      const fallbackUsername = String(meta.preferred_username || meta.user_name || meta.username || '')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 30);

      const profileRes = await fetch('/api/onboarding', { cache: 'no-store' });
      const profileJson = await profileRes.json();
      const profile = profileJson?.profile || null;

      if (!active) return;

      if (profile?.onboarding_done && profile?.username && profile?.display_name) {
        router.replace('/feed');
        return;
      }

      setState({
        display_name: profile?.display_name || meta.full_name || meta.name || '',
        username: profile?.username || fallbackUsername,
        bio: profile?.bio || '',
        location: profile?.location || '',
        website: profile?.website || profile?.website_url || '',
        avatar_url: profile?.avatar_url || meta.avatar_url || meta.picture || '',
      });

      setLoading(false);
    })().catch((e) => {
      setError(e?.message || 'Unable to load onboarding.');
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [router, supabase.auth]);

  const usernamePreview = useMemo(
    () => state.username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30),
    [state.username]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          username: usernamePreview,
          redirect_to: '/feed',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Could not finish onboarding.');

      setDone(true);
      setTimeout(() => router.replace('/feed'), 900);
    } catch (err: any) {
      setError(err?.message || 'Could not finish onboarding.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <p className="text-yellow-400 text-xs font-black tracking-widest">CRUISE CONNECT HUB</p>
          <h1 className="text-2xl font-black mt-1">Finish your onboarding</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Your account is already connected. Confirm your profile and join the feed.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-400/30 bg-red-400/10 flex gap-2 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {done && (
          <div className="mb-4 p-3 rounded-xl border border-green-400/30 bg-green-400/10 flex gap-2 text-green-300 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Onboarding complete. Redirecting to feed…</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <Field
            label="Display name"
            value={state.display_name}
            onChange={(value) => setState((s) => ({ ...s, display_name: value }))}
            required
          />

          <Field
            label="Username"
            value={state.username}
            onChange={(value) => setState((s) => ({ ...s, username: value }))}
            hint={`Will be saved as @${usernamePreview || 'member'}`}
            required
          />

          <Field
            label="Avatar URL"
            value={state.avatar_url}
            onChange={(value) => setState((s) => ({ ...s, avatar_url: value }))}
          />

          <Field
            label="Bio"
            value={state.bio}
            onChange={(value) => setState((s) => ({ ...s, bio: value }))}
          />

          <Field
            label="Location"
            value={state.location}
            onChange={(value) => setState((s) => ({ ...s, location: value }))}
          />

          <Field
            label="Website"
            value={state.website}
            onChange={(value) => setState((s) => ({ ...s, website: value }))}
          />

          <button
            type="submit"
            disabled={saving || !state.display_name.trim() || !usernamePreview}
            className="w-full mt-2 rounded-xl bg-yellow-400 text-black font-black py-3 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Continue to Cruise Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-zinc-400 mb-1">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-yellow-400"
      />
      {hint ? <span className="block mt-1 text-[11px] text-zinc-500">{hint}</span> : null}
    </label>
  );
}
