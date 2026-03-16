"use client";
import { useState, useEffect } from "react";
import { Mic, Radio, Clock, Users, ExternalLink, Plus, RefreshCw, Video, Zap } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

type Space = { id:string; title:string; description?:string; status:string; listener_count:number; x_space_url?:string; twitter_space_url?:string; tags?:string[]; scheduled_at?:string; host?:{username:string;display_name:string}; source?:string; };

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Starting soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

export default function SpacesPage() {
  const [tab, setTab]       = useState<"audio"|"video">("audio");
  const [filter, setFilter] = useState<"live"|"scheduled"|"ended">("live");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (status: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/spaces?status=${status}`);
      const d = await r.json();
      setSpaces(d.spaces || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(filter); }, [filter]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Radio className="text-yellow-400 w-6 h-6" /> Live Spaces
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Audio & Video rooms — powered by CC Hub × X</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load(filter)} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/spaces/video"
              className="bg-zinc-800 border border-zinc-700 text-white font-bold px-3 py-2 rounded-xl text-sm hover:bg-zinc-700 flex items-center gap-2">
              <Video className="w-4 h-4" /> Go Live (Video)
            </Link>
            <Link href="/moderator"
              className="bg-yellow-400 text-black font-black px-3 py-2 rounded-xl text-sm hover:bg-yellow-300 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Host Space
            </Link>
          </div>
        </div>

        {/* Format Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("audio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "audio" ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
            <Mic className="w-4 h-4" /> Audio Spaces
          </button>
          <button onClick={() => setTab("video")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "video" ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
            <Video className="w-4 h-4" /> Video Live
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">NEW</span>
          </button>
        </div>

        {/* Video Live Tab */}
        {tab === "video" && (
          <div className="space-y-4">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-2xl overflow-hidden p-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Video className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h2 className="text-white font-black text-xl">CC Hub Video Live 🎥</h2>
                  <p className="text-zinc-400 text-sm">TikTok-style vertical live rooms — camera on, chat flowing, gifts flying</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[["📹","Camera + Mic","Full HD video & audio"],["💬","Live Chat","Real-time community chat"],["🎁","Digital Gifts","Fans send you gifts live"]].map(([icon,title,desc]) => (
                  <div key={title} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-white font-bold text-xs">{title}</div>
                    <div className="text-zinc-500 text-[10px] mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
              <Link href="/spaces/video"
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-black py-3.5 rounded-xl transition-colors">
                <Video className="w-5 h-5" /> Start Your Video Space 🔴
              </Link>
            </div>

            {/* How it works */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-white font-black text-sm mb-3">How Video Spaces Work</h3>
              <div className="space-y-2">
                {[
                  ["1","Allow camera & microphone access"],
                  ["2","Start your live stream — community gets notified instantly"],
                  ["3","Fans join, chat, and send digital gifts"],
                  ["4","End stream — earnings go straight to your wallet"],
                ].map(([n, text]) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black text-xs flex-shrink-0">{n}</div>
                    <span className="text-zinc-300 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio Spaces Tab */}
        {tab === "audio" && (
          <>
            <div className="flex gap-2 mb-4 bg-zinc-900 rounded-xl p-1 w-fit">
              {[{id:"live",label:"🔴 Live"},{id:"scheduled",label:"📅 Scheduled"},{id:"ended",label:"✅ Ended"}].map(({id,label}) => (
                <button key={id} onClick={() => setFilter(id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === id ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl h-28 animate-pulse" />)}</div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-16">
                <Mic className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <div className="text-zinc-500 text-sm">
                  {filter === "live" ? "No live spaces right now — start one!" : filter === "scheduled" ? "No scheduled spaces yet." : "No ended spaces."}
                </div>
                {filter === "live" && (
                  <Link href="/moderator" className="mt-4 inline-flex items-center gap-2 bg-yellow-400 text-black font-black px-5 py-2.5 rounded-full text-sm hover:bg-yellow-300">
                    <Plus className="w-4 h-4" /> Host a Space
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {spaces.map(sp => (
                  <div key={sp.id} className={`bg-zinc-900 border rounded-xl p-5 transition-all hover:border-yellow-400/30 ${sp.status === "live" ? "border-yellow-400/30" : "border-zinc-800"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${sp.status === "live" ? "bg-red-500/20 border border-red-500/30" : "bg-zinc-800"}`}>
                        {sp.status === "live" ? <Radio className="w-5 h-5 text-red-400" /> : <Clock className="w-5 h-5 text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {sp.status === "live" && <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>LIVE</span>}
                          {sp.source === "x_sync" && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">𝕏 Synced</span>}
                          <h3 className="font-black text-white">{sp.title}</h3>
                        </div>
                        {sp.description && <p className="text-sm text-zinc-400 mb-2 line-clamp-1">{sp.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                          {sp.host && <span>by <span className="text-yellow-400">{sp.host.username || sp.host.display_name}</span></span>}
                          {sp.status === "live" && <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{sp.listener_count?.toLocaleString()} listening</span>}
                          {sp.scheduled_at && <span className="text-yellow-400 font-medium">{timeUntil(sp.scheduled_at)}</span>}
                          {sp.tags?.map(t => <span key={t} className="bg-zinc-800 px-2 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </div>
                      {(sp.x_space_url || sp.twitter_space_url) && sp.status !== "ended" && (
                        <a href={sp.x_space_url || sp.twitter_space_url} target="_blank" rel="noopener noreferrer"
                          className={`flex-shrink-0 font-bold px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 ${sp.status === "live" ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                          {sp.status === "live" ? "Join" : "Remind"}<ExternalLink className="w-3 h-3"/>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
