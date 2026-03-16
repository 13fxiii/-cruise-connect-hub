"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { BarChart3, TrendingUp, Users, Heart, DollarSign, Zap, Star, Share2, MessageCircle, Trophy } from "lucide-react";

const RANGES = [{ label:"7d", value:"7" }, { label:"30d", value:"30" }, { label:"90d", value:"90" }];

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-current" />
        </div>
      </div>
      <div className="text-white font-black text-2xl">{value}</div>
      <div className="text-zinc-400 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-zinc-600 text-[10px] mt-0.5">{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const formatNaira = (kobo: number) => `₦${((kobo || 0) / 100).toLocaleString()}`;

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange]       = useState("30");
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, range]);

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BarChart3 className="w-12 h-12 text-zinc-700" />
        <p className="text-zinc-400">Sign in to view your analytics</p>
        <Link href="/auth/login" className="bg-yellow-400 text-black font-black px-6 py-2.5 rounded-full">Sign In</Link>
      </div>
    </div>
  );

  const a = data?.analytics || {};
  const breakdown = data?.earningsBreakdown || {};
  const totalEarned = data?.totalEarned || 0;
  const snapshots = data?.snapshots || [];
  const topPosts = data?.topPosts || [];
  const profile = data?.profile || {};

  // Build a simple bar chart from snapshots
  const maxPoints = Math.max(...snapshots.map((s: any) => s.points || 0), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-yellow-400" /> Creator Analytics
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Track your growth, earnings, and community impact</p>
          </div>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r.value ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={DollarSign}    label="Total Earned"     value={formatNaira(totalEarned)}         sub={`Last ${range} days`}  color="bg-yellow-400/20 text-yellow-400" />
              <StatCard icon={Heart}         label="Total Likes"      value={(a.total_likes||0).toLocaleString()} sub="across all posts"    color="bg-pink-500/20 text-pink-400" />
              <StatCard icon={Users}         label="Referrals"        value={a.referrals_count||0}              sub="members referred"       color="bg-blue-500/20 text-blue-400" />
              <StatCard icon={Zap}           label="Points"           value={(profile.points||0).toLocaleString()} sub={`Level: ${profile.level||"newcomer"}`} color="bg-green-500/20 text-green-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={MessageCircle} label="Comments"         value={a.total_comments||0}              sub="received"               color="bg-purple-500/20 text-purple-400" />
              <StatCard icon={Share2}        label="Spaces Hosted"    value={a.spaces_hosted||0}               sub="live sessions"           color="bg-red-500/20 text-red-400" />
              <StatCard icon={Trophy}        label="Games Played"     value={a.games_played||0}                sub="tournaments entered"     color="bg-orange-500/20 text-orange-400" />
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-white font-black text-base mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" /> Earnings Breakdown
              </h2>
              {Object.keys(breakdown).length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-sm">No earnings yet in this period</p>
                  <p className="text-zinc-700 text-xs mt-1">Go live, enter tournaments, or refer members to start earning</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(breakdown).map(([type, amount]: [string, any]) => {
                    const pct = totalEarned > 0 ? Math.round((amount / totalEarned) * 100) : 0;
                    const colors: Record<string, string> = { gifts:"bg-pink-500", tournaments:"bg-blue-500", referrals:"bg-green-500", marketplace:"bg-yellow-400", other:"bg-zinc-500" };
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-300 text-sm capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-xs">{pct}%</span>
                            <span className="text-white font-black text-sm">{formatNaira(amount)}</span>
                          </div>
                        </div>
                        <MiniBar value={amount} max={totalEarned} color={colors[type] || "bg-zinc-500"} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Activity Chart — snapshot bars */}
            {snapshots.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <h2 className="text-white font-black text-base mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" /> Points Growth
                </h2>
                <div className="flex items-end gap-1 h-24">
                  {snapshots.slice(-30).map((s: any, i: number) => {
                    const h = maxPoints > 0 ? Math.max(((s.points || 0) / maxPoints) * 100, 4) : 4;
                    return (
                      <div key={i} title={`${s.snapshot_date}: ${s.points} pts`}
                        className="flex-1 bg-yellow-400/60 rounded-sm hover:bg-yellow-400 transition-colors cursor-help"
                        style={{ height: `${h}%` }} />
                    );
                  })}
                </div>
                <div className="flex justify-between text-zinc-600 text-[10px] mt-1">
                  <span>{snapshots[0]?.snapshot_date}</span>
                  <span>{snapshots[snapshots.length - 1]?.snapshot_date}</span>
                </div>
              </div>
            )}

            {/* Top Posts */}
            {topPosts.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <h2 className="text-white font-black text-base mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Top Posts
                </h2>
                <div className="space-y-2">
                  {topPosts.map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-zinc-900 last:border-0">
                      <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-black">{i+1}</div>
                      <div className="flex-1">
                        <div className="text-zinc-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" />{p.likes_count||0}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" />{p.comments_count||0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/earn" className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 hover:border-yellow-400/40 transition-all">
                <DollarSign className="w-5 h-5 text-yellow-400 mb-2" />
                <div className="text-white font-black text-sm">Boost Earnings</div>
                <div className="text-zinc-500 text-xs mt-0.5">Go live, refer, play tournaments</div>
              </Link>
              <Link href="/spaces" className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 hover:border-red-500/40 transition-all">
                <Zap className="w-5 h-5 text-red-400 mb-2" />
                <div className="text-white font-black text-sm">Host a Space</div>
                <div className="text-zinc-500 text-xs mt-0.5">Earn gifts from your audience</div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
