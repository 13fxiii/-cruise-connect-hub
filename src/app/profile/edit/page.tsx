// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

export default function ProfileEditPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    display_name: '', username: '', twitter_handle: '', bio: '',
    location: '', website: '', avatar_url: '',
  });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) setForm({
          display_name:   data.display_name   || '',
          username:       data.username       || '',
          twitter_handle: data.twitter_handle || '',
          bio:            data.bio            || '',
          location:       data.location       || '',
          website:        data.website        || '',
          avatar_url:     data.avatar_url     || '',
        });
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true); setError('');

    // Username uniqueness check
    if (form.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', form.username.toLowerCase())
        .neq('id', user.id)
        .single();
      if (existing) { setError('Username already taken'); setSaving(false); return; }
    }

    const { error: err } = await supabase.from('profiles').update({
      display_name:   form.display_name.trim()   || null,
      username:       form.username.toLowerCase().trim() || null,
      twitter_handle: form.twitter_handle.trim() || null,
      bio:            form.bio.trim()            || null,
      location:       form.location.trim()       || null,
      website:        form.website.trim()        || null,
      avatar_url:     form.avatar_url.trim()     || null,
      updated_at:     new Date().toISOString(),
    }).eq('id', user.id);

    if (err) { setError(err.message); setSaving(false); return; }

    setSaved(true);
    setTimeout(() => { setSaved(false); window.location.href = '/profile'; }, 1500);
    setSaving(false);
  };

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    return null;
  }

  const fields = [
    { key: 'display_name',   label: 'Display Name',   placeholder: 'Your name in the community',     type: 'text' },
    { key: 'username',       label: 'Username',        placeholder: 'yourusername',                   type: 'text', prefix: '@' },
    { key: 'twitter_handle', label: 'X / Twitter',     placeholder: '@yourxhandle',                  type: 'text' },
    { key: 'location',       label: 'Location',        placeholder: 'Lagos, Nigeria',                type: 'text' },
    { key: 'website',        label: 'Website',         placeholder: 'https://yoursite.com',          type: 'url' },
    { key: 'avatar_url',     label: 'Avatar URL',      placeholder: 'https://... (image link)',      type: 'url' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <Link href="/profile" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <h1 className="text-2xl font-black text-white mb-6">Edit Profile</h1>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-6">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl font-black text-black">
              {form.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p className="text-white font-bold">{form.display_name || 'New Member'}</p>
            <p className="text-zinc-400 text-sm">@{form.username || 'username'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map(fi => (
            <div key={fi.key}>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{fi.label}</label>
              <div className="relative">
                {fi.prefix && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{fi.prefix}</span>
                )}
                <input
                  type={fi.type}
                  placeholder={fi.placeholder}
                  value={(form as any)[fi.key]}
                  onChange={f(fi.key)}
                  className={`w-full bg-zinc-900 border border-zinc-700 rounded-xl ${fi.prefix ? 'pl-8' : 'pl-4'} pr-4 py-3 text-white text-sm outline-none focus:border-yellow-400 transition-colors placeholder:text-zinc-600`}
                />
              </div>
            </div>
          ))}

          {/* Bio */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell the community who you are..."
              value={form.bio}
              onChange={f('bio')}
              maxLength={200}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-400 transition-colors placeholder:text-zinc-600 resize-none"
            />
            <p className="text-zinc-600 text-xs mt-1 text-right">{form.bio.length}/200</p>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl p-3">{error}</p>
          )}

          <button onClick={save} disabled={saving || saved}
            className="w-full bg-yellow-400 text-black font-black py-3.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saved ? (
              <><CheckCircle className="w-5 h-5" /> Saved!</>
            ) : saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
