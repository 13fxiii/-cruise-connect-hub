"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Radio, Music2, Headphones, Heart, ExternalLink, Upload,
  ListMusic, Shuffle, Repeat, ChevronUp, ChevronDown, Star, Mic2
} from "lucide-react";

/* ── Station data ────────────────────────────────────────────── */
const STATIONS = [
  { id: "afrobeats", label: "Afrobeats 🔥",     color: "from-orange-500 to-red-600",    bg: "bg-orange-400/10", border: "border-orange-400/30", textColor: "text-orange-400" },
  { id: "amapiano",  label: "Amapiano 🎹",       color: "from-blue-500 to-purple-600",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   textColor: "text-blue-400"   },
  { id: "naija",     label: "Old Skool Naija 🇳🇬", color: "from-green-500 to-emerald-600", bg: "bg-green-400/10",  border: "border-green-400/30",  textColor: "text-green-400"  },
  { id: "afropop",   label: "Afropop Vibes ✨",   color: "from-pink-500 to-rose-600",     bg: "bg-pink-400/10",   border: "border-pink-400/30",   textColor: "text-pink-400"   },
  { id: "ccradio",   label: "CC Hub Radio 🚌",   color: "from-yellow-500 to-amber-600",  bg: "bg-yellow-400/10", border: "border-yellow-400/30", textColor: "text-yellow-400" },
];

/* 
  TRACKS — YouTube video IDs for popular Naija tracks
  Admin: update videoId values in /admin panel with correct YouTube IDs
  Format: youtube.com/watch?v=VIDEO_ID
*/
const TRACKS = [
  // CC Hub Community Artists (featured first)
  { id:"t1",  title:"HARDINARY",          artist:"Lil Miss Thrill Seeker", station:"ccradio",  videoId:"dQw4w9WgXcQ", duration:"3:24", featured:true,  cover:"🎵", genre:"Afrobeats",  artistLink:"https://linktr.ee/ThrillSeekerEnt" },
  { id:"t2",  title:"JUMP ROPE",           artist:"Lil Miss Thrill Seeker", station:"ccradio",  videoId:"dQw4w9WgXcQ", duration:"2:58", featured:true,  cover:"🎤", genre:"Afropop",    artistLink:"https://linktr.ee/ThrillSeekerEnt" },
  // Afrobeats Station
  { id:"t3",  title:"Last Last",           artist:"Burna Boy",              station:"afrobeats", videoId:"5Euj9f3gdyM", duration:"3:17", featured:false, cover:"🌍", genre:"Afrobeats",  artistLink:"" },
  { id:"t4",  title:"Essence",             artist:"Wizkid ft. Tems",        station:"afrobeats", videoId:"WcIcVapfqXw", duration:"3:38", featured:false, cover:"⭐", genre:"Afrobeats",  artistLink:"" },
  { id:"t5",  title:"Calm Down",           artist:"Rema & Selena Gomez",    station:"afrobeats", videoId:"WcIcVapfqXw", duration:"3:20", featured:false, cover:"🕊️", genre:"Afrobeats",  artistLink:"" },
  { id:"t6",  title:"Fall",                artist:"Davido",                  station:"afrobeats", videoId:"WcIcVapfqXw", duration:"3:48", featured:false, cover:"🌟", genre:"Afrobeats",  artistLink:"" },
  { id:"t7",  title:"Bother Me",           artist:"Asake",                  station:"afrobeats", videoId:"WcIcVapfqXw", duration:"2:54", featured:false, cover:"🔥", genre:"Afrofusion", artistLink:"" },
  // Amapiano Station
  { id:"t8",  title:"John Vuli Gate",      artist:"Mapara A Jazz",          station:"amapiano",  videoId:"WcIcVapfqXw", duration:"3:02", featured:false, cover:"🎹", genre:"Amapiano",   artistLink:"" },
  { id:"t9",  title:"Umlando",             artist:"9umba, Toss & Mdoovar",  station:"amapiano",  videoId:"WcIcVapfqXw", duration:"4:12", featured:false, cover:"🎶", genre:"Amapiano",   artistLink:"" },
  { id:"t10", title:"Spirit",              artist:"Olamide ft. Asake",      station:"amapiano",  videoId:"WcIcVapfqXw", duration:"3:28", featured:false, cover:"👻", genre:"Afro-fusion", artistLink:"" },
  // Old Skool Naija
  { id:"t11", title:"One Love",            artist:"P-Square",               station:"naija",     videoId:"WcIcVapfqXw", duration:"4:45", featured:false, cover:"❤️", genre:"Afropop",    artistLink:"" },
  { id:"t12", title:"African Queen",       artist:"2Baba",                  station:"naija",     videoId:"WcIcVapfqXw", duration:"3:59", featured:false, cover:"👑", genre:"Afropop",    artistLink:"" },
  { id:"t13", title:"oliver twist",        artist:"D'banj",                 station:"naija",     videoId:"WcIcVapfqXw", duration:"3:41", featured:false, cover:"🎩", genre:"Afropop",    artistLink:"" },
];

type Track = typeof TRACKS[0];

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

export default function MusicPage() {
  const [station, setStation] = useState("ccradio");
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [showQueue, setShowQueue] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [tab, setTab] = useState<"stations"|"playlist"|"discover"|"submit">("stations");

  const playerRef    = useRef<any>(null);
  const progressRef  = useRef<any>(null);

  const stationTracks = TRACKS.filter(t => t.station === station);
  const trackIdx = stationTracks.findIndex(t => t.id === currentTrack.id);
  const currentStation = STATIONS.find(s => s.id === station)!;

  /* ── YouTube IFrame API ─────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT) { initPlayer(); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => { setYtReady(true); initPlayer(); };
  }, []);

  useEffect(() => {
    if (ytReady) initPlayer();
  }, [ytReady]);

  const initPlayer = () => {
    if (!window.YT?.Player) return;
    playerRef.current = new window.YT.Player("yt-player", {
      height: "1", width: "1",
      videoId: currentTrack.videoId,
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1 },
      events: {
        onReady: (e: any) => { e.target.setVolume(volume); },
        onStateChange: (e: any) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          if (e.data === window.YT.PlayerState.ENDED) handleNext();
        },
      },
    });
  };

  /* ── Progress ticker ─────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      try {
        const cur = playerRef.current.getCurrentTime?.() || 0;
        const dur = playerRef.current.getDuration?.() || 1;
        setCurrentTime(cur);
        setDuration(dur);
        setProgress((cur / dur) * 100);
      } catch {}
    }, 500);
    return () => clearInterval(t);
  }, []);

  /* ── Controls ────────────────────────────────────────────── */
  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(track.videoId);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, []);

  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    setIsPlaying(!isPlaying);
  };

  const handleNext = useCallback(() => {
    const tracks = TRACKS.filter(t => t.station === station);
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIdx = isShuffled ? Math.floor(Math.random() * tracks.length) : (idx + 1) % tracks.length;
    playTrack(tracks[nextIdx]);
  }, [currentTrack, station, isShuffled, playTrack]);

  const handlePrev = () => {
    const tracks = TRACKS.filter(t => t.station === station);
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIdx]);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current?.seekTo) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(pct * duration, true);
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    playerRef.current?.setVolume?.(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (isMuted) { handleVolume(volume || 80); }
    else { playerRef.current?.mute?.(); setIsMuted(true); }
  };

  const toggleStation = (sid: string) => {
    setStation(sid);
    const first = TRACKS.find(t => t.station === sid);
    if (first) setCurrentTrack(first);
  };

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-36">
      <Navbar />
      {/* Hidden YouTube player */}
      <div className="fixed opacity-0 pointer-events-none w-1 h-1 overflow-hidden">
        <div id="yt-player" />
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Headphones size={20} className="text-yellow-400" /> CC Music Hub
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">Stream Naija music · Submit your track · Join the station</p>
          </div>
          <div className="flex gap-2">
            {["stations","playlist","discover","submit"].map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                className={`capitalize text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                  tab === t ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                }`}>{t === "playlist" ? "🎵 Playlist" : t}</button>
            ))}
          </div>
        </div>

        {/* BIG CRUISE APPLE MUSIC BANNER */}
        <a
          href="https://music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-[#fc3c44]/20 via-zinc-900 to-zinc-900 border border-[#fc3c44]/30 hover:border-[#fc3c44]/60 rounded-2xl p-4 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#fc3c44]/20">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a6.303 6.303 0 0 0-1.976-.75 10.814 10.814 0 0 0-1.664-.17c-.045-.003-.09-.007-.135-.007H6.197c-.049 0-.098.003-.147.006l-.18.009A8.134 8.134 0 0 0 4.2 .214a5.877 5.877 0 0 0-2.168 1.145A5.97 5.97 0 0 0 .667 3.315 8.137 8.137 0 0 0 .168 5.18C.085 5.771.01 6.37.002 6.97c0 .054-.002.109-.002.163v10.74c0 .054 0 .108.002.162a18.74 18.74 0 0 0 .166 2.444 5.97 5.97 0 0 0 2.757 4.24 6.303 6.303 0 0 0 1.976.751c.636.13 1.28.196 1.927.202.049 0 .098.002.147.002h11.607c.049 0 .098 0 .147-.002a18.74 18.74 0 0 0 2.444-.166 6.303 6.303 0 0 0 1.976-.75 5.97 5.97 0 0 0 2.757-4.24c.082-.59.157-1.19.165-1.79.001-.054.002-.108.002-.163V6.287c0-.054 0-.108-.002-.163zM12 17.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.5-2a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[#fc3c44] font-black text-xs tracking-widest mb-0.5">APPLE MUSIC · OFFICIAL PLAYLIST</div>
              <div className="text-white font-black text-base group-hover:text-[#fc3c44] transition-colors">Big Cruise Community Artistes 🚌</div>
              <div className="text-zinc-400 text-xs mt-0.5">CC Hub's official community artists playlist · Updated regularly</div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#fc3c44] text-white text-xs font-black px-3 py-2 rounded-xl group-hover:bg-[#ff5555] transition-colors flex-shrink-0">
              <ExternalLink size={12} /> Listen
            </div>
          </div>
        </a>

        {/* PLAYLIST TAB */}
        {tab === "playlist" && (
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-[#fc3c44]/20 via-zinc-900 to-zinc-950 border border-[#fc3c44]/30 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center flex-shrink-0 shadow-xl shadow-[#fc3c44]/30">
                  <span className="text-3xl">🎵</span>
                </div>
                <div>
                  <div className="text-[#fc3c44] font-black text-xs tracking-widest mb-1">APPLE MUSIC · OFFICIAL</div>
                  <h2 className="text-white font-black text-xl leading-tight">Big Cruise Community Artistes</h2>
                  <p className="text-zinc-400 text-sm mt-1">The official CC Hub playlist — featuring our community artistes 🚌</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Curated by @13fxiii_ · Updated regularly</p>
                </div>
              </div>
              <a
                href="https://music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#fc3c44] hover:bg-[#ff5555] text-white font-black py-3.5 rounded-xl transition-all text-sm"
              >
                Open in Apple Music 🎵
              </a>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-white font-black text-sm">🎧 Preview Playlist</h3>
                <p className="text-zinc-500 text-xs mt-0.5">Embedded Apple Music player</p>
              </div>
              <iframe
                allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                frameBorder="0"
                height="450"
                style={{ width: "100%", overflow: "hidden", borderRadius: "0 0 16px 16px", background: "transparent" }}
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                src="https://embed.music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0"
              />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-white font-bold text-sm mb-3">📤 Share the Playlist</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const text = "🎵 Check out the Big Cruise Community Artistes playlist!\n\nhttps://music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0\n\n@TheCruiseCH @13fxiii_ #BigCruise #CruiseAndConnect";
                    if (navigator.share) navigator.share({ title: "Big Cruise Playlist", url: "https://music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0" });
                    else navigator.clipboard.writeText(text);
                  }}
                  className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-xs py-2.5 rounded-xl hover:bg-zinc-800"
                >
                  Share on X 𝕏
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText("https://music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0"); }}
                  className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-xs py-2.5 rounded-xl hover:bg-zinc-800"
                >
                  Copy Link 🔗
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400/10 to-zinc-900 border border-yellow-400/20 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="text-white font-black text-base mb-1">Want to be on the playlist?</h3>
              <p className="text-zinc-400 text-xs mb-3">Submit your track to be featured in the Big Cruise Community Artistes playlist</p>
              <button onClick={() => setTab("submit")}
                className="bg-yellow-400 text-black font-black text-sm px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
                Submit Your Track 🎵
              </button>
            </div>
          </div>
        )}

        {tab === "stations" && (
          <div className="space-y-5">
            {/* Station picker */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {STATIONS.map(s => (
                <button key={s.id} onClick={() => toggleStation(s.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    station === s.id
                      ? `bg-gradient-to-r ${s.color} text-white border-transparent shadow-lg`
                      : `${s.bg} ${s.border} ${s.textColor} hover:opacity-80`
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Radio size={14} className="text-yellow-400" />
                <span className="text-white font-bold text-sm">{currentStation.label}</span>
                <span className="text-zinc-600 text-xs ml-auto">{stationTracks.length} tracks</span>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {stationTracks.map((track, i) => {
                  const isActive = track.id === currentTrack.id;
                  return (
                    <div key={track.id}
                      onClick={() => playTrack(track)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                        isActive ? "bg-yellow-400/5" : "hover:bg-zinc-800/50"
                      }`}>
                      {/* Cover / play indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                        isActive ? "bg-yellow-400/20" : "bg-zinc-800"
                      }`}>
                        {isActive && isPlaying ? (
                          <div className="flex gap-0.5 items-end h-5">
                            {[3,5,4,6,3].map((h,i) => (
                              <div key={i} className="w-1 bg-yellow-400 rounded-full animate-bounce"
                                style={{height:`${h*3}px`,animationDelay:`${i*0.1}s`}} />
                            ))}
                          </div>
                        ) : <span>{track.cover}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isActive ? "text-yellow-400" : "text-white"}`}>
                          {track.title}
                          {track.featured && <span className="ml-1.5 text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">FEATURED</span>}
                        </p>
                        <p className="text-zinc-500 text-xs truncate">{track.artist} · {track.genre}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); setLiked(prev => { const n = new Set(prev); n.has(track.id) ? n.delete(track.id) : n.add(track.id); return n; }); }}
                          className={`transition-colors ${liked.has(track.id) ? "text-red-400" : "text-zinc-600 hover:text-zinc-400"}`}>
                          <Heart size={14} fill={liked.has(track.id) ? "currentColor" : "none"} />
                        </button>
                        <span className="text-zinc-600 text-xs">{track.duration}</span>
                        {track.artistLink && (
                          <a href={track.artistLink} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-zinc-600 hover:text-zinc-300 transition-colors">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DISCOVER TAB */}
        {tab === "discover" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name:"Burna Boy",           handle:"@burnaboy",       genre:"Afrofusion",  streams:"2.1B", emoji:"🌍", link:"https://open.spotify.com/artist/3wcj11K77LjEY1PkEUS4Ew" },
              { name:"Wizkid",              handle:"@wizkidayo",      genre:"Afrobeats",   streams:"1.8B", emoji:"⭐", link:"" },
              { name:"Rema",                handle:"@heisrema",       genre:"Afropop",     streams:"980M", emoji:"🕊️", link:"" },
              { name:"Asake",               handle:"@asakemusic",     genre:"Afrofusion",  streams:"760M", emoji:"🔥", link:"" },
              { name:"Lil Miss Thrill Seeker",handle:"@ThrillSeekaEnt",genre:"Afrobeats", streams:"12K",  emoji:"🎵", link:"https://linktr.ee/ThrillSeekerEnt", featured:true },
              { name:"Davido",              handle:"@davido",         genre:"Afropop",     streams:"1.4B", emoji:"🌟", link:"" },
              { name:"Tiwa Savage",         handle:"@tiwasavage",     genre:"Afropop",     streams:"560M", emoji:"👑", link:"" },
              { name:"Tems",                handle:"@temsbaby",       genre:"R&B/Afrobeats",streams:"890M",emoji:"✨", link:"" },
            ].map((a: any) => (
              <div key={a.name} className={`bg-zinc-900 border rounded-xl p-4 flex items-center gap-3 ${
                a.featured ? "border-yellow-400/30 bg-yellow-400/5" : "border-zinc-800"
              }`}>
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-bold text-sm">{a.name}</p>
                    {a.featured && <span className="text-[9px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-black">CC ARTIST</span>}
                  </div>
                  <p className="text-zinc-500 text-xs">{a.genre} · {a.streams} streams</p>
                </div>
                {a.link ? (
                  <a href={a.link} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 bg-yellow-400 text-black text-xs font-black px-3 py-1.5 rounded-full hover:bg-yellow-300 transition-colors">
                    Listen
                  </a>
                ) : (
                  <span className="flex-shrink-0 text-zinc-600 text-xs">Spotify</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT TAB */}
        {tab === "submit" && (
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload size={18} className="text-yellow-400" />
                <h2 className="text-white font-black text-base">Submit Your Track</h2>
              </div>
              <p className="text-zinc-400 text-xs mb-5 leading-relaxed">
                Get your music featured on CC Hub Radio and reach 3,000+ Naija music lovers. 
                We feature Afrobeats, Afropop, Amapiano, R&B, and more.
              </p>
              <div className="space-y-3">
                {[
                  { label:"Track Title", placeholder:"e.g. My Latest Banger" },
                  { label:"Artist Name", placeholder:"Your stage name" },
                  { label:"Genre", placeholder:"Afrobeats, Amapiano, R&B..." },
                  { label:"Streaming Link", placeholder:"Spotify / Apple Music / Audiomack URL" },
                  { label:"Your X / Twitter handle", placeholder:"@yourhandle" },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="text-xs text-zinc-400 mb-1 block font-medium">{label}</label>
                    <input placeholder={placeholder}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
                  </div>
                ))}
                <button className="w-full bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 mt-2">
                  <Music2 size={15} /> Submit Track for Review
                </button>
              </div>
              <p className="text-zinc-600 text-xs mt-3 text-center">Review takes 24-48 hours. Featured tracks get a shoutout on @TheCruiseCH</p>
            </div>
          </div>
        )}
      </main>

      {/* ── FIXED PLAYER BAR ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 pb-safe"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 4rem)" }}>
        {/* Progress bar */}
        <div className="w-full h-1 bg-zinc-800 cursor-pointer group" onClick={seek}>
          <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all relative"
            style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
              {currentTrack.cover}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-xs truncate">{currentTrack.title}</p>
              <p className="text-zinc-500 text-[11px] truncate">{currentTrack.artist}</p>
            </div>
            <button onClick={() => setLiked(prev => { const n = new Set(prev); n.has(currentTrack.id) ? n.delete(currentTrack.id) : n.add(currentTrack.id); return n; })}
              className={`flex-shrink-0 transition-colors ${liked.has(currentTrack.id) ? "text-red-400" : "text-zinc-600 hover:text-zinc-400"}`}>
              <Heart size={15} fill={liked.has(currentTrack.id) ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => setIsShuffled(!isShuffled)}
              className={`p-2 rounded-lg transition-colors hidden sm:block ${isShuffled ? "text-yellow-400" : "text-zinc-500 hover:text-zinc-300"}`}>
              <Shuffle size={14} />
            </button>
            <button onClick={handlePrev} className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <SkipBack size={18} />
            </button>
            <button onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:bg-yellow-300 transition-all hover:scale-105 flex-shrink-0">
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={handleNext} className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <SkipForward size={18} />
            </button>
            <span className="text-zinc-600 text-[10px] w-16 text-center hidden sm:block">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
            <button onClick={toggleMute} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input type="range" min={0} max={100} value={isMuted ? 0 : volume}
              onChange={e => handleVolume(Number(e.target.value))}
              className="w-20 accent-yellow-400 cursor-pointer" />
            <button onClick={() => setShowQueue(!showQueue)} className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1">
              <ListMusic size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
