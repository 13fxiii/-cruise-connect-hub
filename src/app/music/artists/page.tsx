"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { Music, Play, Pause, Heart, ExternalLink, Plus, Radio, TrendingUp } from "lucide-react";

const GENRES = [
  { id:"all",       label:"All"        },
  { id:"afrobeats", label:"Afrobeats"  },
  { id:"amapiano",  label:"Amapiano"   },
  { id:"afropop",   label:"Afropop"    },
  { id:"highlife",  label:"Highlife"   },
  { id:"rap",       label:"Rap"        },
  { id:"rnb",       label:"R&B"        },
  { id:"gospel",    label:"Gospel"     },
  { id:"dancehall", label:"Dancehall"  },
];

const DEMO_TRACKS = [
  { id:"1", artist_name:"ThrillSeekaEnt", track_title:"HARDINARY", genre:"afrobeats", play_count:2840, like_count:341, status:"featured", track_url:"https://linktr.ee/ThrillSeekerEnt", cover_url:"", description:"Afrobeats banger dropping heat 🔥", profiles:{display_name:"ThrillSeekaEnt", username:"thrillseekaent"} },
  { id:"2", artist_name:"ThrillSeekaEnt", track_title:"JUMP ROPE", genre:"afropop", play_count:1920, like_count:214, status:"featured", track_url:"https://linktr.ee/ThrillSeekerEnt", cover_url:"", description:"Feel good vibes only 🎶", profiles:{display_name:"ThrillSeekaEnt", username:"thrillseekaent"} },
  { id:"3", artist_name:"ThrillSeekaEnt", track_title:"SPEAKEASY", genre:"rnb", play_count:1680, like_count:189, status:"featured", track_url:"https://linktr.ee/ThrillSeekerEnt", cover_url:"", description:"Smooth sounds for the culture 🎵", profiles:{display_name:"ThrillSeekaEnt", username:"thrillseekaent"} },
  { id:"4", artist_name:"BigCruiseArtist", track_title:"Lagos Streets", genre:"afrobeats", play_count:890, like_count:102, status:"approved", track_url:"", cover_url:"", description:"For the streets of Lagos 🌆", profiles:{display_name:"BigCruise", username:"bigcruise"} },
  { id:"5", artist_name:"CCHubSounds",    track_title:"We Dey Grow",   genre:"highlife",  play_count:720, like_count:88,  status:"approved", track_url:"", cover_url:"", description:"CC Hub anthem 🚌", profiles:{display_name:"CCHubSounds", username:"cchubsounds"} },
  { id:"6", artist_name:"NaijaVoice",     track_title:"Connect Season", genre:"afropop",  play_count:610, like_count:74,  status:"approved", track_url:"", cover_url:"", description:"Season of connection 🤝", profiles:{display_name:"NaijaVoice", username:"naijavoice"} },
];

const GENRE_COLORS: Record<string,string> = {
  afrobeats:"bg-orange-500/20 text-orange-400",
  amapiano:"bg-purple-500/20 text-purple-400",
  afropop:"bg-pink-500/20 text-pink-400",
  highlife:"bg-green-500/20 text-green-400",
  rap:"bg-zinc-600/40 text-zinc-300",
  rnb:"bg-blue-500/20 text-blue-400",
  gospel:"bg-yellow-500/20 text-yellow-400",
  dancehall:"bg-red-500/20 text-red-400",
};

export default function ArtistHubPage() {
  const { user } = useAuth();
  const [genre, setGenre]         = useState("all");
  const [tracks, setTracks]       = useState(DEMO_TRACKS);
  const [playing, setPlaying]     = useState<string|null>(null);
  const [liked, setLiked]         = useState<Set<string>>(new Set());
  const audioRef                  = useRef<HTMLAudioElement|null>(null);

  useEffect(() => {
    fetch("/api/artists?status=approved")
      .then(r => r.json())
      .then(d => { if (d.tracks?.length > 0) setTracks([...DEMO_TRACKS, ...d.tracks]); });
  }, []);

  const filtered = tracks.filter(t => genre === "all" || t.genre === genre);

  const togglePlay = async (track: any) => {
    if (playing === track.id) { setPlaying(null); return; }
    setPlaying(track.id);
    await fetch(`/api/artists/${track.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "play" }),
    });
  };

  const toggleLike = async (track: any) => {
    if (!user) return;
    const isLiked = liked.has(track.id);
    setLiked(s => { const n = new Set(s); isLiked ? n.delete(track.id) : n.add(track.id); return n; });
    await fetch(`/api/artists/${track.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isLiked ? "unlike" : "like" }),
    });
  };

  const featured = tracks.filter(t => t.status === "featured");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Music className="w-6 h-6 text-yellow-400" /> Artist Hub
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Discover Naija music before it blows 🔥</p>
          </div>
          <Link href="/music/submit"
            className="bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-300 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Submit Track
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[["🎵","Tracks Featured","30+"],["🎧","Total Plays","50K+"],["🌍","Genres","9"]].map(([icon,label,val]) => (
            <div key={String(label)} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-2xl mb-0.5">{icon}</div>
              <div className="text-white font-black text-base">{val}</div>
              <div className="text-zinc-600 text-[10px]">{label}</div>
            </div>
          ))}
        </div>

        {/* Featured Tracks */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-black text-base">🔥 Featured Now</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.slice(0,3).map(track => (
                <div key={track.id} className="bg-gradient-to-b from-yellow-400/10 to-zinc-950 border border-yellow-400/20 rounded-2xl p-4">
                  <div className="h-24 bg-gradient-to-br from-yellow-400/20 to-zinc-800 rounded-xl flex items-center justify-center text-5xl mb-3">🎵</div>
                  <div className="text-white font-black truncate">{track.track_title}</div>
                  <div className="text-zinc-400 text-xs mt-0.5">{track.artist_name}</div>
                  <div className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 ${GENRE_COLORS[track.genre] || "bg-zinc-800 text-zinc-400"}`}>{track.genre}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => togglePlay(track)}
                      className="w-9 h-9 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-300 transition-all">
                      {playing === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button onClick={() => toggleLike(track)}
                      className={`transition-colors ${liked.has(track.id) || (user && false) ? "text-red-400" : "text-zinc-500 hover:text-red-400"}`}>
                      <Heart className={`w-4 h-4 ${liked.has(track.id) ? "fill-current" : ""}`} />
                    </button>
                    {track.track_url && (
                      <a href={track.track_url} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-yellow-400 hover:text-yellow-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <div className="flex items-center gap-1 text-zinc-600 text-xs ml-auto">
                      <TrendingUp className="w-3 h-3" /> {(track.play_count||0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {GENRES.map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                genre === g.id ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}>
              {g.label}
            </button>
          ))}
        </div>

        {/* All Tracks */}
        <div className="space-y-2">
          <div className="text-zinc-500 text-xs font-bold mb-3">ALL TRACKS ({filtered.length})</div>
          {filtered.map((track, i) => (
            <div key={track.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all group">
              <div className="text-zinc-600 font-black text-sm w-6 text-right">{i + 1}</div>
              <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:from-yellow-400/20 transition-all">
                🎵
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-black text-sm truncate">{track.track_title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-zinc-500 text-xs">@{track.profiles?.username || track.artist_name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${GENRE_COLORS[track.genre] || "bg-zinc-800 text-zinc-400"}`}>{track.genre}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-zinc-600 text-xs">
                <Play className="w-3 h-3" /> {(track.play_count||0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleLike(track)}
                  className={`flex items-center gap-1 text-xs transition-colors ${liked.has(track.id) ? "text-red-400" : "text-zinc-500 hover:text-red-400"}`}>
                  <Heart className={`w-4 h-4 ${liked.has(track.id) ? "fill-current" : ""}`} />
                  <span>{(track.like_count||0) + (liked.has(track.id) ? 1 : 0)}</span>
                </button>
                <button onClick={() => togglePlay(track)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    playing === track.id ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-yellow-400 hover:text-black"
                  }`}>
                  {playing === track.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                {track.track_url && (
                  <a href={track.track_url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-yellow-400 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No tracks in this genre yet</p>
            <Link href="/music/submit" className="mt-3 inline-block text-yellow-400 text-sm font-bold hover:underline">Submit yours →</Link>
          </div>
        )}
      </main>
    </div>
  );
}
