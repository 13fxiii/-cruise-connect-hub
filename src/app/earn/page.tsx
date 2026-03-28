// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Copy, Check, Users, Zap, Gift, ShoppingBag, ArrowRight, Loader2, TrendingUp, Star, Calendar } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cruise-connect-hub.vercel.app';

export default function EarnPage() {
  const { user }          = useAuth();
  const [profile, setPf]  = useState<any>(null);
  const [refs, setRefs]   = useState<any[]>([]);
  const [earnings, setEn] = useState<any[]>([]);
  const [loading, setLd]  = useState(true);
  const [copied, setCp]   = useState(false);
  const [streak, setSt]   = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: pf }, { data: rf }, { data: en }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('referrals').select('*,profiles!referred_id(username,display_name,avatar_url)').eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setPf(pf); setRefs(rf || []); setEn(en || []);
      setSt(pf?.current_streak || 0);
      setLd(false);
    };
    load();
  }, [user]);

  const refLink = profile?.referral_code
    ? `${appUrl}?ref=${profile.referral_code}`
    : '';

  const copy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCp(true); setTimeout(() => setCp(false), 2000);
  };

  const totalEarned = earnings
    .filter(e => e.type === 'referral_bonus' || e.type === 'gift_earned' || e.type === 'earn')
    .reduce((a, e) => a + (e.amount || 0), 0);

  const EARN_CARDS = [
    { emoji:'🎁', title:'Live Gifts',      desc:'Earn when fans gift you in spaces',  href:'/spaces',      cta:'Go Live',    color:'border-pink-500/20 bg-pink-500/5' },
    { emoji:'🔗', title:'Refer & Earn',    desc:`You've referred ${refs.length} people`, href:'#referral', cta:'Share Link', color:'border-yellow-500/20 bg-yellow-500/5' },
    { emoji:'🛒', title:'Sell on Store',   desc:'List services or products',           href:'/marketplace', cta:'Open Store', color:'border-green-500/20 bg-green-500/5' },
    { emoji:'🎭', title:'Submit Music',    desc:'Get featured & earn plays',           href:'/music',       cta:'Submit',     color:'border-purple-500/20 bg-purple-500/5' },
    { emoji:'🏆', title:'Tournaments',     desc:'Win prize pools',                     href:'/games/tournament', cta:'Compete', color:'border-blue-500/20 bg-blue-500/5' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Earn" back />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Stats row */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Points" value={(profile?.points || 0).toLocaleString()} icon={<Zap className="w-4 h-4" />} />
            <StatBox label="Referrals" value={refs.length} icon={<Users className="w-4 h-4" />} />
            <StatBox label="Streak" value={`${streak}d 🔥`} icon={<Calendar className="w-4 h-4" />} />
          </div>
        )}

        {/* Daily Check-in */}
        <DailyCheckin userId={user?.id || ''} streak={streak} onCheckin={() => setSt(s => s + 1)} />

        {/* Referral card */}
        {profile?.referral_code && (
          <div id="referral" className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔗</span>
              <div>
                <p className="font-black text-yellow-400 text-sm">Your Referral Link</p>
                <p className="text-zinc-400 text-xs">{refs.length} members joined via you</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2.5 mb-3">
              <p className="text-zinc-300 text-xs flex-1 truncate font-mono">{refLink}</p>
              <button onClick={copy} className="shrink-0 p-1">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join Cruise & Connect Hub — the home of Naija culture!\n\n${refLink}\n\n#CruiseAndConnect #CCHub`)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-yellow-400 text-black font-black text-sm rounded-xl">
              Share on X 🐦
            </a>
          </div>
        )}

        {/* Earn streams */}
        <div className="space-y-2.5">
          <p className="text-zinc-400 font-bold text-xs tracking-wider">WAYS TO EARN</p>
          {EARN_CARDS.map(card => (
            <Link key={card.title} href={card.href}
              className={`flex items-center gap-4 border rounded-2xl p-4 active:scale-[0.98] transition-transform ${card.color}`}>
              <span className="text-2xl shrink-0">{card.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{card.title}</p>
                <p className="text-zinc-500 text-xs">{card.desc}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-xs text-yellow-400 font-bold">
                {card.cta} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent earnings */}
        {earnings.length > 0 && (
          <div>
            <p className="text-zinc-400 font-bold text-xs tracking-wider mb-2">RECENT EARNINGS</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
              {earnings.map((e, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{(e.type || 'earned').replace(/_/g,' ')}</p>
                    <p className="text-zinc-500 text-xs">{new Date(e.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-black text-sm ${e.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {e.amount > 0 ? '+' : ''}{e.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3 flex flex-col items-center gap-1">
      <div className="text-yellow-400">{icon}</div>
      <p className="text-white font-black text-lg leading-none">{value}</p>
      <p className="text-zinc-500 text-[10px]">{label}</p>
    </div>
  );
}

function DailyCheckin({ userId, streak, onCheckin }: { userId: string; streak: number; onCheckin: () => void }) {
  const [done, setDone]   = useState(false);
  const [loading, setLd]  = useState(false);
  const [checked, setCkd] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase.from('daily_checkins').select('id').eq('user_id', userId).eq('date', today).maybeSingle()
      .then(({ data }) => { setCkd(!!data); setDone(!!data); });
  }, [userId]);

  const checkin = async () => {
    if (done || loading) return;
    setLd(true);
    try {
      const r = await fetch('/api/checkin', { method: 'POST' });
      if (r.ok) { setDone(true); onCheckin(); }
      else {
        const d = await r.json();
        alert(d.error || "Check-in failed. Try again.");
      }
    } catch { alert("Network error. Check your connection."); }
    setLd(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{done ? '✅' : '📅'}</span>
        <div>
          <p className="font-bold text-white text-sm">Daily Check-in</p>
          <p className="text-zinc-500 text-xs">{streak}d streak · +50 pts</p>
        </div>
      </div>
      <button onClick={checkin} disabled={done || loading}
        className={`px-4 py-2 text-xs font-black rounded-xl transition-all active:scale-95 ${
          done ? 'bg-zinc-800 text-zinc-500' : 'bg-yellow-400 text-black'
        }`}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? 'Done ✓' : 'Check In'}
      </button>
    </div>
  );
}
