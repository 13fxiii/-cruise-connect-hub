"use client";
import { useState } from "react";
import { Gamepad2, Trophy, Users, Clock, Star, Crown, Zap, Target } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const GAMES = [
  { id: "1", title: "Trivia Tuesday 🧠", type: "trivia", status: "active", entry_fee: 500, prize_pool: 25000, max_players: 50, player_count: 38, starts_at: "Tonight 9PM", description: "General knowledge + Naija trivia. Win big!" },
  { id: "2", title: "Truth or Dare 🔥", type: "truth_dare", status: "active", entry_fee: 0, prize_pool: 0, max_players: 20, player_count: 12, starts_at: "Now", description: "Community game — spicy edition. 18+ only." },
  { id: "3", title: "Ludo Tournament", type: "tournament", status: "upcoming", entry_fee: 1000, prize_pool: 50000, max_players: 32, player_count: 19, starts_at: "Friday 8PM", description: "Bracket-style Ludo tournament. Champion takes all." },
  { id: "4", title: "Community Poll League", type: "polls", status: "active", entry_fee: 0, prize_pool: 10000, max_players: 999, player_count: 234, starts_at: "Ongoing", description: "Vote on weekly themes, earn points, climb the board." },
  { id: "5", title: "Kahoot Night ⚡", type: "trivia", status: "upcoming", entry_fee: 200, prize_pool: 8000, max_players: 100, player_count: 44, starts_at: "Wed 9PM", description: "Fast-paced quiz night with the community." },
];

const LEADERBOARD = [
  { rank: 1, username: "@connectplug", display_name: "ConnectPlug", points: 12400, wins: 18, avatar: "CP" },
  { rank: 2, username: "@13fxiii", display_name: "FX〽️", points: 11800, wins: 15, avatar: "FX" },
  { rank: 3, username: "@naijagamer", display_name: "NaijaGamer", points: 9200, wins: 12, avatar: "NG" },
  { rank: 4, username: "@theconnector", display_name: "The Connector", points: 7600, wins: 9, avatar: "TC" },
  { rank: 5, username: "@thrillseeka", display_name: "ThrillSeeka", points: 6100, wins: 7, avatar: "TS" },
  { rank: 6, username: "@afroboss", display_name: "AfroBoss", points: 4800, wins: 5, avatar: "AB" },
  { rank: 7, username: "@lagosking", display_name: "LagosKing", points: 3200, wins: 4, avatar: "LK" },
];

const TYPE_ICONS: Record<string, string> = {
  trivia: "🧠", truth_dare: "🔥", tournament: "🏆", polls: "📊", ludo: "🎲"
};

export default function GamesPage() {
  const [tab, setTab] = useState<"games"|"leaderboard">("games");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Gamepad2 className="text-yellow-400 w-8 h-8" /> Games Hub
            </h1>
            <p className="text-zinc-400 mt-1">Play, compete & earn — real Naira prizes</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-yellow-400">₦93,000</div>
            <div className="text-xs text-zinc-500">Total prizes this week</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["games","leaderboard"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {t === "games" ? "🎮 Games" : "🏆 Leaderboard"}
            </button>
          ))}
        </div>

        {tab === "games" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {tab === "leaderboard" && (
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-white">March 2026 Leaderboard</span>
                <span className="ml-auto text-xs text-zinc-500">Resets in 28 days</span>
              </div>

              {LEADERBOARD.map((entry, i) => (
                <div key={entry.rank} className={`flex items-center gap-4 px-5 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${i === 0 ? "bg-yellow-400/5" : ""}`}>
                  <div className={`w-8 text-center font-black text-lg ${
                    entry.rank === 1 ? "text-yellow-400" :
                    entry.rank === 2 ? "text-zinc-300" :
                    entry.rank === 3 ? "text-amber-600" : "text-zinc-500"
                  }`}>
                    {entry.rank <= 3 ? ["👑","⭐","🥉"][entry.rank-1] : entry.rank}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
                    {entry.avatar}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{entry.display_name}</div>
                    <div className="text-xs text-zinc-400">{entry.username}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-yellow-400">{entry.points.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">{entry.wins} wins</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-zinc-900 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                ?
              </div>
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Your rank this month</div>
                <div className="font-bold text-white">Sign in to see your position</div>
              </div>
              <a href="/auth/login" className="bg-yellow-400 text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">
                Sign In
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function GameCard({ game }: { game: typeof GAMES[0] }) {
  const isActive = game.status === "active";
  const pct = Math.round((game.player_count / game.max_players) * 100);

  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 hover:border-yellow-500/40 transition-all ${
      isActive ? "border-yellow-500/30" : "border-zinc-800"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{TYPE_ICONS[game.type] || "🎮"}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          isActive ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400"
        }`}>
          {isActive ? "● ACTIVE" : "UPCOMING"}
        </span>
      </div>

      <h3 className="font-bold text-white mb-1">{game.title}</h3>
      <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{game.description}</p>

      {/* Players bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>{game.player_count} players</span>
          <span>{game.max_players} max</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {game.entry_fee > 0 ? (
            <span className="text-xs text-zinc-400">Entry: <span className="text-yellow-400 font-bold">₦{game.entry_fee.toLocaleString()}</span></span>
          ) : (
            <span className="text-xs text-green-400 font-bold">FREE</span>
          )}
          {game.prize_pool > 0 && (
            <div className="text-xs text-zinc-500">Prize: <span className="text-yellow-400">₦{game.prize_pool.toLocaleString()}</span></div>
          )}
        </div>
        <button className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
          isActive
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        }`}>
          {isActive ? "Join Now" : `${game.starts_at}`}
        </button>
      </div>
    </div>
  );
}
