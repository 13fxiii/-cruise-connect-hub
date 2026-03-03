import { User, Twitter, Star, Trophy, Zap, Settings, Grid, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function ProfilePage() {
  const MOCK_USER = {
    display_name: "FX〽️",
    username: "13fxiii",
    bio: "Social Media Marketer · A&R Scout · CRUISE & CONNECT HUB〽️ Founder · We dey cruise, we dey connect & grow 🚌🔥",
    twitter_handle: "13fxiii",
    avatar: "FX",
    points: 11800,
    wins: 15,
    followers: 15200,
    joined: "January 2024",
    role: "admin",
  };

  const RECENT_POSTS = [
    { id: "1", content: "The vibe in tonight's space was CRAZY 🔥 Thank you everybody that pulled up. We dey build together!", likes: 234, comments: 45, time: "2h ago" },
    { id: "2", content: "New update dropping soon for the hub. Games, Wallet, Spaces — all live. Stay locked 🚌〽️", likes: 189, comments: 38, time: "Yesterday" },
    { id: "3", content: "If you love discovering music before it blows, this is for you 👀🔥 @ThrillSeekaEnt is curating CRAZY sounds right now", likes: 312, comments: 67, time: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-yellow-400/20 via-yellow-400/10 to-transparent relative">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: "repeating-linear-gradient(45deg, #EAB308 0px, #EAB308 1px, transparent 1px, transparent 40px)"}} />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center text-black font-black text-2xl">
                {MOCK_USER.avatar}
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/${MOCK_USER.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-zinc-800 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" /> Follow on X
                </a>
                <Link href="/settings" className="bg-zinc-800 text-zinc-400 p-2 rounded-full hover:bg-zinc-700 transition-colors">
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-white">{MOCK_USER.display_name}</h1>
              {MOCK_USER.role === "admin" && (
                <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-400/30">ADMIN</span>
              )}
            </div>
            <p className="text-zinc-400 text-sm mb-1">@{MOCK_USER.username}</p>
            <p className="text-zinc-300 text-sm leading-relaxed mb-4">{MOCK_USER.bio}</p>

            {/* Stats row */}
            <div className="flex gap-6">
              {[
                { label: "Followers", value: `${(MOCK_USER.followers/1000).toFixed(1)}K` },
                { label: "Points", value: MOCK_USER.points.toLocaleString() },
                { label: "Wins", value: MOCK_USER.wins },
                { label: "Joined", value: MOCK_USER.joined },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-black text-white">{s.value}</div>
                  <div className="text-xs text-zinc-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Badges</h3>
          <div className="flex flex-wrap gap-2">
            {["🚌 Founder", "🏆 Tournament Winner", "🎙 Space Host", "🔥 Top Contributor", "💰 Earner", "👑 Community Leader"].map(b => (
              <span key={b} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <Grid className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-white">Recent Posts</span>
          </div>
          {RECENT_POSTS.map((post, i) => (
            <div key={post.id} className={`px-5 py-4 ${i < RECENT_POSTS.length-1 ? "border-b border-zinc-800" : ""}`}>
              <p className="text-sm text-zinc-200 leading-relaxed mb-2">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>❤️ {post.likes}</span>
                <span><MessageSquare className="inline w-3 h-3 mr-1" />{post.comments}</span>
                <span>{post.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
