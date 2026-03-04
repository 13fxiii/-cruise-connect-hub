"use client";
import { useState } from "react";
import { Gamepad2, Trophy, Users, Clock, Zap, ArrowRight, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const GAMES = [
  { id:"trivia", title:"Trivia Challenge 🧠", status:"active", entry_fee:0, prize_pool:25000, players:38, starts:"Play Now", desc:"10 questions · Naija & General Knowledge", href:"/games/trivia", tag:"Popular", colorFrom:"from-blue-500/20", border:"border-blue-500/30", color:"text-blue-400" },
  { id:"word-guess", title:"Naija Wordle 🇳🇬", status:"active", entry_fee:0, prize_pool:0, players:91, starts:"Play Now", desc:"Guess the word · Naija slang edition", href:"/games/word-guess", tag:"NEW 🔥", colorFrom:"from-emerald-500/20", border:"border-emerald-500/30", color:"text-emerald-400" },
  { id:"spin-wheel", title:"Spin the Wheel 🎡", status:"active", entry_fee:0, prize_pool:0, players:0, starts:"Play Now", desc:"Prizes · Dares · Community fun — spin to see!", href:"/games/spin-wheel", tag:"NEW 🔥", colorFrom:"from-pink-500/20", border:"border-pink-500/30", color:"text-pink-400" },
  { id:"truth-dare", title:"Truth or Dare 🔥", status:"active", entry_fee:0, prize_pool:0, players:12, starts:"Play Now", desc:"Community game — Mild · Spicy · Savage editions", href:"/games/truth-dare", tag:"Group", colorFrom:"from-orange-500/20", border:"border-orange-500/30", color:"text-orange-400" },
  { id:"ludo", title:"Ludo Board 🎲", status:"active", entry_fee:0, prize_pool:50000, players:0, starts:"Play Now", desc:"Classic Ludo · 2–4 players · Full board game", href:"/games/ludo", tag:"2-4P", colorFrom:"from-green-500/20", border:"border-green-500/30", color:"text-green-400" },
  { id:"poll", title:"Community Poll League 📊", status:"active", entry_fee:0, prize_pool:10000, players:234, starts:"Play Now", desc:"Vote on weekly themes · Earn points · Climb the board", href:"/games/poll", tag:"Community", colorFrom:"from-purple-500/20", border:"border-purple-500/30", color:"text-purple-400" },
  { id:"kahoot", title:"Kahoot Night ⚡", status:"upcoming", entry_fee:200, prize_pool:8000, players:44, starts:"Wed 9PM WAT", desc:"Fast-paced quiz night with the community", href:"/games/trivia", tag:"Soon", colorFrom:"from-yellow-500/20", border:"border-yellow-500/30", color:"text-yellow-400" },
  { id:"tournament", title:"Ludo Tournament 🏆", status:"upcoming", entry_fee:1000, prize_pool:50000, players:19, starts:"Fri 8PM WAT", desc:"Bracket-style tournament · Winner takes all", href:"/games/ludo", tag:"Paid", colorFrom:"from-red-500/20", border:"border-red-500/30", color:"text-red-400" },
];

const LEADERBOARD = [
  { rank:1, username:"@connectplug", name:"ConnectPlug", points:12400, wins:18, avatar:"CP" },
  { rank:2, username:"@13fxiii", name:"FX〽️", points:11800, wins:15, avatar:"FX" },
  { rank:3, username:"@naijagamer", name:"NaijaGamer", points:9200, wins:12, avatar:"NG" },
  { rank:4, username:"@theconnector", name:"The Connector", points:7600, wins:9, avatar:"TC" },
  { rank:5, username:"@thrillseeka", name:"ThrillSeeka", points:6100, wins:7, avatar:"TS" },
  { rank:6, username:"@afroboss", name:"AfroBoss", points:4800, wins:5, avatar:"AB" },
  { rank:7, username:"@lagosking", name:"LagosKing", points:3200, wins:4, avatar:"LK" },
];

export default function GamesPage() {
  const [tab, setTab] = useState<"games"|"leaderboard">("games");

  const liveGames = GAMES.filter(g=>g.status==="active");
  const upcoming = GAMES.filter(g=>g.status==="upcoming");
  const totalPrize = GAMES.reduce((s,g)=>s+g.prize_pool,0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><Gamepad2 className="text-yellow-400 w-8 h-8"/>Games Hub</h1>
          <p className="text-zinc-400 mt-1">Play, compete & win real Naira prizes with the community</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{l:"Total Prizes",v:"₦"+Math.round(totalPrize/1000)+"K",I:Trophy},{l:"Players Online",v:"234+",I:Users},{l:"Live Games",v:String(liveGames.length),I:Zap}].map(({l,v,I})=>(
            <div key={l} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <I className="w-5 h-5 text-yellow-400 mx-auto mb-2"/>
              <div className="text-xl font-black text-yellow-400">{v}</div>
              <div className="text-xs text-zinc-400">{l}</div>
            </div>
          ))}
        </div>

        {/* Community ID Banner */}
        <Link href="/community-id" className="block mb-6">
          <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent border border-yellow-400/30 rounded-2xl p-4 hover:border-yellow-400/60 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400"/>
                  <span className="text-yellow-400 font-black text-sm">Get Your Community ID Card 🚌</span>
                </div>
                <p className="text-zinc-400 text-xs">Generate your C&C Hub member card — flex it on X, Instagram, WhatsApp & more</p>
              </div>
              <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform"/>
            </div>
          </div>
        </Link>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {[["games","🎮 Games"],["leaderboard","🏆 Leaderboard"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v as any)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab===v?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>

        {tab==="games" && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              <span className="text-zinc-400 text-sm font-bold">{liveGames.length} games live now</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {GAMES.map(game=>(
                <div key={game.id} className={`bg-gradient-to-br ${game.colorFrom} to-transparent border ${game.border} rounded-2xl p-5 flex flex-col hover:scale-[1.02] transition-all`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-white text-base leading-tight flex-1">{game.title}</h3>
                    <span className={`flex-shrink-0 ml-2 text-xs font-black px-2 py-0.5 rounded-full border ${game.status==="active"?"bg-green-500/20 text-green-400 border-green-500/30":"bg-zinc-700 text-zinc-300 border-zinc-600"}`}>
                      {game.tag}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">{game.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{game.players}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{game.starts}</span>
                    {game.entry_fee>0 && <span className="text-yellow-400 font-bold">₦{game.entry_fee.toLocaleString()}</span>}
                  </div>
                  {game.prize_pool>0 && (
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 mb-4">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wide">Prize Pool</div>
                      <div className="text-lg font-black text-yellow-400">₦{game.prize_pool.toLocaleString()}</div>
                    </div>
                  )}
                  <div className="mt-auto">
                    {game.status==="active" ? (
                      <Link href={game.href} className="w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
                        Play Now <ArrowRight className="w-4 h-4"/>
                      </Link>
                    ) : (
                      <div className="w-full bg-zinc-800 text-zinc-400 font-bold py-3 rounded-full flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4"/>{game.starts}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="leaderboard" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="font-black text-white">Top Players</h2>
                <p className="text-xs text-zinc-500 mt-0.5">This week's rankings</p>
              </div>
              <Link href="/leaderboard" className="text-yellow-400 text-sm font-bold hover:text-yellow-300">View Full →</Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {LEADERBOARD.map(p=>(
                <div key={p.rank} className={`flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/50 transition-colors ${p.rank<=3?"bg-yellow-400/5":""}`}>
                  <div className={`w-8 text-center font-black text-lg ${p.rank===1?"text-yellow-400":p.rank===2?"text-zinc-300":p.rank===3?"text-orange-400":"text-zinc-600"}`}>
                    {p.rank===1?"🥇":p.rank===2?"🥈":p.rank===3?"🥉":p.rank}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-black text-zinc-300">{p.avatar}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-xs text-zinc-500">{p.username}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-yellow-400 text-sm">{p.points.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">{p.wins} wins</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
