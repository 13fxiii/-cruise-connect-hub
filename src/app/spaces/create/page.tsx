"use client";
import { useState } from "react";
import { Mic, Radio, Calendar, Tag, Link, ArrowLeft, CheckCircle, Zap, Clock } from "lucide-react";

import Link2 from "next/link";

const TAGS = ["Music","Afrobeats","Gaming","Business","Trivia","Movies","Discussion","Giveaway","Tech","Naija Culture"];

export default function CreateSpacePage() {
  const [form, setForm] = useState({
    title:"", description:"", twitter_space_url:"", type:"live", scheduled_at:"", tags:[] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const toggleTag = (t: string) => {
    setForm(p => ({...p, tags: p.tags.includes(t) ? p.tags.filter(x=>x!==t) : [...p.tags,t]}));
  };

  const submit = async () => {
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setLoading(true); setErr("");
    try {
      const payload = {
        ...form,
        scheduled_at: form.type === "scheduled" ? form.scheduled_at : null,
      };
      const res = await fetch("/api/spaces", {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch { setErr("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400"/>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Space Created!</h2>
        <p className="text-zinc-400 mb-8">Your space is live in the community hub. Share your X Space link so members can join.</p>
        <Link2 href="/spaces" className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
          Back to Spaces
        </Link2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link2 href="/spaces" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4"/> Back to Spaces
        </Link2>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
            <Mic className="w-5 h-5 text-yellow-400"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Host a Space</h1>
            <p className="text-zinc-400 text-sm">List your X Space on the C&C Hub community board</p>
          </div>
        </div>

        {/* Live vs Scheduled */}
        <div className="flex gap-3 mb-6">
          {[{id:"live",label:"🔴 Going Live Now",icon:Radio},{id:"scheduled",label:"📅 Schedule for Later",icon:Clock}].map(({id,label}) => (
            <button key={id} onClick={()=>setForm(p=>({...p,type:id}))}
              className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${form.type===id ? "bg-yellow-400/10 border-yellow-400 text-yellow-400" : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">Space Title *</label>
            <input type="text" placeholder="e.g. Afrobeats Friday Vibes 🎵"
              value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">Description</label>
            <textarea rows={3} placeholder="What's the vibe? What will you talk about?"
              value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600 resize-none"/>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">X Space Link</label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
              <input type="url" placeholder="https://x.com/i/spaces/..."
                value={form.twitter_space_url} onChange={e=>setForm(p=>({...p,twitter_space_url:e.target.value}))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-600"/>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Start your X Space first, then paste the link here</p>
          </div>

          {form.type === "scheduled" && (
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Scheduled Date & Time</label>
              <input type="datetime-local"
                value={form.scheduled_at} onChange={e=>setForm(p=>({...p,scheduled_at:e.target.value}))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 transition-colors"/>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-400 mb-3 font-medium">Tags (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button key={t} onClick={()=>toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.tags.includes(t) ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {err && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{err}</p>}

          <button onClick={submit} disabled={loading}
            className="w-full bg-yellow-400 text-black font-black py-4 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base">
            {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Creating...</>
              : <><Zap className="w-5 h-5"/> {form.type==="live"?"Go Live on Hub 🔴":"Schedule Space 📅"}</>}
          </button>

          <p className="text-xs text-zinc-500 text-center">
            Your space will appear in the community board so members can find and join.
          </p>
        </div>
      </main>
    </div>
  );
}
