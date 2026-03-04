"use client";
import { useState, useEffect } from "react";
import { Mic, Radio, Clock, Users, ExternalLink, Plus, RefreshCw, Tag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

type Space = { id:string; title:string; description?:string; status:string; listener_count:number; twitter_space_url?:string; tags?:string[]; scheduled_at?:string; host?:{username:string;display_name:string}; };

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime()-Date.now();
  if(diff<0) return "Starting soon";
  const h = Math.floor(diff/3600000); const m = Math.floor((diff%3600000)/60000);
  return h>0?`in ${h}h ${m}m`:`in ${m}m`;
}

export default function SpacesPage() {
  const [tab, setTab] = useState<"live"|"scheduled"|"ended">("live");
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

  useEffect(() => { load(tab); }, [tab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar/>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3"><Mic className="text-yellow-400 w-8 h-8"/> Spaces</h1>
            <p className="text-zinc-400 mt-1">Live & scheduled audio rooms — powered by X Spaces</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>load(tab)} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"><RefreshCw className="w-4 h-4"/></button>
            <Link href="/spaces/create" className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4"/> Host Space
            </Link>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {[{id:"live",label:"🔴 Live"},{id:"scheduled",label:"📅 Scheduled"},{id:"ended",label:"✅ Ended"}].map(({id,label})=>(
            <button key={id} onClick={()=>setTab(id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab===id?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl h-28 animate-pulse"/>)}</div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            {tab==="live"?"No live spaces right now. Check back soon! 🔴":tab==="scheduled"?"No scheduled spaces yet.":"No ended spaces."}
          </div>
        ) : (
          <div className="space-y-3">
            {spaces.map(sp=>(
              <div key={sp.id} className={`bg-zinc-900 border rounded-xl p-5 transition-all hover:border-yellow-400/30 ${sp.status==="live"?"border-yellow-400/30":"border-zinc-800"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${sp.status==="live"?"bg-red-500/20 border border-red-500/30":"bg-zinc-800"}`}>
                    {sp.status==="live"?<Radio className="w-5 h-5 text-red-400"/>:<Clock className="w-5 h-5 text-zinc-400"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {sp.status==="live"&&<span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>LIVE</span>}
                      <h3 className="font-black text-white">{sp.title}</h3>
                    </div>
                    {sp.description && <p className="text-sm text-zinc-400 mb-2 line-clamp-1">{sp.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                      {sp.host&&<span>hosted by <span className="text-yellow-400">{sp.host.username||sp.host.display_name}</span></span>}
                      {sp.status==="live"&&<span className="flex items-center gap-1"><Users className="w-3 h-3"/>{sp.listener_count?.toLocaleString()} listening</span>}
                      {sp.scheduled_at&&<span className="text-yellow-400 font-medium">{timeUntil(sp.scheduled_at)}</span>}
                      {sp.tags?.map(t=><span key={t} className="bg-zinc-800 px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  </div>
                  {sp.twitter_space_url&&sp.status!=="ended"&&(
                    <a href={sp.twitter_space_url} target="_blank" rel="noopener noreferrer"
                      className={`flex-shrink-0 font-bold px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 ${sp.status==="live"?"bg-yellow-400 text-black hover:bg-yellow-300":"bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                      {sp.status==="live"?"Join":"Remind"}<ExternalLink className="w-3 h-3"/>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
