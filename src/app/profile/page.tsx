"use client";
import { useState, useEffect } from "react";
import { User, Edit3, Trophy, Wallet, Gamepad2, Star, Copy, CheckCheck, ExternalLink, Settings, Camera, Twitter, Medal, Award, Zap, TrendingUp, Gift, Music, Film } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const LEVELS = [
  { name: "Newcomer",     min: 0,    max: 99,   color: "text-zinc-400",  bg: "bg-zinc-400/10",  border: "border-zinc-600" },
  { name: "Cruiser",      min: 100,  max: 499,  color: "text-blue-400",  bg: "bg-blue-400/10",  border: "border-blue-600" },
  { name: "Connector",    min: 500,  max: 999,  color: "text-green-400", bg: "bg-green-400/10", border: "border-green-600" },
  { name: "Hub Star",     min: 1000, max: 2499, color: "text-yellow-400",bg: "bg-yellow-400/10",border: "border-yellow-600" },
  { name: "Culture King", min: 2500, max: 4999, color: "text-orange-400",bg: "bg-orange-400/10",border: "border-orange-600" },
  { name: "Legend",       min: 5000, max: 99999,color: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-600" },
];

const BADGES = [
  { id: "music", label: "Music Head", icon: "🎵" },
  { id: "gamer", label: "Gamer", icon: "🎮" },
  { id: "host", label: "Space Host", icon: "🎙️" },
  { id: "winner", label: "Winner", icon: "🏆" },
  { id: "top_fan", label: "Top Fan", icon: "⭐" },
  { id: "og", label: "OG Member", icon: "👑" },
  { id: "naija", label: "Naija Rep", icon: "🇳🇬" },
  { id: "movies", label: "Movie Buff", icon: "🎬" },
  { id: "earner", label: "Earner", icon: "💰" },
  { id: "early", label: "Early Adopter", icon: "🚀" },
  { id: "connector", label: "Connector", icon: "🤝" },
  { id: "promoter", label: "Promoter", icon: "📢" },
];

const MOCK_PROFILE = {
  id: "1", username: "@13fxiii", display_name: "FX〽️",
  bio: "A&R | Creative Artist | Building Cruise Connect Hub 🚌💛",
  twitter_handle: "@13fxiii", points: 11800, level: "hub_star",
  wallet_balance: 750000, total_earned: 2840000, referral_code: "CCH-13FXIII",
  badges: ["music", "gamer", "host", "og", "naija", "early"],
  interests: ["music", "gaming", "tech", "afrobeats"],
  created_at: "2024-03-01T00:00:00Z",
  stats: { spaces_hosted: 24, games_played: 67, tournaments_won: 3, posts: 142, referrals: 18 }
};

const MOCK_ACTIVITY = [
  { type: "tournament_win", label: "Won Trivia Showdown", meta: "+₦5,000 + 200pts", time: "2h ago", icon: "🏆" },
  { type: "space_host", label: "Hosted Afrobeats Space", meta: "48 listeners", time: "Yesterday", icon: "🎙️" },
  { type: "referral", label: "Referred @naijagamer", meta: "+₦1,000 bonus", time: "3d ago", icon: "🤝" },
  { type: "game", label: "Played Naija Wordle", meta: "Score: 850pts", time: "4d ago", icon: "🎮" },
  { type: "post", label: "Post went viral", meta: "🔥 1.2K impressions", time: "1w ago", icon: "📢" },
];

function getLevel(points: number) {
  return LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(kobo / 100);
}

export default function ProfilePage() {
  const [profile] = useState(MOCK_PROFILE);
  const [tab, setTab] = useState<"overview"|"activity"|"badges"|"settings">("overview");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: profile.display_name, bio: profile.bio, twitter_handle: profile.twitter_handle });

  const level = getLevel(profile.points);
  const nextLevel = LEVELS[LEVELS.findIndex(l => l.name === level.name) + 1];
  const progress = nextLevel
    ? Math.round(((profile.points - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  const copyRef = () => {
    navigator.clipboard.writeText(`https://cruise-connect-hub.netlify.app?ref=${profile.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Profile Header Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-yellow-400/20 via-yellow-400/10 to-zinc-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(234,179,8,0.15),transparent_60%)]" />
          </div>

          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex items-end justify-between mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center text-3xl font-black text-black shadow-xl">
                  {profile.display_name[0]}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors">
                  <Camera size={12} className="text-white" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-14">
                {profile.twitter_handle && (
                  <a href={`https://twitter.com/${profile.twitter_handle.replace('@','')}`} target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
                    <Twitter size={12} /> X Profile
                  </a>
                )}
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-xs text-yellow-400 hover:bg-yellow-400/20 transition-colors">
                  <Edit3 size={12} /> Edit Profile
                </button>
              </div>
            </div>

            {/* Name & Bio */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-white">{profile.display_name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${level.bg} ${level.color} border ${level.border}`}>
                  {level.name}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">{profile.username}</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-zinc-500">Level Progress</span>
                <span className="text-xs text-yellow-400 font-bold">{profile.points.toLocaleString()} pts {nextLevel && `→ ${nextLevel.min.toLocaleString()}`}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              {nextLevel && <p className="text-xs text-zinc-600 mt-1">{nextLevel.min - profile.points} points to {nextLevel.name}</p>}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { label: "Spaces", value: profile.stats.spaces_hosted, icon: "🎙️" },
                { label: "Games", value: profile.stats.games_played, icon: "🎮" },
                { label: "Wins", value: profile.stats.tournaments_won, icon: "🏆" },
                { label: "Posts", value: profile.stats.posts, icon: "📝" },
                { label: "Referrals", value: profile.stats.referrals, icon: "🤝" },
              ].map(s => (
                <div key={s.label} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <div className="text-lg mb-0.5">{s.icon}</div>
                  <div className="text-white font-black text-lg">{s.value}</div>
                  <div className="text-zinc-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6">
          {(["overview","activity","badges","settings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* Wallet Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Wallet size={18} className="text-yellow-400" /> Wallet</h3>
                <Link href="/wallet" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                  View All <ExternalLink size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Balance", value: formatNaira(profile.wallet_balance), color: "text-yellow-400" },
                  { label: "Total Earned", value: formatNaira(profile.total_earned), color: "text-green-400" },
                  { label: "Points", value: `${profile.points.toLocaleString()}`, color: "text-blue-400" },
                ].map(w => (
                  <div key={w.label} className="bg-zinc-800/50 rounded-xl p-4 text-center">
                    <div className={`text-lg font-black ${w.color}`}>{w.value}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{w.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Card */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/5 border border-yellow-400/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={18} className="text-yellow-400" />
                <h3 className="text-white font-bold">Referral Program</h3>
                <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold">₦1,000 per referral</span>
              </div>
              <p className="text-zinc-400 text-sm mb-3">Share your link. When they join and deposit, you both earn ₦1,000.</p>
              <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl p-3 border border-zinc-700">
                <code className="text-yellow-400 text-xs flex-1 truncate">
                  cruise-connect-hub.netlify.app?ref={profile.referral_code}
                </code>
                <button onClick={copyRef} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                  {copied ? <><CheckCheck size={14} className="text-green-400" /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-2">You've referred {profile.stats.referrals} members · Earned ₦{(profile.stats.referrals * 1000).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* TAB: ACTIVITY */}
        {tab === "activity" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{a.label}</p>
                  <p className="text-zinc-400 text-xs">{a.meta}</p>
                </div>
                <span className="text-zinc-600 text-xs flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB: BADGES */}
        {tab === "badges" && (
          <div>
            <p className="text-zinc-400 text-sm mb-4">Badges earned through participation & achievements in the community.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {BADGES.map(b => {
                const earned = profile.badges.includes(b.id);
                return (
                  <div key={b.id} className={`rounded-2xl p-4 text-center border transition-all ${earned
                    ? "bg-yellow-400/10 border-yellow-400/30"
                    : "bg-zinc-900 border-zinc-800 opacity-40"}`}>
                    <div className="text-3xl mb-2">{b.icon}</div>
                    <div className={`text-xs font-bold ${earned ? "text-yellow-400" : "text-zinc-500"}`}>{b.label}</div>
                    {earned && <div className="text-green-400 text-xs mt-1">✓ Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Settings size={16} className="text-zinc-400" /> Account Settings</h3>
              <div className="space-y-3">
                {[
                  { label: "Display Name", value: profile.display_name },
                  { label: "Username", value: profile.username },
                  { label: "X Handle", value: profile.twitter_handle },
                  { label: "Bio", value: profile.bio },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                    <div>
                      <p className="text-zinc-400 text-xs mb-0.5">{f.label}</p>
                      <p className="text-white text-sm">{f.value}</p>
                    </div>
                    <button className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors" onClick={() => setEditing(true)}>Edit</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Notifications</h3>
              {["Game invites", "Wallet credits", "Space alerts", "New followers"].map(n => (
                <div key={n} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                  <span className="text-zinc-300 text-sm">{n}</span>
                  <div className="w-10 h-5 bg-yellow-400 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-black rounded-full absolute right-0.5 top-0.5" />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors">
              Sign Out
            </button>
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-white font-black text-lg mb-5">Edit Profile</h2>
            <div className="space-y-3 mb-5">
              {[
                { key: "display_name", label: "Display Name", type: "text" },
                { key: "twitter_handle", label: "X Handle", type: "text" },
                { key: "bio", label: "Bio", type: "textarea" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-zinc-400 text-xs mb-1 block">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea rows={3}
                      value={(editForm as any)[f.key]}
                      onChange={e => setEditForm(p => ({...p, [f.key]: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400 resize-none"
                    />
                  ) : (
                    <input type="text"
                      value={(editForm as any)[f.key]}
                      onChange={e => setEditForm(p => ({...p, [f.key]: e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-black hover:bg-yellow-300 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
