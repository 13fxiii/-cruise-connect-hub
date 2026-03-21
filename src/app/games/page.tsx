// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Trophy, Users, Zap, ArrowRight, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const GAMES = [
  { id:'trivia', emoji:'🧠', title:'Trivia', desc:'Naija & General Knowledge', href:'/games/trivia', color:'bg-blue-500/10 border-blue-500/20', tag:'Popular', players:89 },
  { id:'uno',    emoji:'🃏', title:'UNO',    desc:'Classic card game vs bots',  href:'/games/uno',    color:'bg-red-500/10 border-red-500/20',  tag:'NEW 🔥', players:24 },
  { id:'drawing',emoji:'🎨', title:'Draw & Guess', desc:'Draw Naija things',    href:'/games/drawing',color:'bg-pink-500/10 border-pink-500/20', tag:'🇳🇬 Naija', players:18 },
  { id:'poll',   emoji:'📊', title:'Daily Poll',   desc:'Vote on today\'s topic',href:'/games/poll',   color:'bg-green-500/10 border-green-500/20', tag:'Today', players:0 },
  { id:'truth',  emoji:'💬', title:'Truth or Dare',desc:'Community T&D rounds', href:'/games/truth-dare', color:'bg-orange-500/10 border-orange-500/20', tag:'Hot', players:33 },
  { id:'tournament',emoji:'🏆',title:'Tournament', desc:'Compete for prizes',   href:'/games/tournament',color:'bg-yellow-500/10 border-yellow-500/20', tag:'₦100K', players:0 },
];

export default function GamesPage() {
  const { user }         = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLd]    = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) { setLd(false); return; }
    supabase.from('profiles').select('points').eq('id', user.id).single()
      .then(({ data }) => { setPoints(data?.points || 0); setLd(false); });
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Play" back />

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Points banner */}
        {user && (
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 mb-5">
            <div>
              <p className="text-zinc-500 text-xs">Your Points</p>
              <p className="text-yellow-400 font-black text-xl">{loading ? '—' : points.toLocaleString()} <span className="text-xs text-zinc-500">pts</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/leaderboard" className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Leaderboard
              </Link>
            </div>
          </div>
        )}

        {/* Game grid */}
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map(g => (
            <Link key={g.id} href={g.href}
              className={`relative border rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-transform ${g.color}`}>
              {g.tag && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">
                  {g.tag}
                </span>
              )}
              <span className="text-3xl">{g.emoji}</span>
              <div>
                <p className="font-black text-white text-sm">{g.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5 leading-snug line-clamp-2">{g.desc}</p>
              </div>
              {g.players > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Users className="w-3 h-3" />{g.players} playing
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Daily Poll section */}
        <DailyPollPreview />
      </div>
      <BottomNav />
    </div>
  );
}

function DailyPollPreview() {
  const [poll, setPoll] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/polls?type=daily&limit=1')
      .then(r => r.json())
      .then(d => setPoll(d.polls?.[0] || null))
      .catch(() => {});
  }, []);

  if (!poll) return null;

  const total = (poll.options || []).reduce((a: number, o: any) => a + (o.votes || 0), 0);

  return (
    <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <div>
          <p className="text-yellow-400 font-black text-xs tracking-wider">DAILY POLL</p>
          <p className="text-white font-bold text-sm">{poll.question}</p>
        </div>
      </div>
      <Link href="/games/poll" className="flex items-center justify-between text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800">
        <span>{total} votes</span>
        <span className="flex items-center gap-1 text-yellow-400 font-bold">Vote now <ArrowRight className="w-3.5 h-3.5" /></span>
      </Link>
    </div>
  );
}
