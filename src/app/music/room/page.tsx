"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Music2, Users, ThumbsUp, ThumbsDown, Mic2, Send, Volume2, VolumeX, Radio, Plus, ExternalLink } from "lucide-react";

const PLAYLIST = [
  { id:1, title:"Essence",            artist:"Wizkid ft. Tems",        duration:"3:38", votes:24, genre:"Afrobeats", cover:"🌟" },
  { id:2, title:"Last Last",          artist:"Burna Boy",               duration:"3:17", votes:18, genre:"Afrobeats", cover:"🌍" },
  { id:3, title:"Calm Down",          artist:"Rema & Selena Gomez",     duration:"3:20", votes:15, genre:"Afrobeats", cover:"🕊️" },
  { id:4, title:"Jollof on the Stove",artist:"Focalistic & Davido",     duration:"3:45", votes:12, genre:"Amapiano", cover:"🎹" },
  { id:5, title:"Bother Me",          artist:"Asake",                   duration:"2:54", votes:9,  genre:"Afrofusion",cover:"🔥" },
  { id:6, title:"Stand Strong",       artist:"Olamide ft. The Cavemen", duration:"3:12", votes:8,  genre:"Afropop",  cover:"💪" },
];

const MESSAGES = [
  { user:"@lagosqueen",  text:"This playlist is everything tonight 🔥", time:"2m ago" },
  { user:"@naijaking",   text:"Wizkid always hits different late night", time:"3m ago" },
  { user:"@afrobeatlover", text:"Put Burna next please!!",              time:"5m ago" },
  { user:"@connectplug", text:"Who suggested Jollof on the Stove lmaooo", time:"7m ago" },
];

export default function MusicRoomPage() {
  const [currentTrack, setCurrentTrack] = useState(PLAYLIST[0]);
  const [isPlaying, setIsPlaying]   = useState(true);
  const [isMuted, setIsMuted]       = useState(false);
  const [progress, setProgress]     = useState(23);
  const [playlist, setPlaylist]     = useState(PLAYLIST);
  const [messages, setMessages]     = useState(MESSAGES);
  const [newMsg, setNewMsg]         = useState("");
  const [listeners, setListeners]   = useState(47);
  const [voted, setVoted]           = useState<Set<number>>(new Set());
  const [tab, setTab]               = useState<"queue"|"chat">("queue");
  const chatRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.3), 1000);
    return () => clearInterval(t);
  }, [isPlaying]);

  useEffect(() => {
    setListeners(47 + Math.floor(Math.random() * 5));
    const t = setInterval(() => setListeners(p => p + (Math.random() > 0.5 ? 1 : -1)), 15000);
    return () => clearInterval(t);
  }, []);

  const vote = (id: number, dir: "up" | "down") => {
    if (voted.has(id)) return;
    setVoted(p => new Set([...p, id]));
    setPlaylist(p => p.map(t => t.id === id ? { ...t, votes: t.votes + (dir === "up" ? 1 : -1) } : t).sort((a, b) => b.votes - a.votes));
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(p => [{ user:"@me", text:newMsg, time:"now" }, ...p]);
    setNewMsg("");
    setTimeout(() => chatRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const formatTime = (pct: number, durStr: string) => {
    const [m, s] = durStr.split(":").map(Number);
    const totalSec = m * 60 + s;
    const current = Math.floor((pct / 100) * totalSec);
    return `${Math.floor(current / 60)}:${String(current % 60).padStart(2,"0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-yellow-400" /> Music Room
            </h1>
            <p className="text-zinc-500 text-xs flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {listeners} listening now
            </p>
          </div>
          <a href="https://music.apple.com/ng/playlist/big-cruise-communty-artistes/pl.u-d2b05ZYsLyJx5E0"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#fc3c44]/20 border border-[#fc3c44]/40 text-[#fc3c44] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#fc3c44]/30">
            <ExternalLink className="w-3.5 h-3.5" /> Apple Music
          </a>
        </div>

        {/* Now Playing */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-700 rounded-3xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-yellow-400/20">
              {currentTrack.cover}
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-lg leading-tight">{currentTrack.title}</div>
              <div className="text-zinc-400 text-sm">{currentTrack.artist}</div>
              <div className="text-zinc-600 text-xs mt-0.5">{currentTrack.genre}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="w-full bg-zinc-800 rounded-full h-1 mb-1.5">
              <div className="bg-yellow-400 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>{formatTime(progress, currentTrack.duration)}</span>
              <span>{currentTrack.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-white transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20">
              {isPlaying
                ? <div className="flex gap-1"><div className="w-1.5 h-5 bg-black rounded-full" /><div className="w-1.5 h-5 bg-black rounded-full" /></div>
                : <div className="w-0 h-0 border-l-[14px] border-l-black border-y-[8px] border-y-transparent ml-1" />
              }
            </button>
            <button onClick={() => {
              const next = playlist[(playlist.findIndex(t => t.id === currentTrack.id) + 1) % playlist.length];
              setCurrentTrack(next);
              setProgress(0);
            }} className="text-zinc-400 hover:text-white transition-colors">
              <Music2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["queue","chat"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${tab === t ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>
              {t === "queue" ? `Queue (${playlist.length})` : `Chat (${messages.length})`}
            </button>
          ))}
        </div>

        {/* Queue Tab */}
        {tab === "queue" && (
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs">Vote to move tracks up ↑ — most votes plays next</p>
            {playlist.map((track, i) => (
              <div key={track.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${track.id === currentTrack.id ? "bg-yellow-400/10 border-yellow-400/30" : "bg-zinc-950 border-zinc-800"}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-zinc-800">{track.cover}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{track.title}</div>
                  <div className="text-zinc-500 text-xs truncate">{track.artist}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => vote(track.id, "up")} disabled={voted.has(track.id)}
                    className={`p-1 rounded-lg transition-all ${voted.has(track.id) ? "text-yellow-400" : "text-zinc-600 hover:text-green-400"}`}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-zinc-400 text-xs font-bold w-5 text-center">{track.votes}</span>
                  <button onClick={() => vote(track.id, "down")} disabled={voted.has(track.id)}
                    className="p-1 rounded-lg text-zinc-600 hover:text-red-400 transition-all">
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-700 text-zinc-500 text-xs font-bold py-3 rounded-xl hover:border-zinc-500 hover:text-zinc-400 transition-all">
              <Plus className="w-3.5 h-3.5" /> Suggest a Track
            </button>
          </div>
        )}

        {/* Chat Tab */}
        {tab === "chat" && (
          <div className="space-y-3">
            <div ref={chatRef} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 h-64 overflow-y-auto space-y-2 flex flex-col-reverse">
              {messages.map((m, i) => (
                <div key={i} className="text-xs">
                  <span className="text-yellow-400 font-bold">{m.user}</span>
                  <span className="text-zinc-500 ml-1">{m.time}</span>
                  <p className="text-zinc-300 mt-0.5">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
                placeholder="Say something..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
              <button onClick={sendMsg}
                className="bg-yellow-400 text-black p-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <Link href="/music" className="block text-center text-zinc-600 text-xs hover:text-zinc-400 pb-4">← Back to Music Hub</Link>
      </main>
    </div>
  );
}
