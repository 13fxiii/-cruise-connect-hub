"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import {
  MapPin, Globe, Twitter, Users, Heart, MessageCircle,
  Music, Gamepad2, Trophy, Zap, Send, UserPlus, UserMinus,
  Loader2, Share2
} from "lucide-react";

const LEVEL_CONFIG: Record<string, { color: string; bg: string }> = {
  newcomer:     { color:"text-zinc-400",  bg:"bg-zinc-400/10"  },
  cruiser:      { color:"text-blue-400",  bg:"bg-blue-400/10"  },
  connector:    { color:"text-green-400", bg:"bg-green-400/10" },
  "hub star":   { color:"text-yellow-400",bg:"bg-yellow-400/10"},
  "culture king":{ color:"text-orange-400",bg:"bg-orange-400/10"},
  legend:       { color:"text-red-400",   bg:"bg-red-400/10"   },
};

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [profile, setProfile]     = useState<any>(null);
  const [posts, setPosts]         = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [followLoading, setFL]    = useState(false);
  const isOwnProfile = user?.id === params.id;

  useEffect(() => {
    const loadProfile = async () => {
      const [pRes, postsRes] = await Promise.all([
        fetch(`/api/profile/${params.id}`).then(r => r.json()),
        fetch(`/api/posts?user_id=${params.id}&limit=9`).then(r => r.json()),
      ]);
      setProfile(pRes.profile || null);
      setPosts(postsRes.posts || []);
      setFollowing(pRes.is_following || false);
      setLoading(false);
    };
    loadProfile();
  }, [params.id]);

  const toggleFollow = async () => {
    if (!user || isOwnProfile) return;
    setFL(true);
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_id: params.id, action: following ? "unfollow" : "follow" }),
    });
    setFollowing(!following);
    setProfile((p: any) => p ? {
      ...p,
      followers_count: following ? (p.followers_count || 0) - 1 : (p.followers_count || 0) + 1,
    } : p);
    setFL(false);
  };

  const startDM = async () => {
    if (!user) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: params.id }),
    });
    const data = await res.json();
    if (res.ok) window.location.href = `/messages/${data.conversation_id}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar />
      <div className="flex justify-center pt-20"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar />
      <div className="text-center pt-20">
        <p className="text-zinc-400">Profile not found</p>
        <Link href="/feed" className="text-yellow-400 mt-2 inline-block">← Back to Feed</Link>
      </div>
    </div>
  );

  const levelCfg = LEVEL_CONFIG[profile.level?.toLowerCase()] || LEVEL_CONFIG.newcomer;
  const displayName = profile.display_name || profile.username;
  const letter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto">

        {/* Cover */}
        <div className="h-32 md:h-48 bg-gradient-to-br from-yellow-400/20 via-zinc-900 to-zinc-950 relative">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile header */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-12 mb-4">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-20 h-20 rounded-full object-cover border-4 border-[#0a0a0a]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-[#0a0a0a] flex items-center justify-center text-black font-black text-2xl">
                  {letter}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-[#0a0a0a] ${levelCfg.bg} ${levelCfg.color}`}>
                {profile.level || "newcomer"}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-14">
              {isOwnProfile ? (
                <Link href="/profile"
                  className="bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-zinc-700 border border-zinc-700">
                  Edit Profile
                </Link>
              ) : user ? (
                <>
                  <button onClick={startDM}
                    className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 border border-zinc-700">
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button onClick={toggleFollow} disabled={followLoading}
                    className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full transition-all ${
                      following ? "bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 border border-zinc-700"
                                : "bg-yellow-400 text-black hover:bg-yellow-300"
                    }`}>
                    {followLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                      following ? <><UserMinus className="w-3.5 h-3.5" /> Unfollow</> :
                                  <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="bg-yellow-400 text-black font-black text-xs px-4 py-2 rounded-full">Follow</Link>
              )}
              <button onClick={() => navigator.share?.({ title: displayName, url: window.location.href })}
                className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 border border-zinc-700">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="mb-4">
            <h1 className="text-white font-black text-xl">{displayName}</h1>
            <div className="text-zinc-500 text-sm">@{profile.username}</div>
            {profile.twitter_handle && (
              <div className="flex items-center gap-1 text-zinc-600 text-xs mt-1">
                <Twitter className="w-3 h-3" /> @{profile.twitter_handle}
              </div>
            )}
            {profile.bio && <p className="text-zinc-300 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              {profile.location && (
                <span className="flex items-center gap-1 text-zinc-500 text-xs"><MapPin className="w-3 h-3" /> {profile.location}</span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-yellow-400 text-xs hover:underline"><Globe className="w-3 h-3" /> Website</a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label:"Points",    value:(profile.points||0).toLocaleString(),    icon:Zap      },
              { label:"Followers", value:(profile.followers_count||0).toLocaleString(), icon:Users },
              { label:"Following", value:(profile.following_count||0).toLocaleString(), icon:Heart },
              { label:"Streak",    value:`${profile.current_streak||0}🔥`,         icon:Trophy   },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-center">
                <div className="text-white font-black text-sm">{value}</div>
                <div className="text-zinc-600 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Posts grid */}
          {posts.length > 0 && (
            <div>
              <div className="text-zinc-500 text-xs font-bold mb-3">RECENT POSTS</div>
              <div className="space-y-2">
                {posts.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                    <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">{p.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-zinc-600 text-xs">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likes_count||0}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {p.comments_count||0}</span>
                      <span className="ml-auto">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
