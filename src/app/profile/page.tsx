// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { Edit3, Trophy, Wallet, Copy, CheckCheck, ExternalLink, Settings, Gift, LogOut, Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const LEVELS = [
  { name:'Newcomer',     min:0,    color:'text-zinc-400',  bg:'bg-zinc-400/10',  border:'border-zinc-600' },
  { name:'Cruiser',      min:100,  color:'text-blue-400',  bg:'bg-blue-400/10',  border:'border-blue-600' },
  { name:'Connector',    min:500,  color:'text-green-400', bg:'bg-green-400/10', border:'border-green-600' },
  { name:'Hub Star',     min:1000, color:'text-yellow-400',bg:'bg-yellow-400/10',border:'border-yellow-600' },
  { name:'Culture King', min:2500, color:'text-orange-400',bg:'bg-orange-400/10',border:'border-orange-600' },
  { name:'Legend',       min:5000, color:'text-red-400',   bg:'bg-red-400/10',   border:'border-red-600' },
];

function getLevel(pts: number) {
  return [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0];
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts]     = useState<any[]>([]);
  const [tab, setTab]         = useState<'posts'|'overview'|'badges'>('overview');
  const [copied, setCopied]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!data) {
        // Profile missing — create it now via admin API
        const meta = user.user_metadata || {};
        const fallback = (
          meta.preferred_username || meta.username ||
          (user.email || '').split('@')[0]
        ).toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,30) || `user_${user.id.slice(0,6)}`;

        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username:     fallback,
            display_name: meta.full_name || meta.name || fallback,
          }),
        });

        if (!res.ok) {
          // Can't create profile — send to onboarding
          setLoading(false);
          router.replace('/onboarding');
          return;
        }

        // Fetch the newly created row
        const { data: fresh } = await supabase
          .from('profiles').select('*').eq('id', user.id).maybeSingle();

        if (!fresh) {
          // Still not there — go to onboarding
          setLoading(false);
          router.replace('/onboarding');
          return;
        }

        setProfile(fresh);
      } else if (!data.display_name && !data.username) {
        // Row exists but empty — incomplete onboarding
        setLoading(false);
        router.replace('/onboarding');
        return;
      } else {
        setProfile(data);
      }

      // Load posts
      const { data: p } = await supabase
        .from('posts')
        .select('id,content,created_at,likes_count,replies_count')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setPosts(p || []);
      setLoading(false);
    };

    load();
  }, [user, retries]);

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

  // Auth loading
  if (authLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
    </div>
  );

  // Not logged in
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    return null;
  }

  // Profile loading/creating
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-6">
      <div className="text-4xl">🚌</div>
      <p className="text-white font-black text-lg">Loading your profile…</p>
      <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
    </div>
  );

  // Should not reach here (router.replace handles null profile)
  if (!profile) return null;

  const level       = getLevel(profile.points || 0);
  const nextLvl     = LEVELS.find(l => l.min > (profile.points || 0));
  const progress    = nextLvl
    ? Math.min(100, Math.round(((profile.points || 0) - level.min) / (nextLvl.min - level.min) * 100))
    : 100;
  const displayName = profile.display_name || profile.username || 'Member';
  const username    = profile.username || 'unknown';

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader showSearch />

      <div className="max-w-lg mx-auto px-4 pt-4">

        {/* Profile card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
          {/* Cover */}
          <div className="h-20 bg-gradient-to-r from-yellow-400/20 via-amber-400/10 to-zinc-900 relative">
            {profile.cover_url && <img src={profile.cover_url} className="w-full h-full object-cover" alt="" />}
          </div>

          <div className="px-4 pb-4 -mt-8">
            <div className="flex items-end justify-between mb-3">
              {/* Avatar */}
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName}
                  className="w-16 h-16 rounded-2xl border-4 border-zinc-900 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center text-2xl font-black text-black">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2 mb-0.5">
                <Link href="/profile/edit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded-full">
                  <Edit3 className="w-3 h-3" /> Edit
                </Link>
                <Link href="/settings"
                  className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-full">
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h1 className="font-black text-white text-xl">{displayName}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${level.bg} ${level.color} border ${level.border}`}>
                  {level.name}
                </span>
              </div>
              <p className="text-zinc-400 text-sm">@{username}</p>
              {profile.bio && <p className="text-zinc-300 text-sm mt-1.5 leading-relaxed">{profile.bio}</p>}
              {profile.location && <p className="text-zinc-500 text-xs mt-1">📍 {profile.location}</p>}
            </div>

            {/* Level progress */}
            {nextLvl && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">→ {nextLvl.name}</span>
                  <span className="text-yellow-400 font-bold">{(profile.points||0).toLocaleString()} / {nextLvl.min.toLocaleString()} pts</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{width:`${progress}%`}} />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                {label:'Posts',    value:posts.length},
                {label:'Points',   value:(profile.points||0).toLocaleString()},
                {label:'Followers',value:(profile.followers_count||0).toLocaleString()},
                {label:'Following',value:(profile.following_count||0).toLocaleString()},
              ].map(s => (
                <div key={s.label} className="bg-zinc-800/60 rounded-xl p-2 text-center">
                  <p className="text-white font-black text-sm">{s.value}</p>
                  <p className="text-zinc-500 text-[9px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referral card */}
        {profile.referral_code && (
          <div className="bg-yellow-400/8 border border-yellow-400/20 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 font-black text-sm">Referral Link</p>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold ml-auto">₦1k/invite</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 rounded-xl px-3 py-2">
              <code className="text-zinc-300 text-xs flex-1 truncate">…?ref={profile.referral_code}</code>
              <button onClick={copyRef} className="shrink-0 text-zinc-400">
                {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 mb-4">
          {[['overview','Overview'],['posts','Posts'],['badges','Badges']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab===t ? 'bg-yellow-400 text-black':'text-zinc-400'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* OVERVIEW tab */}
        {tab === 'overview' && (
          <div className="space-y-3 mb-4">
            <Link href="/wallet" className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-bold text-sm">Wallet</p>
                  <p className="text-zinc-500 text-xs">₦{((profile.wallet_balance||0)/100).toLocaleString('en-NG')} balance</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </Link>
            <Link href="/community-id" className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🪪</span>
                <div>
                  <p className="text-white font-bold text-sm">Community ID</p>
                  <p className="text-zinc-500 text-xs">View your member card</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </Link>
            <Link href="/leaderboard" className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-bold text-sm">Leaderboard</p>
                  <p className="text-zinc-500 text-xs">{(profile.points||0).toLocaleString()} pts earned</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </Link>
            <button onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-red-400 text-sm font-bold">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

        {/* POSTS tab */}
        {tab === 'posts' && (
          <div className="space-y-3 mb-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">✍️</div>
                <p className="text-white font-bold mb-2">No posts yet</p>
                <Link href="/feed" className="text-yellow-400 text-sm font-bold">Write your first post →</Link>
              </div>
            ) : posts.map(p => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-200 text-sm leading-relaxed">{p.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                  <span>❤️ {p.likes_count||0}</span>
                  <span>💬 {p.replies_count||0}</span>
                  <span className="ml-auto">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BADGES tab */}
        {tab === 'badges' && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {id:'early',   icon:'🚀', label:'Early Adopter', pts:0},
              {id:'cruiser', icon:'🚌', label:'First Cruise',   pts:0},
              {id:'poster',  icon:'✍️', label:'First Post',    pts:posts.length > 0 ? 1 : 0},
              {id:'points',  icon:'⭐', label:'100 Points',    pts:profile.points||0, min:100},
              {id:'streak',  icon:'🔥', label:'7-Day Streak',  pts:profile.current_streak||0, min:7},
              {id:'earner',  icon:'💰', label:'First Naira',   pts:profile.total_earned||0, min:1},
            ].map(b => {
              const earned = b.pts >= (b.min || 0) || b.id === 'early' || b.id === 'cruiser';
              return (
                <div key={b.id} className={`rounded-2xl p-4 text-center border ${earned ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-zinc-900 border-zinc-800 opacity-40'}`}>
                  <div className="text-3xl mb-1.5">{b.icon}</div>
                  <p className={`text-xs font-bold leading-tight ${earned ? 'text-yellow-400' : 'text-zinc-500'}`}>{b.label}</p>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
