// @ts-nocheck
'use client';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const GAMES = [
  { id:'trivia', emoji:'🧠', title:'Cruise Quiz', href:'/games/trivia', color:'bg-blue-500/10 border-blue-500/20', tag:'Popular', players:89 },
  { id:'uno', emoji:'🃏', title:'Cruise Cards', href:'/games/uno', color:'bg-red-500/10 border-red-500/20', tag:'NEW', players:24 },
  { id:'ludo', emoji:'🎲', title:'Cruise Ludo', href:'/games/ludo', color:'bg-emerald-500/10 border-emerald-500/20', tag:'Squad', players:19 },
  { id:'karaoke', emoji:'🎤', title:'Cruise Mic', href:'/games/karaoke', color:'bg-fuchsia-500/10 border-fuchsia-500/20', tag:'Live', players:14 },
  { id:'drawing', emoji:'🎨', title:'Cruise Sketch', href:'/games/drawing', color:'bg-pink-500/10 border-pink-500/20', tag:'Naija', players:18 },
  { id:'codenames', emoji:'🕵️', title:'Cruise Clues', href:'/games/codenames', color:'bg-cyan-500/10 border-cyan-500/20', tag:'Team', players:9 },
  { id:'werewolf', emoji:'🐺', title:'Cruise Wolves', href:'/games/werewolf', color:'bg-violet-500/10 border-violet-500/20', tag:'NEW', players:12 },
  { id:'wordguess', emoji:'🔤', title:'Cruise Word Rush', href:'/games/word-guess', color:'bg-sky-500/10 border-sky-500/20', tag:'Quick', players:11 },
  { id:'spinwheel', emoji:'🎡', title:'Cruise Spin', href:'/games/spin-wheel', color:'bg-lime-500/10 border-lime-500/20', tag:'Party', players:16 },
  { id:'poll', emoji:'📊', title:'Cruise Vote', href:'/games/poll', color:'bg-green-500/10 border-green-500/20', tag:'Today', players:0 },
  { id:'truth', emoji:'💬', title:'Cruise Truth or Dare', href:'/games/truth-dare', color:'bg-orange-500/10 border-orange-500/20', tag:'Hot', players:33 },
  { id:'afterdark', emoji:'🌶️', title:'Cruise After Dark 18+', href:'/games/after-dark', color:'bg-rose-500/10 border-rose-500/20', tag:'18+', players:8 },
  { id:'tournament', emoji:'🏆', title:'Tournaments', href:'/games/tournament', color:'bg-yellow-500/10 border-yellow-500/20', tag:'Prize', players:0 },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 overflow-x-hidden">
      <AppHeader title="Play" back />
      <main className="max-w-lg mx-auto px-3 pt-3">
        <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 mb-3">
          <span className="text-yellow-400 font-black text-xs">PLAY</span>
          <Link href="/leaderboard" className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-zinc-800 px-2.5 py-1.5 rounded-lg">
            <Trophy className="w-3 h-3 text-yellow-400" /> Leaderboard
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {GAMES.map(g => (
            <Link key={g.id} href={g.href} className={`relative border rounded-xl p-3 min-h-[112px] flex flex-col justify-between active:scale-[.98] transition-transform ${g.color}`}>
              <span className="absolute top-2 right-2 text-[9px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">{g.tag}</span>
              <span className="text-2xl">{g.emoji}</span>
              <div className="pr-10"><p className="font-black text-white text-xs leading-tight">{g.title}</p></div>
              {g.players > 0 && <span className="flex items-center gap-1 text-[9px] text-zinc-500"><Users className="w-2.5 h-2.5" />{g.players}</span>}
            </Link>
          ))}
        </div>
        <DailyPollPreview />
      </main>
      <BottomNav />
    </div>
  );
}

function DailyPollPreview() {
  const [poll, setPoll] = require('react').useState<any>(null);
  require('react').useEffect(() => {
    fetch('/api/polls?type=daily&limit=1').then(r => r.json()).then(d => setPoll(d.polls?.[0] || null)).catch(() => {});
  }, []);
  if (!poll) return null;
  const total = (poll.options || []).reduce((a: number, o: any) => a + (o.votes || 0), 0);
  return <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3"><div className="flex items-center gap-2"><span className="text-lg">📊</span><div className="min-w-0"><p className="text-yellow-400 font-black text-[9px] tracking-wider">DAILY POLL</p><p className="text-white font-bold text-xs truncate">{poll.question}</p></div></div><Link href="/games/poll" className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-2 border-t border-zinc-800"><span>{total} votes</span><span className="flex items-center gap-1 text-yellow-400 font-bold">Vote <ArrowRight className="w-3 h-3" /></span></Link></div>;
}
