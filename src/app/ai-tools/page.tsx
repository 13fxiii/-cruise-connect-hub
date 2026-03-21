"use client";
import AppHeader from '@/components/layout/AppHeader';
import { useState, useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import {
  Sparkles, Copy, Check, Bookmark, BookmarkCheck,
  Wand2, Hash, FileText, MessageSquare, Mic,
  Megaphone, ShoppingBag, Mail, Lightbulb, Loader2
} from "lucide-react";

const TOOLS = [
  { id:"caption",          label:"Caption Writer",     icon:MessageSquare, color:"from-pink-500/20",   border:"border-pink-500/20",   text:"text-pink-400",   desc:"Viral X captions for any topic",         placeholder:"What's your post about? e.g. 'Launching my new music single this Friday'" },
  { id:"post_idea",        label:"Post Ideas",         icon:Lightbulb,     color:"from-yellow-500/20", border:"border-yellow-500/20", text:"text-yellow-400", desc:"5 creative post concepts",               placeholder:"What do you want to talk about? e.g. 'My experience with Lagos traffic'" },
  { id:"thread",           label:"Thread Writer",      icon:FileText,      color:"from-blue-500/20",   border:"border-blue-500/20",   text:"text-blue-400",   desc:"5-tweet thread on any topic",            placeholder:"What's your thread topic? e.g. '5 ways to grow your X account as a Naija creator'" },
  { id:"hashtags",         label:"Hashtag Generator",  icon:Hash,          color:"from-green-500/20",  border:"border-green-500/20",  text:"text-green-400",  desc:"20 trending hashtags instantly",         placeholder:"Describe your content e.g. 'Afrobeats music promotion for Nigerian artist'" },
  { id:"bio",              label:"Bio Writer",         icon:Wand2,         color:"from-purple-500/20", border:"border-purple-500/20", text:"text-purple-400", desc:"3 punchy social media bios",             placeholder:"Describe yourself e.g. 'Music producer from Lagos, beats for Afrobeats artists'" },
  { id:"space_intro",      label:"Space Intro Script", icon:Mic,           color:"from-red-500/20",    border:"border-red-500/20",    text:"text-red-400",    desc:"30-60 sec live space opener",            placeholder:"What's your space about? e.g. 'Discussing how Nigerian artists can get UK deals'" },
  { id:"promo_copy",       label:"Promo Copy",         icon:Megaphone,     color:"from-orange-500/20", border:"border-orange-500/20", text:"text-orange-400", desc:"3 ad copy variations for any offer",     placeholder:"What are you promoting? e.g. 'My online course on social media marketing for ₦15,000'" },
  { id:"merch_description",label:"Merch Description",  icon:ShoppingBag,   color:"from-cyan-500/20",   border:"border-cyan-500/20",   text:"text-cyan-400",   desc:"Product copy that sells",                placeholder:"Describe the merch e.g. 'Black hoodie with CC Hub logo and Lagos skyline design'" },
  { id:"dm_template",      label:"DM Templates",       icon:Mail,          color:"from-indigo-500/20", border:"border-indigo-500/20", text:"text-indigo-400", desc:"3 professional DM scripts",              placeholder:"DM purpose e.g. 'Reaching out to brands for paid collab opportunities'" },
];

export default function AIToolsPage() {
  const { user } = useAuth();
  const [activeTool, setActiveTool]   = useState(TOOLS[0]);
  const [prompt, setPrompt]           = useState("");
  const [result, setResult]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [copied, setCopied]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [history, setHistory]         = useState<any[]>([]);
  const [genId, setGenId]             = useState<string|null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/ai").then(r => r.json()).then(d => setHistory(d.generations || []));
  }, [user, result]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setResult(""); setSaved(false); setGenId(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool_type: activeTool.id, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data.result);
      const h = await fetch("/api/ai").then(r => r.json());
      setHistory(h.generations || []);
      if (h.generations?.[0]) setGenId(h.generations[0].id);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveGen = async () => {
    if (!genId) return;
    await fetch(`/api/ai?id=${genId}`, { method: "PATCH", body: JSON.stringify({ is_saved: true }), headers: { "Content-Type": "application/json" } });
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppHeader title="AI Tools ✨" back />
      
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" /> AI Creator Tools
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Powered by Claude AI — built for CC Hub creators 🚌</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tool selector */}
          <div className="space-y-1.5">
            <div className="text-zinc-500 text-xs font-bold mb-2 px-1">CHOOSE YOUR TOOL</div>
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              const active = activeTool.id === tool.id;
              return (
                <button key={tool.id} onClick={() => { setActiveTool(tool); setResult(""); setPrompt(""); setError(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? `bg-gradient-to-r ${tool.color} border ${tool.border}` : "bg-zinc-950 border border-zinc-800 hover:border-zinc-700"}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? tool.text : "text-zinc-500"}`} />
                  <div>
                    <div className={`font-bold text-xs ${active ? "text-white" : "text-zinc-300"}`}>{tool.label}</div>
                    <div className="text-zinc-600 text-[10px]">{tool.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Generator */}
          <div className="lg:col-span-2 space-y-4">
            {/* Active Tool Header */}
            <div className={`bg-gradient-to-r ${activeTool.color} border ${activeTool.border} rounded-2xl p-4 flex items-center gap-3`}>
              {(() => { const Icon = activeTool.icon; return <Icon className={`w-6 h-6 ${activeTool.text}`} />; })()}
              <div>
                <div className="text-white font-black">{activeTool.label}</div>
                <div className="text-zinc-400 text-xs">{activeTool.desc}</div>
              </div>
            </div>

            {/* Input */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <label className="text-zinc-400 text-xs font-bold">YOUR PROMPT</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={activeTool.placeholder}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none placeholder:text-zinc-600"
              />
              <button
                onClick={generate}
                disabled={loading || !prompt.trim() || !user}
                className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate with AI</>
                )}
              </button>
              {!user && (
                <p className="text-zinc-500 text-xs text-center">
                  <Link href="/auth/login" className="text-yellow-400 hover:underline">Sign in</Link> to use AI tools
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>
            )}

            {/* Result */}
            {result && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                  <span className="text-white font-black text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" /> Result
                  </span>
                  <div className="flex gap-2">
                    <button onClick={saveGen} disabled={saved}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${saved ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-400 hover:text-white bg-zinc-800"}`}>
                      {saved ? <><BookmarkCheck className="w-3 h-3" /> Saved</> : <><Bookmark className="w-3 h-3" /> Save</>}
                    </button>
                    <button onClick={copy}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${copied ? "text-green-400 bg-green-400/10" : "text-zinc-400 hover:text-white bg-zinc-800"}`}>
                      {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                </div>
                <div className="p-4 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">{result}</div>
              </div>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-3 border-b border-zinc-800">
                  <span className="text-zinc-400 text-xs font-bold">RECENT GENERATIONS</span>
                </div>
                <div className="divide-y divide-zinc-800/50 max-h-64 overflow-y-auto">
                  {history.slice(0, 8).map((h: any) => (
                    <button key={h.id} onClick={() => setResult(h.result)}
                      className="w-full flex items-start gap-3 p-3 hover:bg-zinc-900 text-left transition-colors">
                      <div className="text-zinc-600 text-[10px] font-bold bg-zinc-800 px-1.5 py-0.5 rounded mt-0.5 uppercase flex-shrink-0">{h.tool_type}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-zinc-300 text-xs truncate">{h.prompt}</div>
                        <div className="text-zinc-600 text-[10px] mt-0.5">{new Date(h.created_at).toLocaleDateString()}</div>
                      </div>
                      {h.is_saved && <BookmarkCheck className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
