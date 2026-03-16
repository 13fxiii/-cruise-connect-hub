"use client";
import { useState } from "react";
import { Gamepad2, Trophy, Users, Zap, ArrowRight, ExternalLink, Play, Star, Lock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

/* ── IN-APP BROWSER GAMES (playable right here) ─────────────── */
const BROWSER_GAMES = [
  {
    id:"trivia", title:"Trivia Challenge", emoji:"🧠", status:"live", tag:"Popular",
    desc:"Naija & General Knowledge · 10 Qs · Timed rounds",
    players:89, prize:"₦25K pool", href:"/games/trivia",
    color:"from-blue-500/20 to-blue-600/5", border:"border-blue-500/30", text:"text-blue-400",
  },
  {
    id:"word-guess", title:"Naija Wordle", emoji:"🇳🇬", status:"live", tag:"NEW 🔥",
    desc:"Guess the 5-letter Nigerian slang word · 6 attempts",
    players:134, prize:"Fun only", href:"/games/word-guess",
    color:"from-emerald-500/20 to-emerald-600/5", border:"border-emerald-500/30", text:"text-emerald-400",
  },
  {
    id:"truth-dare", title:"Truth or Dare", emoji:"🔥", status:"live", tag:"Group",
    desc:"Naija edition · Mild · Spicy · Savage modes",
    players:24, prize:"Community vibes", href:"/games/truth-dare",
    color:"from-orange-500/20 to-orange-600/5", border:"border-orange-500/30", text:"text-orange-400",
  },
  {
    id:"spin-wheel", title:"Spin the Wheel", emoji:"🎡", status:"live", tag:"Prizes",
    desc:"Random prizes, dares, and community fun — spin & see",
    players:0, prize:"Mystery prizes", href:"/games/spin-wheel",
    color:"from-pink-500/20 to-pink-600/5", border:"border-pink-500/30", text:"text-pink-400",
  },
  {
    id:"ludo", title:"Ludo Board", emoji:"🎲", status:"live", tag:"2-4P",
    desc:"Classic board game · Full rules · Play vs AI or friends",
    players:12, prize:"₦50K tournament", href:"/games/ludo",
    color:"from-green-500/20 to-green-600/5", border:"border-green-500/30", text:"text-green-400",
  },
  {
    id:"poll", title:"Poll League", emoji:"📊", status:"live", tag:"Community",
    desc:"Vote on weekly community debates · Climb the board",
    players:312, prize:"₦10K pool", href:"/games/poll",
    color:"from-purple-500/20 to-purple-600/5", border:"border-purple-500/30", text:"text-purple-400",
  },
];

/* ── EXTERNAL GAMES (console/mobile — play outside, tracked here) */
const EXTERNAL_GAMES = [
  // Mobile
  {
    id:"efootball", title:"eFootball 2025", emoji:"⚽", platform:"Mobile",
    platformIcon:"📱", tag:"Football",
    desc:"Submit your weekly match results to the CC Hub leaderboard",
    link:"https://apps.apple.com/app/efootball/id1436065271",
    playLabel:"Get on App Store",
    trackable:true, players:67,
    color:"from-blue-600/15", border:"border-blue-600/25", text:"text-blue-400",
  },
  {
    id:"mobile-legends", title:"Mobile Legends", emoji:"⚔️", platform:"Mobile",
    platformIcon:"📱", tag:"MOBA",
    desc:"Share your rank & stats to compete on the community board",
    link:"https://play.google.com/store/apps/details?id=com.mobile.legends",
    playLabel:"Get on Play Store",
    trackable:true, players:43,
    color:"from-red-600/15", border:"border-red-600/25", text:"text-red-400",
  },
  {
    id:"clash-royale", title:"Clash Royale", emoji:"🏰", platform:"Mobile",
    platformIcon:"📱", tag:"Strategy",
    desc:"Weekly CC Hub clan wars — share your trophy count to rank",
    link:"https://apps.apple.com/app/clash-royale/id1053012308",
    playLabel:"Get the App",
    trackable:true, players:28,
    color:"from-yellow-600/15", border:"border-yellow-600/25", text:"text-yellow-400",
  },
  // Console
  {
    id:"fc25", title:"EA FC 25", emoji:"🥅", platform:"Console",
    platformIcon:"🎮", tag:"Football",
    desc:"CC Hub FIFA tournament — submit scores in the community",
    link:"https://www.ea.com/games/ea-sports-fc",
    playLabel:"Get EA FC 25",
    trackable:true, players:55,
    color:"from-green-600/15", border:"border-green-600/25", text:"text-green-400",
  },
  {
    id:"nba2k25", title:"NBA 2K25", emoji:"🏀", platform:"Console",
    platformIcon:"🎮", tag:"Basketball",
    desc:"2K tournaments — share your MyTeam record on the board",
    link:"https://nba.2k.com/",
    playLabel:"Get NBA 2K25",
    trackable:true, players:39,
    color:"from-orange-600/15", border:"border-orange-600/25", text:"text-orange-400",
  },
  {
    id:"warzone", title:"Call of Duty: Warzone", emoji:"🔫", platform:"Console/PC",
    platformIcon:"🎮", tag:"FPS",
    desc:"CC Hub squad — drop your K/D and placement to compete",
    link:"https://www.callofduty.com/warzone",
    playLabel:"Get Warzone",
    trackable:true, players:31,
    color:"from-zinc-500/15", border:"border-zinc-500/25", text:"text-zinc-400",
  },
  {
    id:"mortal-kombat", title:"Mortal Kombat 1", emoji:"🥊", platform:"Console",
    platformIcon:"🎮", tag:"Fighting",
    desc:"1v1 bracket — challenge community members on X",
    link:"https://www.mortalkombat.com/",
    playLabel:"Get MK1",
    trackable:true, players:18,
    color:"from-red-700/15", border:"border-red-700/25", text:"text-red-500",
  },
];

/* ── Leaderboard (mock) ──────────────────────────────────────── */
const LEADERBOARD = [
  { rank:1, username:"@connectplug", name:"ConnectPlug", points:12400, wins:18, avatar:"CP", badge:"👑" },
  { rank:2, username:"@13fxiii",     name:"FX〽️",       points:11800, wins:15, avatar:"FX", badge:"⭐" },
  { rank:3, username:"@naijagamer",  name:"NaijaGamer",  points:9200,  wins:12, avatar:"NG", badge:"🔥" },
  { rank:4, username:"@theconnector",name:"Connector",   points:7600,  wins:9,  avatar:"TC", badge:"" },
  { rank:5, username:"@thrillseeka", name:"ThrillSeeka", points:6100,  wins:7,  avatar:"TS", badge:"" },
];

export default function GamesPage() {
  const [tab, setTab]       = useState<"browser"|"external"|"leaderboard">("browser");
  const [platform, setPlatform] = useState<"All"|"Mobile"|"Console"|"Console/PC">("All");

  const filteredExternal = platform === "All"
    ? EXTERNAL_GAMES
    : EXTERNAL_GAMES.filter(g => g.platform === platform || g.platform === platform);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Gamepad2 size={20} className="text-yellow-400" /> CC Hub Games
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">Play in-app · Track console & mobile · Compete for prizes</p>
          </div>
          <Link href="/games/tournament"
            className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-yellow-400/20 transition-colors">
            <Trophy size={13}/> Tournaments
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label:"In-App Games",    value:BROWSER_GAMES.length.toString(), icon:Play,    color:"text-green-400" },
            { label:"Trackable Games", value:EXTERNAL_GAMES.length.toString(),icon:Gamepad2,color:"text-blue-400" },
            { label:"Prize Pool",      value:"₦85K",                          icon:Trophy,  color:"text-yellow-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <div className={`font-black text-lg ${color}`}>{value}</div>
              <div className="text-zinc-600 text-[10px]">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
          {[
            { id:"browser",     label:"🎮 Play In-App",      count:BROWSER_GAMES.length },
            { id:"external",    label:"🕹️ Console & Mobile",  count:EXTERNAL_GAMES.length },
            { id:"leaderboard", label:"🏆 Leaderboard",       count:null },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                tab === t.id ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"
              }`}>
              {t.label}
              {t.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-500"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── IN-APP BROWSER GAMES ──────────────── */}
        {tab === "browser" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4 bg-green-400/5 border border-green-400/20 rounded-xl px-4 py-2.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-green-400 text-xs font-semibold">These games run fully in your browser — no download needed</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {BROWSER_GAMES.map(game => (
                <Link key={game.id} href={game.href}
                  className={`group block bg-gradient-to-br ${game.color} border ${game.border} rounded-2xl p-4 hover:shadow-xl transition-all hover:scale-[1.01]`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{game.emoji}</span>
                      <div>
                        <h3 className="text-white font-black text-sm leading-tight">{game.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 ${game.text}`}>{game.tag}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors`}>
                      <Play size={14} className={game.text} fill="currentColor" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mb-3 leading-relaxed">{game.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
                      <Users size={11}/> {game.players} playing
                    </div>
                    <span className={`text-[11px] font-bold ${game.text}`}>{game.prize}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── EXTERNAL TRACKABLE GAMES ─────────── */}
        {tab === "external" && (
          <div className="space-y-4">
            {/* Explanation banner */}
            <div className="bg-blue-400/5 border border-blue-400/20 rounded-xl px-4 py-3">
              <p className="text-blue-400 text-xs font-semibold mb-1">🕹️ Console & Mobile Games — Play Outside, Track Here</p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Download these on your console or phone. After matches, submit your scores to the CC Hub leaderboard via the X Community.
                Weekly rankings get posted and top players win prizes.
              </p>
            </div>

            {/* Submit score link */}
            <a href="https://x.com/i/communities/1897164314764579242" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl hover:bg-yellow-400/15 transition-colors">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400"/>
                <div>
                  <p className="text-yellow-400 font-black text-xs">Submit Your Score</p>
                  <p className="text-zinc-500 text-[11px]">Post results in the community with #CCHubGames</p>
                </div>
              </div>
              <ExternalLink size={13} className="text-yellow-400"/>
            </a>

            {/* Platform filter */}
            <div className="flex gap-1.5">
              {["All","Mobile","Console"].map(p => (
                <button key={p} onClick={() => setPlatform(p as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    platform === p ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                  }`}>{p}</button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {filteredExternal.map(game => (
                <div key={game.id}
                  className={`bg-gradient-to-br ${game.color} border ${game.border} rounded-2xl p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{game.emoji}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-white font-black text-sm">{game.title}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-500">{game.platformIcon} {game.platform}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 ${game.text}`}>{game.tag}</span>
                        </div>
                      </div>
                    </div>
                    {game.trackable && (
                      <span className="flex-shrink-0 text-[9px] font-black bg-green-400/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-400/20">
                        TRACKED
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-400 text-xs mb-3 leading-relaxed">{game.desc}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                      <Users size={10}/> {game.players} cc members play
                    </span>
                    <a href={game.link} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${game.text} ${game.border} bg-white/5 hover:bg-white/10`}>
                      {game.playLabel} <ExternalLink size={10}/>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* How tracking works */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-400"/> How Score Tracking Works
              </h3>
              <div className="space-y-2.5">
                {[
                  { step:"1", label:"Play your game",              desc:"Console, PC, or mobile — play normally" },
                  { step:"2", label:"Screenshot your result",      desc:"Take a screenshot of your score/rank after the match" },
                  { step:"3", label:"Post in CC Hub Community",    desc:"Share on X with #CCHubGames + your score" },
                  { step:"4", label:"Get ranked on leaderboard",   desc:"@TheCruiseCH tracks weekly scores and posts rankings every Sunday" },
                ].map(({ step, label, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-yellow-400 text-black text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <div>
                      <p className="text-white text-xs font-bold">{label}</p>
                      <p className="text-zinc-500 text-[11px]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ──────────────────────── */}
        {tab === "leaderboard" && (
          <div className="space-y-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-white font-black text-sm">All-Time Rankings</span>
                <span className="ml-auto text-zinc-600 text-[11px]">Updated weekly</span>
              </div>
              {LEADERBOARD.map((p, i) => (
                <div key={p.rank} className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 ${i < 3 ? "bg-yellow-400/3" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    p.rank === 1 ? "bg-yellow-400 text-black" :
                    p.rank === 2 ? "bg-zinc-400 text-black" :
                    p.rank === 3 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}>{p.rank}</div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      {p.badge && <span>{p.badge}</span>}
                    </div>
                    <p className="text-zinc-500 text-xs">{p.username}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-yellow-400 font-black text-sm">{p.points.toLocaleString()}</p>
                    <p className="text-zinc-600 text-[11px]">{p.wins} wins</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/leaderboard"
              className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 text-xs font-bold hover:text-white hover:border-zinc-600 transition-colors">
              View Full Leaderboard <ArrowRight size={13}/>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
