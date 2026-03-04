"use client";
import { useState, useEffect } from "react";
import { Trophy, Star, Zap, Gamepad2, BarChart2, Crown, Medal, Award, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

type LeaderboardEntry = {
  rank: number;
  username: string;
  display_name: string;
  points: number;
  avatar_url?: string;
  wins?: number;
};

const MOCK_LB: LeaderboardEntry[] = [
  { rank: 1, username: "@connectplug",  display_name: "ConnectPlug",    points: 12400, wins: 18 },
  { rank: 2, username: "@13fxiii",      display_name: "FX〽️",          points: 11800, wins: 15 },
  { rank: 3, username: "@naijagamer",   display_name: "NaijaGamer",     points: 9200,  wins: 12 },
  { rank: 4, username: "@theconnector", display_name: "The Connector",  points: 7600,  wins: 9  },
  { rank: 5, username: "@thrillseeka",  display_name: "ThrillSeeka",    points: 6100,  wins: 7  },
  { rank: 6, username: "@afroboss",     display_name: "AfroBoss",       points: 4800,  wins: 5  },
  { rank: 7, username: "@lagosking",    display_name: "LagosKing",      points: 3200,  wins: 4  },
  { rank: 8, username: "@naijawave",    display_name: "NaijaWave",      points: 2900,  wins: 3  },
  { rank: 9, username: "@cruisecrew",   display_name: "CruiseCrew",     points: 2200,  wins: 2  },
  { rank: 10, username: "@musicvibes", display_name: "MusicVibes",     points: 1800,  wins: 2  },
];

const RANK_STYLES: Record<number, { bg: string; border: string; icon: React.ReactNode; badge: string }> = {
  1: { bg: "from-yellow-500/20 to-yellow-600/5",   border: "border-yellow-400",   icon: <Crown className="w-5 h-5 text-yellow-400" />, badge: "🥇" },
  2: { bg: "from-zinc-400/10 to-zinc-500/5",       border: "border-zinc-400",     icon: <Medal className="w-5 h-5 text-zinc-300" />,  badge: "🥈" },
  3: { bg: "from-orange-600/10 to-orange-700/5",   border: "border-orange-600",   icon: <Award className="w-5 h-5 text-orange-500" />, badge: "🥉" },
};

function Avatar({ entry, size = "md" }: { entry: LeaderboardEntry; size?: "sm"|"md"|"lg" }) {
  const sz = size === "lg" ? "w-16 h-16 text-xl" : size === "md" ? "w-10 h-10 text-base" : "w-8 h-8 text-xs";
  const initials = entry.display_name.slice(0,2).toUpperCase();
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/10 border border-zinc-700 flex items-center justify-center font-black text-yellow-400 flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"monthly" | "alltime" | "weekly">("monthly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LB);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.leaderboard?.length > 0) {
        setLeaderboard(data.leaderboard);
      }
    } catch { /* use mock */ }
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-bold mb-4">
            <Trophy className="w-4 h-4" /> {monthName} Leaderboard
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Community Champions</h1>
          <p className="text-zinc-400 text-sm">Earn points from games, polls, and activity. Top 3 win prizes.</p>
          <p className="text-zinc-500 text-xs mt-1">{daysLeft} days left in this month · Resets on {new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString()}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit mx-auto">
          {(["weekly", "monthly", "alltime"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
              {t === "weekly" ? "This Week" : t === "monthly" ? "This Month" : "All Time"}
            </button>
          ))}
        </div>

        {/* Prizes Banner */}
        <div className="bg-gradient-to-r from-yellow-400/15 via-yellow-500/5 to-transparent border border-yellow-400/25 rounded-2xl p-4 mb-6">
          <div className="text-xs font-bold text-yellow-400 mb-2">🏆 {monthName} PRIZES</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl">🥇</div>
              <div className="font-black text-white text-sm">1st Place</div>
              <div className="text-yellow-400 font-bold text-xs">₦25,000</div>
            </div>
            <div>
              <div className="text-2xl">🥈</div>
              <div className="font-black text-white text-sm">2nd Place</div>
              <div className="text-zinc-300 font-bold text-xs">₦10,000</div>
            </div>
            <div>
              <div className="text-2xl">🥉</div>
              <div className="font-black text-white text-sm">3rd Place</div>
              <div className="text-orange-400 font-bold text-xs">₦5,000</div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
            if (!entry) return <div key={podiumIdx} />;
            const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ["h-28", "h-36", "h-24"];
            const style = RANK_STYLES[actualRank] || {};
            return (
              <div key={entry.rank}
                className={`flex flex-col items-center justify-end bg-gradient-to-b ${style.bg} border ${style.border} rounded-2xl p-3 ${heights[podiumIdx]} relative`}>
                <div className="absolute -top-4 text-2xl">{style.badge}</div>
                <Avatar entry={entry} size="md" />
                <div className="font-black text-white text-xs mt-2 text-center truncate w-full">{entry.display_name}</div>
                <div className="text-yellow-400 font-bold text-xs">{entry.points.toLocaleString()} pts</div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500 font-medium">RANK · MEMBER · POINTS</span>
            <button onClick={fetchLeaderboard} disabled={loading}
              className="text-xs text-zinc-500 hover:text-yellow-400 transition-colors flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {leaderboard.map((entry, i) => {
            const style = RANK_STYLES[entry.rank];
            return (
              <div key={entry.username}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${style ? `bg-gradient-to-r ${style.bg} ${style.border}` : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}`}>

                {/* Rank */}
                <div className="w-7 flex-shrink-0 text-center">
                  {style ? style.icon : <span className="text-sm font-bold text-zinc-500">#{entry.rank}</span>}
                </div>

                {/* Avatar */}
                <Avatar entry={entry} size="sm" />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{entry.display_name}</div>
                  <div className="text-xs text-zinc-500 truncate">{entry.username}</div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <div className={`font-black text-sm ${style ? "text-yellow-400" : "text-white"}`}>
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500">points</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to earn */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-black text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> How to Earn Points</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <BarChart2 className="w-4 h-4" />, action: "Vote on a poll", pts: "+30–60 pts" },
              { icon: <Gamepad2 className="w-4 h-4" />, action: "Win a trivia game", pts: "+200 pts" },
              { icon: <Star className="w-4 h-4" />, action: "Win tournament", pts: "+500 pts" },
              { icon: <Zap className="w-4 h-4" />, action: "Daily login", pts: "+10 pts" },
              { icon: <Trophy className="w-4 h-4" />, action: "Refer a member", pts: "+100 pts" },
              { icon: <Star className="w-4 h-4" />, action: "Post goes viral", pts: "+50 pts" },
            ].map(({ icon, action, pts }) => (
              <div key={action} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                <span className="text-yellow-400">{icon}</span>
                <div>
                  <div className="text-xs text-zinc-300 font-medium">{action}</div>
                  <div className="text-xs text-yellow-400 font-bold">{pts}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last updated */}
        <p className="text-center text-xs text-zinc-600 mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </main>
    </div>
  );
}
