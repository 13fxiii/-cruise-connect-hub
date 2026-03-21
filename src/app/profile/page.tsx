// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Edit3, Trophy, Wallet, Copy, CheckCheck, ExternalLink, Settings, Camera, Medal, Gift, LogOut } from 'lucide-react';

import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const LEVELS = [
  { name: 'Newcomer',     min: 0,    color: 'text-zinc-400',  bg: 'bg-zinc-400/10',  border: 'border-zinc-600' },
  { name: 'Cruiser',      min: 100,  color: 'text-blue-400',  bg: 'bg-blue-400/10',  border: 'border-blue-600' },
  { name: 'Connector',    min: 500,  color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-600' },
  { name: 'Hub Star',     min: 1000, color: 'text-yellow-400',bg: 'bg-yellow-400/10',border: 'border-yellow-600' },
  { name: 'Culture King', min: 2500, color: 'text-orange-400',bg: 'bg-orange-400/10',border: 'border-orange-600' },
  { name: 'Legend',       min: 5000, color: 'text-red-400',   bg: 'bg-red-400/10',   border: 'border-red-600' },
];

const BADGES = [
  { id: 'music', label: 'Music Head', icon: '🎵' },
  { id: 'gamer', label: 'Gamer', icon: '🎮' },
  { id: 'host', label: 'Space Host', icon: '🎙️' },
  { id: 'winner', label: 'Winner', icon: '🏆' },
  { id: 'top_fan', label: 'Top Fan', icon: '⭐' },
  { id: 'og', label: 'OG Member', icon: '👑' },
  { id: 'naija', label: 'Naija Rep', icon: '🇳🇬' },
  { id: 'earner', label: 'Earner', icon: '💰' },
  { id: 'early', label: 'Early Adopter', icon: '🚀' },
  { id: 'connector', label: 'Connector', icon: '🤝' },
];

function getLevel(pts: number) {
  return [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0];
}
function getNextLevel(pts: number) {
  return LEVELS.find(l => l.min > pts) || null;
}
function formatNGN(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG');
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts]     = useState<any[]>([]);
  const [tab, setTab]         = useState<'overview'|'posts'|'badges'|'settings'>('overview');
  const [copied, setCopied]   = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);

      const { data: p } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setPosts(p || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const copyRef = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(`https://cruise-connect-hub.vercel.app?ref=${profile.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    return null;
  }

  if (!profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400 mb-4">Profile not found</p>
        <Link href="/onboarding" className="text-yellow-400 underline">Complete setup</Link>
      </div>
    </div>
  );

  const level    = getLevel(profile.points || 0);
  const nextLvl  = getNextLevel(profile.points || 0);
  const progress = nextLvl
    ? Math.round(((profile.points - level.min) / (nextLvl.min - level.min)) * 100)
    : 100;
  const displayName = profile.display_name || profile.username || 'Member';
  const username    = profile.username || 'unknown';
  const avatar      = profile.avatar_url || profile.avatar;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader showSearch />
      
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-5">
          {/* Cover */}
          <div className="h-24 bg-gradient-to-r from-yellow-400/20 via-amber-400/10 to-zinc-900 relative">
            {profile.cover_url && (
              <img src={profile.cover_url} alt="" className="w-full h-full object-cover opacity-60" />
            )}
          </div>

          <div className="px-5 pb-5 -mt-10 relative">
            <div className="flex items-end justify-between mb-3">
              {/* Avatar */}
              <div className="relative">
                {avatar ? (
                  <img src={avatar} alt={displayName}
                    className="w-20 h-20 rounded-2xl border-4 border-zinc-900 object-cover shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center text-3xl font-black text-black shadow-xl">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {/* Edit button */}
              <div className="flex gap-2 mt-12">
                {profile.twitter_handle && (
                  <a href={`https://twitter.com/${(profile.twitter_handle||'').replace('@','')}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                )}
                <Link href="/profile/edit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-xs text-yellow-400 hover:bg-yellow-400/20 transition-colors">
                  <Edit3 size={12} /> Edit
                </Link>
              </div>
            </div>

            {/* Name & level */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-xl font-black text-white">{displayName}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${level.bg} ${level.color} border ${level.border}`}>
                  {level.name}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">@{username}</p>
              {profile.bio && <p className="text-zinc-300 text-sm leading-relaxed">{profile.bio}</p>}
              {profile.location && <p className="text-zinc-500 text-xs mt-1">📍 {profile.location}</p>}
            </div>

            {/* Level progress */}
            {nextLvl && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Level Progress</span>
                  <span className="text-yellow-400 font-bold">{(profile.points||0).toLocaleString()} → {nextLvl.min.toLocaleString()} pts</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Posts', value: posts.length },
                { label: 'Points', value: (profile.points||0).toLocaleString() },
                { label: 'Level', value: level.name },
              ].map(s => (
                <div key={s.label} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <div className="text-white font-black text-base">{s.value}</div>
                  <div className="text-zinc-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
          {(['overview','posts','badges','settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${tab === t ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Wallet size={16} className="text-yellow-400"/> Wallet</h3>
                <Link href="/wallet" className="text-xs text-yellow-400 hover:underline flex items-center gap-1">View <ExternalLink size={10}/></Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className="text-yellow-400 font-black text-lg">{formatNGN(profile.wallet_balance||0)}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">Balance</div>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <div className="text-green-400 font-black text-lg">{formatNGN(profile.total_earned||0)}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">Total Earned</div>
                </div>
              </div>
            </div>

            {profile.referral_code && (
              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-yellow-400"/>
                  <h3 className="text-white font-bold">Referral Code</h3>
                  <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold">₦1,000/invite</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl p-3 border border-zinc-700">
                  <code className="text-yellow-400 text-xs flex-1 truncate">
                    cruise-connect-hub.vercel.app?ref={profile.referral_code}
                  </code>
                  <button onClick={copyRef} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                    {copied ? <><CheckCheck size={12} className="text-green-400"/>Copied</> : <><Copy size={12}/>Copy</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* POSTS */}
        {tab === 'posts' && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p className="text-4xl mb-3">✍️</p>
                <p>No posts yet</p>
                <Link href="/feed" className="text-yellow-400 text-sm hover:underline mt-2 block">Write your first post →</Link>
              </div>
            ) : posts.map(p => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-200 text-sm">{p.content}</p>
                <p className="text-zinc-600 text-xs mt-2">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* BADGES */}
        {tab === 'badges' && (
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(b => {
              const earned = (profile.interests || []).includes(b.id) || (profile.points || 0) > 100;
              return (
                <div key={b.id} className={`rounded-2xl p-4 text-center border ${earned ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-zinc-900 border-zinc-800 opacity-40'}`}>
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <div className={`text-xs font-bold ${earned ? 'text-yellow-400' : 'text-zinc-500'}`}>{b.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Settings size={16} className="text-zinc-400"/>Account</h3>
              <div className="space-y-3">
                {[
                  { label: 'Display Name', value: profile.display_name },
                  { label: 'Username', value: '@' + (profile.username||'') },
                  { label: 'X Handle', value: profile.twitter_handle || '—' },
                  { label: 'Bio', value: profile.bio || '—' },
                  { label: 'Email', value: user.email || '—' },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                    <div>
                      <p className="text-zinc-500 text-xs">{f.label}</p>
                      <p className="text-white text-sm">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/profile/edit"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-bold hover:bg-yellow-400/20 transition-colors">
                <Edit3 size={14}/> Edit Profile
              </Link>
            </div>

            <button onClick={signOut}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
              <LogOut size={14}/> Sign Out
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
