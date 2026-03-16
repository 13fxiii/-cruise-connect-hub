"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Mic, Lightbulb, Calendar, RefreshCw, Copy, Check, ExternalLink, Radio } from "lucide-react";

export default function ModeratorDashboard() {
  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMod, setIsMod]     = useState(false);
  const [topics, setTopics]   = useState<any[]>([]);
  const [spaces, setSpaces]   = useState<any[]>([]);
  const [theme, setTheme]     = useState<any>(null);
  const [copied, setCopied]   = useState<string|null>(null);
  const [showNewSpace, setShowNewSpace] = useState(false);
  const [newSpace, setNewSpace] = useState({ title:"", description:"", x_space_url:"", scheduled_at:"" });
  const [loading, setLoading] = useState(true);
  const router                = useRouter();
  const supabase              = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);

      // Check mod status
      const { data: mod } = await supabase.from("moderators").select("role,permissions").eq("user_id", user.id).single();
      if (!mod) { router.push("/feed"); return; }
      setIsMod(true);

      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);

      // Fetch today's theme + topic suggestions
      const res = await fetch("/api/daily-theme");
      const d = await res.json();
      setTheme(d.theme);
      setTopics(d.topics || []);

      // Fetch live spaces
      const sRes = await fetch("/api/spaces");
      const sData = await sRes.json();
      setSpaces(sData.spaces || []);

      setLoading(false);
    };
    init();
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const createSpace = async () => {
    if (!newSpace.title) return;
    setLoading(true);
    await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSpace),
    });
    setNewSpace({ title:"", description:"", x_space_url:"", scheduled_at:"" });
    setShowNewSpace(false);
    const res = await fetch("/api/spaces");
    const d = await res.json();
    setSpaces(d.spaces || []);
    setLoading(false);
  };

  const syncXSpaces = async () => {
    await fetch("/api/spaces/sync", {
      method: "POST",
      headers: { Authorization: "Bearer cchub-cron-2026" },
    });
    const res = await fetch("/api/spaces");
    const d = await res.json();
    setSpaces(d.spaces || []);
  };

  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-yellow-400 font-bold">Loading Mod Dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Moderator Hub 🎙️</h1>
            <p className="text-zinc-400 text-sm">Welcome back, {profile?.display_name} 👋</p>
          </div>
          <button onClick={syncXSpaces}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold px-3 py-2 rounded-xl hover:bg-zinc-800">
            <RefreshCw className="w-3.5 h-3.5" /> Sync X Spaces
          </button>
        </div>

        {/* Today's Theme */}
        {theme && (
          <div className="bg-gradient-to-r from-yellow-400/10 via-zinc-900 to-zinc-900 border border-yellow-400/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{theme.theme_emoji}</span>
              <div>
                <div className="text-yellow-400 font-black text-lg">{theme.theme_name}</div>
                <div className="text-zinc-400 text-xs">{DAYS[new Date().getDay()]} · #{theme.hashtag?.replace('#','')}</div>
              </div>
              <div className="ml-auto bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-3 py-1 text-yellow-400 text-xs font-bold">TODAY</div>
            </div>
            <p className="text-zinc-300 text-sm mb-4">{theme.description}</p>
            <div className="grid gap-2">
              {(theme.activities || []).map((act: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-black text-yellow-400">{i+1}</div>
                  <div>
                    <div className="text-white font-bold text-sm">{act.title}</div>
                    <div className="text-zinc-500 text-xs">{act.description}</div>
                  </div>
                  <div className="ml-auto bg-zinc-700 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">{act.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Space Topic Suggestions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-black text-lg">Space Topic Suggestions</h2>
          </div>
          <p className="text-zinc-500 text-xs mb-4">Curated topics for today's theme — tap to copy for your space</p>
          <div className="space-y-3">
            {topics.map((t: any) => (
              <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{t.title}</div>
                  <div className="text-zinc-500 text-xs mt-1">{t.description}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {(t.tags || []).map((tag: string) => (
                      <span key={tag} className="bg-zinc-800 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => copy(t.title, t.id)}
                  className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    copied === t.id ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}>
                  {copied === t.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Spaces */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-yellow-400" />
              <h2 className="text-white font-black text-lg">Live & Scheduled Spaces</h2>
            </div>
            <button onClick={() => setShowNewSpace(!showNewSpace)}
              className="bg-yellow-400 text-black text-xs font-black px-3 py-1.5 rounded-xl hover:bg-yellow-300">
              + Host Space
            </button>
          </div>

          {showNewSpace && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3">
              <h3 className="text-white font-bold text-sm">Create a Space</h3>
              <input value={newSpace.title} onChange={e => setNewSpace(p=>({...p,title:e.target.value}))}
                placeholder="Space title *" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400" />
              <input value={newSpace.description} onChange={e => setNewSpace(p=>({...p,description:e.target.value}))}
                placeholder="Description" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400" />
              <input value={newSpace.x_space_url} onChange={e => setNewSpace(p=>({...p,x_space_url:e.target.value}))}
                placeholder="X Space URL (if already created on X)" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400" />
              <input type="datetime-local" value={newSpace.scheduled_at} onChange={e => setNewSpace(p=>({...p,scheduled_at:e.target.value}))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400" />
              <div className="flex gap-2">
                <button onClick={createSpace} disabled={!newSpace.title}
                  className="flex-1 bg-yellow-400 text-black font-black py-2 rounded-xl disabled:opacity-40">
                  Create Space
                </button>
                <button onClick={() => setShowNewSpace(false)}
                  className="px-4 bg-zinc-800 text-zinc-400 font-bold py-2 rounded-xl hover:bg-zinc-700">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {spaces.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-600 text-sm">No live or scheduled spaces</p>
              <p className="text-zinc-700 text-xs mt-1">Create one above or sync from X</p>
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === "live" ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{s.title}</div>
                    <div className="text-zinc-500 text-xs">
                      {s.status === "live" ? `🔴 LIVE · ${s.listener_count} listeners` : `⏰ ${new Date(s.scheduled_at).toLocaleString()}`}
                      {s.source === "x_sync" && <span className="ml-2 text-blue-400">· Synced from X</span>}
                    </div>
                  </div>
                  {s.x_space_url && (
                    <a href={s.x_space_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2 py-1 rounded-lg">
                      <ExternalLink className="w-3 h-3" /> Open on X
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
