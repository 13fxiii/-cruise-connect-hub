"use client";
import { useState } from "react";
import { Trophy, Users, Clock, Zap, ArrowLeft, Crown, Medal, Award, ChevronRight, Shield, Target, Star } from "lucide-react";

import Link from "next/link";

// Mock tournament data — replace with API data
const TOURNAMENTS = [
  {
    id: "t1", title: "Ludo Championship 🎲", type: "Ludo", status: "active",
    prize_pool: 50000, entry_fee: 1000, max_players: 16, current_round: 2,
    starts_at: "Live Now", description: "Bracket-style Ludo tournament. Winner takes ₦50,000!",
    total_entries: 16,
  },
  {
    id: "t2", title: "Trivia Showdown ⚡", type: "Trivia", status: "upcoming",
    prize_pool: 25000, entry_fee: 500, max_players: 32, current_round: 0,
    starts_at: "Fri 9PM WAT", description: "32-player trivia knockout. 4 rounds, 1 winner.",
    total_entries: 21,
  },
  {
    id: "t3", title: "Truth or Dare Finals 🔥", type: "Truth or Dare", status: "ended",
    prize_pool: 15000, entry_fee: 0, max_players: 16, current_round: 4,
    starts_at: "Ended", description: "Community voted — savage edition. Closed.",
    total_entries: 16,
  },
];

// Mock bracket data for tournament t1
const BRACKET: Record<number, {id:string; p1:string; p2:string; winner?:string; p1score?:number; p2score?:number; status:string}[]> = {
  1: [
    { id:"m1", p1:"@connectplug", p2:"@afroboss", winner:"@connectplug", p1score:3, p2score:1, status:"completed" },
    { id:"m2", p1:"@13fxiii_", p2:"@lagosking", winner:"@13fxiii_", p1score:3, p2score:2, status:"completed" },
    { id:"m3", p1:"@naijagamer", p2:"@theconnector", winner:"@naijagamer", p1score:3, p2score:0, status:"completed" },
    { id:"m4", p1:"@thrillseeka", p2:"@waveyboy", winner:"@thrillseeka", p1score:2, p2score:3, status:"completed" },
    { id:"m5", p1:"@abuja_plug", p2:"@ph_vibes", winner:"@abuja_plug", p1score:3, p2score:1, status:"completed" },
    { id:"m6", p1:"@cruisemaste", p2:"@connectking", winner:"@connectking", p1score:1, p2score:3, status:"completed" },
    { id:"m7", p1:"@naijadrip", p2:"@lagosboy", winner:"@naijadrip", p1score:3, p2score:2, status:"completed" },
    { id:"m8", p1:"@thegsavage", p2:"@hubchamp", winner:"@hubchamp", p1score:0, p2score:3, status:"completed" },
  ],
  2: [
    { id:"m9", p1:"@connectplug", p2:"@13fxiii_", winner:"@connectplug", p1score:3, p2score:1, status:"completed" },
    { id:"m10", p1:"@naijagamer", p2:"@waveyboy", winner:"@naijagamer", p1score:3, p2score:2, status:"completed" },
    { id:"m11", p1:"@abuja_plug", p2:"@connectking", p1score:2, p2score:2, status:"active" },
    { id:"m12", p1:"@naijadrip", p2:"@hubchamp", status:"pending" },
  ],
  3: [
    { id:"m13", p1:"@connectplug", p2:"@naijagamer", status:"pending" },
    { id:"m14", p1:"TBD", p2:"TBD", status:"pending" },
  ],
  4: [
    { id:"m15", p1:"TBD", p2:"TBD", status:"pending" },
  ],
};

const ROUND_NAMES: Record<number, string> = { 1:"Round of 16", 2:"Quarter-Finals", 3:"Semi-Finals", 4:"🏆 Grand Final" };

function MatchCard({ match }: { match: any }) {
  const isDone = match.status === "completed";
  const isLive = match.status === "active";
  const isPending = match.status === "pending";
  return (
    <div className={`rounded-xl border overflow-hidden text-xs ${isLive ? "border-yellow-400/60 shadow-lg shadow-yellow-400/10" : isDone ? "border-zinc-800" : "border-zinc-800/50"}`}>
      {isLive && (
        <div className="bg-yellow-400/10 text-yellow-400 text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> LIVE
        </div>
      )}
      {[{p:match.p1, sc:match.p1score, won:isDone&&match.winner===match.p1},{p:match.p2, sc:match.p2score, won:isDone&&match.winner===match.p2}].map(({p,sc,won},i) => (
        <div key={i} className={`flex items-center justify-between px-3 py-2 ${i===0?"border-b border-zinc-800/50":""} ${won?"bg-yellow-400/5":""} ${isPending?"opacity-40":""}`}>
          <span className={`font-semibold truncate max-w-[80px] ${won?"text-yellow-400":"text-zinc-300"}`}>{p||"TBD"}</span>
          <div className="flex items-center gap-2">
            {sc !== undefined && <span className={`font-black text-sm ${won?"text-yellow-400":"text-zinc-500"}`}>{sc}</span>}
            {won && <Crown className="w-3 h-3 text-yellow-400"/>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TournamentPage() {
  const [selected, setSelected] = useState<typeof TOURNAMENTS[0]|null>(null);
  const [entering, setEntering] = useState(false);
  const [entered, setEntered] = useState(false);

  if (selected) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={()=>setSelected(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4"/> All Tournaments
        </button>

        {/* Tournament Header */}
        <div className="bg-zinc-900 border border-yellow-400/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selected.status==="active"?"bg-green-500/20 text-green-400 border border-green-500/30":selected.status==="upcoming"?"bg-yellow-400/20 text-yellow-400 border border-yellow-400/30":"bg-zinc-700 text-zinc-400"}`}>
                  {selected.status === "active" ? "🔴 LIVE" : selected.status === "upcoming" ? "⏰ UPCOMING" : "✅ ENDED"}
                </span>
                <span className="text-xs text-zinc-500">{selected.type}</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-1">{selected.title}</h1>
              <p className="text-sm text-zinc-400">{selected.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 flex-shrink-0">
              {[
                {label:"Prize Pool", val:`₦${selected.prize_pool.toLocaleString()}`, color:"text-yellow-400"},
                {label:"Entry Fee", val:selected.entry_fee?`₦${selected.entry_fee.toLocaleString()}`:"FREE", color:"text-green-400"},
                {label:"Players", val:`${selected.total_entries}/${selected.max_players}`, color:"text-white"},
              ].map(s=>(
                <div key={s.label} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <div className={`font-black text-lg ${s.color}`}>{s.val}</div>
                  <div className="text-zinc-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {selected.status === "upcoming" && !entered && (
            <div className="mt-5 pt-5 border-t border-zinc-800">
              <button onClick={()=>setEntering(true)}
                className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors flex items-center gap-2">
                <Trophy className="w-4 h-4"/> Enter Tournament {selected.entry_fee ? `— ₦${selected.entry_fee.toLocaleString()}` : "— FREE"}
              </button>
              <p className="text-xs text-zinc-500 mt-2">Entry fee deducted from your wallet. Prize paid directly to winner's wallet.</p>
            </div>
          )}
          {entered && (
            <div className="mt-5 pt-5 border-t border-zinc-800 text-green-400 font-bold text-sm flex items-center gap-2">
              <CheckIcon className="w-5 h-5"/> You're entered! Get ready for {selected.starts_at}.
            </div>
          )}
        </div>

        {/* Entry Modal */}
        {entering && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-black text-white text-lg mb-2">Confirm Entry</h3>
              <p className="text-zinc-400 text-sm mb-4">Join <span className="text-yellow-400">{selected.title}</span>. {selected.entry_fee ? `₦${selected.entry_fee.toLocaleString()} will be deducted from your wallet.` : "This tournament is FREE to enter."}</p>
              <div className="bg-zinc-800 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-2"><span className="text-zinc-400">Entry Fee</span><span className="font-bold text-white">{selected.entry_fee ? `₦${selected.entry_fee.toLocaleString()}` : "FREE"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-400">Prize Pool</span><span className="font-bold text-yellow-400">₦{selected.prize_pool.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setEntering(false)} className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-3 rounded-full hover:bg-zinc-700">Cancel</button>
                <button onClick={()=>{setEntered(true);setEntering(false);}} className="flex-1 bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300">Confirm ✓</button>
              </div>
            </div>
          </div>
        )}

        {/* Bracket */}
        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2"><Target className="text-yellow-400 w-5 h-5"/> Tournament Bracket</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {[1,2,3,4].map(round => {
              const matches = BRACKET[round] || [];
              return (
                <div key={round} className="w-52 flex-shrink-0">
                  <div className={`text-center text-xs font-black mb-3 px-3 py-1.5 rounded-full ${round===4?"bg-yellow-400 text-black":"bg-zinc-800 text-zinc-300"}`}>
                    {ROUND_NAMES[round]}
                  </div>
                  <div className="space-y-4">
                    {matches.map(m => <MatchCard key={m.id} match={m}/>)}
                    {matches.length === 0 && <div className="text-zinc-600 text-xs text-center py-4">TBD</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prize breakdown */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-black text-white mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/> Prize Breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              {place:"1st Place",pct:60,icon:<Crown className="w-6 h-6 text-yellow-400"/>},
              {place:"2nd Place",pct:25,icon:<Medal className="w-6 h-6 text-zinc-300"/>},
              {place:"3rd Place",pct:15,icon:<Award className="w-6 h-6 text-orange-400"/>},
            ].map(({place,pct,icon}) => (
              <div key={place} className="bg-zinc-800/50 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">{icon}</div>
                <div className="font-black text-white text-lg">₦{Math.floor(selected.prize_pool*pct/100).toLocaleString()}</div>
                <div className="text-zinc-400 text-xs">{place}</div>
                <div className="text-zinc-600 text-xs">{pct}% of pool</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Trophy className="text-yellow-400 w-8 h-8"/> Tournaments
            </h1>
            <p className="text-zinc-400 mt-1">Bracket-style competitions · Real Naira prizes · Community glory</p>
          </div>
          <Link href="/games" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
            All Games <ChevronRight className="w-4 h-4"/>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOURNAMENTS.map(t => (
            <button key={t.id} onClick={()=>setSelected(t)}
              className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/40 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-yellow-400/5 group">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.status==="active"?"bg-green-500/20 text-green-400 border border-green-500/30":t.status==="upcoming"?"bg-yellow-400/20 text-yellow-400 border border-yellow-400/30":"bg-zinc-700 text-zinc-500"}`}>
                  {t.status === "active" ? "🔴 LIVE" : t.status === "upcoming" ? "⏰ SOON" : "✅ DONE"}
                </span>
                <span className="text-xs text-zinc-500">{t.type}</span>
              </div>
              <h3 className="font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">{t.title}</h3>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{t.description}</p>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-yellow-400 font-black text-lg">₦{t.prize_pool.toLocaleString()}</div>
                  <div className="text-zinc-500 text-xs">prize pool</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm">{t.total_entries}/{t.max_players}</div>
                  <div className="text-zinc-500 text-xs">players</div>
                </div>
              </div>
              <div className="mt-3 bg-zinc-800 rounded-full h-1.5">
                <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{width:`${(t.total_entries/t.max_players)*100}%`}}/>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{t.entry_fee ? `₦${t.entry_fee.toLocaleString()} entry` : "Free entry"}</span>
                <span className="text-yellow-400 text-xs font-bold group-hover:underline">View Bracket →</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function CheckIcon({className}:{className?:string}) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
}
