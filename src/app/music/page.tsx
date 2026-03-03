"use client";
import { useState } from "react";
import { Music, Radio, Play, Pause, Heart, Share2, ExternalLink, Headphones, TrendingUp, Mic, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const FEATURED_TRACKS = [
  { id: "1", title: "HARDINARY", artist: "Lil Miss Thrill Seeker", handle: "@ThrillSeekaEnt", cover: "🎵", genre: "Afrobeats", plays: 12400, likes: 892, duration: "3:24", new: true, link: "https://linktr.ee/ThrillSeekerEnt" },
  { id: "2", title: "JUMP ROPE", artist: "Lil Miss Thrill Seeker", handle: "@ThrillSeekaEnt", cover: "🎶", genre: "Afropop", plays: 9800, likes: 734, duration: "2:58", new: true, link: "https://linktr.ee/ThrillSeekerEnt" },
  { id: "3", title: "SPEAKEASY", artist: "Lil Miss Thrill Seeker", handle: "@ThrillSeekaEnt", cover: "🎸", genre: "R&B", plays: 7200, likes: 561, duration: "3:47", new: true, link: "https://linktr.ee/ThrillSeekerEnt" },
  { id: "4", title: "Lagos Nights", artist: "DJ ConnectPlug", handle: "@connectplug", cover: "🎧", genre: "Afrobeats", plays: 5600, likes: 423, duration: "4:12", new: false, link: "#" },
  { id: "5", title: "Cruise Mode", artist: "C&C Hub DJ", handle: "@CCHub_", cover: "🚌", genre: "Mix", plays: 4300, likes: 389, duration: "58:00", new: false, link: "#" },
];

const LIVE_STATIONS = [
  { id: "1", name: "Afrobeats 24/7", host: "@theconnector", listeners: 234, genre: "Afrobeats", status: "live", space_url: "https://twitter.com/CCHub_" },
  { id: "2", name: "Naija R&B Vibes", host: "@CCHub_", listeners: 178, genre: "R&B", status: "live", space_url: "https://twitter.com/CCHub_" },
  { id: "3", name: "Underground Artists", host: "@ThrillSeekaEnt", listeners: 89, genre: "Discovery", status: "live", space_url: "https://twitter.com/CCHub_" },
];

const GENRES = ["All", "Afrobeats", "Afropop", "R&B", "Hip-Hop", "Mix", "Discovery", "Gospel"];

export default function MusicHubPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [genre, setGenre] = useState("All");
  const [tab, setTab] = useState<"discover" | "stations" | "submit">("discover");

  const filtered = genre === "All" ? FEATURED_TRACKS : FEATURED_TRACKS.filter(t => t.genre === genre);

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Music className="text-yellow-400 w-8 h-8" /> Music Hub
            </h1>
            <p className="text-zinc-400 mt-1">Discover new sounds before they blow · Connected to X Live Spaces</p>
          </div>
          <a href="https://linktr.ee/ThrillSeekerEnt" target="_blank" rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> @ThrillSeekaEnt
          </a>
        </div>

        {/* Live Stations Banner */}
        <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-bold text-sm">LIVE STATIONS</span>
            <span className="text-zinc-500 text-xs ml-auto">Playing while you browse</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {LIVE_STATIONS.map(s => (
              <a key={s.id} href={s.space_url} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 bg-zinc-900 border border-zinc-700 hover:border-yellow-400/40 rounded-xl px-4 py-3 transition-colors min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-400 font-bold">LIVE</span>
                  <span className="ml-auto text-xs text-zinc-500 flex items-center gap-1">
                    <Headphones className="w-3 h-3" /> {s.listeners}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{s.name}</div>
                <div className="text-xs text-yellow-400">{s.host}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["discover", "stations", "submit"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
              {t === "discover" ? "🎵 Discover" : t === "stations" ? "📻 Stations" : "🎤 Submit Track"}
            </button>
          ))}
        </div>

        {tab === "discover" && (
          <>
            {/* Genre filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === g ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>
                  {g}
                </button>
              ))}
            </div>

            {/* Featured header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" /> Trending Now
              </h2>
            </div>

            {/* Track list */}
            <div className="space-y-3">
              {filtered.map((track, i) => (
                <div key={track.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-4 transition-all flex items-center gap-4">
                  
                  {/* Number / Play */}
                  <button onClick={() => setPlaying(playing === track.id ? null : track.id)}
                    className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-yellow-400 hover:text-black flex items-center justify-center transition-all group flex-shrink-0">
                    {playing === track.id
                      ? <Pause className="w-4 h-4 text-yellow-400 group-hover:text-black" />
                      : <Play className="w-4 h-4 text-zinc-400 group-hover:text-black ml-0.5" />}
                  </button>

                  {/* Cover art */}
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                    {track.cover}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{track.title}</span>
                      {track.new && <span className="flex-shrink-0 bg-yellow-400/20 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
                    </div>
                    <div className="text-sm text-zinc-400">{track.artist} · <span className="text-yellow-400">{track.handle}</span></div>
                  </div>

                  {/* Genre */}
                  <span className="hidden sm:block text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full flex-shrink-0">
                    {track.genre}
                  </span>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500 flex-shrink-0">
                    <span>{(track.plays / 1000).toFixed(1)}K plays</span>
                    <span>{track.duration}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleLike(track.id)}
                      className={`p-2 rounded-full transition-colors ${liked.has(track.id) ? "text-red-400" : "text-zinc-500 hover:text-red-400"}`}>
                      <Heart className="w-4 h-4" fill={liked.has(track.id) ? "currentColor" : "none"} />
                    </button>
                    <a href={track.link} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full text-zinc-500 hover:text-yellow-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {playing && (
              <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 px-4 py-3 z-50">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                  {(() => {
                    const t = FEATURED_TRACKS.find(x => x.id === playing)!;
                    return <>
                      <div className="text-2xl">{t.cover}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{t.title}</div>
                        <div className="text-xs text-zinc-400">{t.artist}</div>
                      </div>
                      <div className="h-1 flex-1 bg-zinc-800 rounded-full hidden sm:block">
                        <div className="h-full bg-yellow-400 rounded-full w-1/3 animate-pulse" />
                      </div>
                      <button onClick={() => setPlaying(null)} className="text-zinc-400 hover:text-white">
                        <Pause className="w-5 h-5" />
                      </button>
                      <a href={t.link} target="_blank" rel="noopener noreferrer"
                        className="bg-yellow-400 text-black text-xs font-bold px-3 py-2 rounded-full hover:bg-yellow-300 transition-colors">
                        Full Track
                      </a>
                    </>;
                  })()}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "stations" && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">Listen to curated music stations while connecting with the community. Stations play live alongside X Spaces.</p>
            {LIVE_STATIONS.map(s => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <h3 className="font-bold text-white">{s.name}</h3>
                    </div>
                    <p className="text-sm text-zinc-400">Hosted by <span className="text-yellow-400">{s.host}</span> · {s.genre}</p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><Headphones className="w-3 h-3" /> {s.listeners} listening now</p>
                  </div>
                  <a href={s.space_url} target="_blank" rel="noopener noreferrer"
                    className="bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
                    <Radio className="w-4 h-4" /> Tune In
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "submit" && (
          <div className="max-w-xl space-y-4">
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 text-sm text-yellow-300">
              🎤 Submit your latest track to be featured in the Music Hub. Our A&R team reviews every submission. Powered by <span className="font-bold">@ThrillSeekaEnt</span>
            </div>
            {[
              { label: "Artist Name / Stage Name", placeholder: "e.g. Burna Boy" },
              { label: "Track Title", placeholder: "e.g. African Giant" },
              { label: "X / Twitter Handle", placeholder: "@yourhandle" },
              { label: "Streaming Link (Spotify / Apple Music / Audiomack)", placeholder: "https://..." },
              { label: "Genre", placeholder: "e.g. Afrobeats, R&B, Hip-Hop..." },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-zinc-400 mb-2 font-medium">{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">About the track (optional)</label>
              <textarea rows={3} placeholder="Tell us about your track..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none" />
            </div>
            <button className="w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 transition-colors">
              Submit for Review 🎵
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
