// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, Shield, LogOut, ChevronRight, Moon, Globe,
  Trash2, Lock, Eye, EyeOff, Loader2, Check, User
} from 'lucide-react';

export default function SettingsPage() {
  const { user }        = useAuth();
  const router          = useRouter();
  const [notifPrefs, setNP] = useState<any>({});
  const [loading, setLd]   = useState(true);
  const [saving, setSv]    = useState(false);
  const [saved, setSaved]  = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase.from('notification_preferences')
      .select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        setNP(data || { push_enabled: true, email_enabled: true, dm_enabled: true, like_enabled: true, follow_enabled: true });
        setLd(false);
      });
  }, [user]);

  const saveNotifs = async () => {
    setSv(true);
    await supabase.from('notification_preferences').upsert({ ...notifPrefs, user_id: user?.id });
    setSv(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const toggle = (key: string) => setNP((p: any) => ({ ...p, [key]: !p[key] }));

  const NOTIF_SETTINGS = [
    { key: 'push_enabled',   label: 'Push notifications',  desc: 'Get notified on your device' },
    { key: 'email_enabled',  label: 'Email notifications', desc: 'Alerts to your email' },
    { key: 'dm_enabled',     label: 'Direct messages',     desc: 'New DM alerts' },
    { key: 'like_enabled',   label: 'Likes & reactions',   desc: 'When someone likes your post' },
    { key: 'follow_enabled', label: 'New followers',       desc: 'When someone follows you' },
  ];

  const LINKS = [
    { label: 'Edit Profile',  href: '/profile/edit', icon: User },
    { label: 'Community ID',  href: '/community-id', icon: Shield },
    { label: 'Privacy Policy', href: '/privacy',     icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Settings" back />

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">

        {/* Quick links */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
          {LINKS.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center justify-between px-4 py-3.5 active:bg-zinc-800/60">
              <div className="flex items-center gap-3">
                <Icon className="w-4.5 h-4.5 text-zinc-400" />
                <span className="text-white text-sm font-medium">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </Link>
          ))}
        </div>

        {/* Notification settings */}
        <div>
          <p className="text-zinc-400 font-bold text-xs tracking-wider mb-2 px-1">NOTIFICATIONS</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-yellow-400 animate-spin" /></div>
            ) : NOTIF_SETTINGS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-zinc-500 text-xs">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifPrefs[key] ? 'bg-yellow-400' : 'bg-zinc-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifPrefs[key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
            {!loading && (
              <div className="px-4 py-3">
                <button onClick={saveNotifs} disabled={saving}
                  className="w-full py-2.5 bg-yellow-400 text-black font-black text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                  {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-zinc-400 font-bold text-xs tracking-wider mb-2 px-1">ACCOUNT</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl">
            {user && (
              <div className="px-4 py-3.5 border-b border-zinc-800">
                <p className="text-zinc-500 text-xs mb-0.5">Signed in as</p>
                <p className="text-white text-sm font-bold">{user.email}</p>
              </div>
            )}
            <button onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 active:bg-zinc-800/60">
              <LogOut className="w-4.5 h-4.5" />
              <span className="text-sm font-bold">Sign Out</span>
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-xs pb-4">
          CC Hub〽️ v1.0 · Built with 🖤 for Naija culture
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
