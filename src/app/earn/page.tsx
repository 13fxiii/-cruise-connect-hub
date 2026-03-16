"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import {
  Gift, Users, Trophy, ShoppingBag, Wallet, Copy, Check,
  TrendingUp, ChevronRight, Zap, Star, ArrowUpRight, Flame, Calendar, CheckCircle
} from "lucide-react";

const EARN_STREAMS = [
  {
    id: "gifts",
    icon: "🎁",
    title: "Live Gifts",
    description: "Earn when fans send you digital gifts during live spaces",
    how: "Host or join a Space, perform, and your fans send gifts",
    cta: "Go Live",
    ctaHref: "/spaces",
    color: "from-pink-500/20 to-rose-500/10",
    border: "border-pink-500/20",
    badge: "POPULAR",
  },
  {
    id: "referrals",
    icon: "🔗",
    title: "Referral Commission",
    description: "Earn commission when you refer artists, brands, vendors, or new members",
    how: "Share your referral link — earn % of what they spend on CC Hub",
    cta: "Get Ref Link",
    ctaHref: null,
    color: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/20",
    badge: "PASSIVE",
  },
  {
    id: "tournaments",
    icon: "🏆",
    title: "Tournament Prizes",
    description: "Win real Naira in community game tournaments",
    how: "Enter a tournament, beat other players, win the prize pool",
    cta: "Enter Tournament",
    ctaHref: "/games/tournament",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    badge: "SKILL",
  },
  {
    id: "merch",
    icon: "👕",
    title: "Merch Sales",
    description: "Design and sell your own CC Hub branded merchandise",
    how: "Create a design, list it in the shop, earn from every order",
    cta: "Design Merch",
    ctaHref: "/merch",
    color: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/20",
    badge: "CREATIVE",
  },
];

const GIFT_TYPES = [
  { emoji:"👏", name:"Clap", value:"₦100" },
  { emoji:"🔥", name:"Fire", value:"₦500" },
  { emoji:"👑", name:"Crown", value:"₦1,000" },
  { emoji:"🚌", name:"Bus", value:"₦2,000" },
  { emoji:"💎", name:"Diamond", value:"₦5,000" },
  { emoji:"💰", name:"Money Bag", value:"₦10,000" },
];

export default function EarnPage() {
  const [user, setUser]           = useState<any>(null);
  const [profile, setProfile]     = useState<any>(null);
  const [earnings, setEarnings]   = useState<any>(null);
  const [txns, setTxns]           = useState<any[]>([]);
  const [copied, setCopied]       = useState(false);
  const [activeStream, setActiveStream] = useState<string|null>(null);
  const supabase                  = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);

      // Get earnings summary
      const { data: e } = await supabase.from("member_earnings").select("*").eq("id", user.id).single();
      setEarnings(e);

      // Get recent wallet transactions
      const { data: t } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setTxns(t || []);
    };
    init();
  }, []);

  const copyRefLink = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(`https://cruise-connect-hub.vercel.app?ref=${profile.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatNaira = (kobo: number) => `₦${((kobo || 0) / 100).toLocaleString()}`;

  const txnIcon = (type: string) => {
    if (type?.includes("gift")) return "🎁";
    if (type?.includes("tournament")) return "🏆";
    if (type?.includes("referral")) return "🔗";
    if (type?.includes("merch")) return "👕";
    if (type?.includes("withdraw")) return "💸";
    if (type?.includes("deposit")) return "💰";
    return "💳";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" /> Earn
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Turn your community involvement into real income</p>
        </div>

        {/* Wallet Summary */}
        <div className="bg-gradient-to-br from-yellow-400/15 via-zinc-900 to-zinc-950 border border-yellow-400/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-zinc-400 text-xs font-bold tracking-widest">YOUR WALLET</div>
              <div className="text-3xl font-black text-white mt-1">
                {formatNaira(profile?.wallet_balance || 0)}
              </div>
              <div className="text-zinc-500 text-xs mt-0.5">Available balance</div>
            </div>
            <div className="w-14 h-14 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label:"Gifts", value: formatNaira(earnings?.total_gifts_received), icon:"🎁" },
              { label:"Referrals", value: formatNaira(earnings?.total_referral_commission), icon:"🔗" },
              { label:"Tournaments", value: formatNaira(earnings?.total_tournament_wins), icon:"🏆" },
            ].map(s => (
              <div key={s.label} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-white font-black text-sm">{s.value}</div>
                <div className="text-zinc-500 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href="/wallet"
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
              <Wallet className="w-4 h-4" /> Wallet & Withdraw
            </Link>
            <Link href="/wallet/deposit"
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-zinc-700 transition-colors">
              + Fund Wallet
            </Link>
          </div>
        </div>

        {/* Earn Streams */}
        <div>
          <h2 className="text-white font-black text-lg mb-3">How to Earn 💰</h2>
          <div className="space-y-3">
            {EARN_STREAMS.map(stream => (
              <div key={stream.id}>
                <button
                  onClick={() => setActiveStream(activeStream === stream.id ? null : stream.id)}
                  className={`w-full bg-gradient-to-r ${stream.color} border ${stream.border} rounded-2xl p-4 text-left transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{stream.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-black text-base">{stream.title}</div>
                        <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest">{stream.badge}</span>
                      </div>
                      <div className="text-zinc-400 text-xs mt-0.5">{stream.description}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${activeStream === stream.id ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {activeStream === stream.id && (
                  <div className="bg-zinc-950 border border-zinc-800 border-t-0 rounded-b-2xl px-4 pb-4 pt-3 -mt-1 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-400 text-xs font-black">?</span>
                      </div>
                      <p className="text-zinc-300 text-sm">{stream.how}</p>
                    </div>

                    {/* Referral specific — show link */}
                    {stream.id === "referrals" && (
                      <div className="space-y-2">
                        <div className="text-zinc-400 text-xs font-bold">YOUR REFERRAL LINK</div>
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2">
                          <span className="text-zinc-300 text-xs flex-1 truncate">
                            cruise-connect-hub.vercel.app?ref={profile?.referral_code || "..."}
                          </span>
                          <button onClick={copyRefLink}
                            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${copied ? "text-green-400" : "text-yellow-400"}`}>
                            {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                        </div>
                        <div className="text-zinc-500 text-xs">
                          Earn <span className="text-yellow-400 font-bold">5% commission</span> on any paid actions your referrals make
                        </div>
                      </div>
                    )}

                    {/* Gifts specific — show gift types */}
                    {stream.id === "gifts" && (
                      <div>
                        <div className="text-zinc-400 text-xs font-bold mb-2">AVAILABLE GIFTS</div>
                        <div className="grid grid-cols-3 gap-2">
                          {GIFT_TYPES.map(g => (
                            <div key={g.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-center">
                              <div className="text-2xl mb-0.5">{g.emoji}</div>
                              <div className="text-white font-bold text-xs">{g.name}</div>
                              <div className="text-yellow-400 font-black text-xs">{g.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-zinc-500 text-xs mt-2">
                          Platform takes <span className="text-zinc-300 font-bold">10%</span> fee — you keep 90%
                        </div>
                      </div>
                    )}

                    {stream.cta && stream.ctaHref && (
                      <Link href={stream.ctaHref}
                        className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
                        {stream.cta} <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-base">Recent Activity</h2>
            <Link href="/wallet" className="text-yellow-400 text-xs font-bold hover:underline">See all →</Link>
          </div>
          {txns.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">💸</div>
              <p className="text-zinc-600 text-sm">No transactions yet</p>
              <p className="text-zinc-700 text-xs mt-1">Start earning by going live or entering a tournament</p>
            </div>
          ) : (
            <div className="space-y-2">
              {txns.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-zinc-900 last:border-0">
                  <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                    {txnIcon(t.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">{t.description || t.type}</div>
                    <div className="text-zinc-500 text-xs">{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className={`font-black text-sm ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {t.amount > 0 ? "+" : ""}{formatNaira(Math.abs(t.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-white font-black text-xl">{profile?.points || 0}</div>
            <div className="text-zinc-500 text-xs">Community Points</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-white font-black text-xl capitalize">{profile?.level || "Newcomer"}</div>
            <div className="text-zinc-500 text-xs">Current Level</div>
          </div>
        </div>

      </main>
    </div>
  );
}
