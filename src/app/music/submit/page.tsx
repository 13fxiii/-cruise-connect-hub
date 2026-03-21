"use client";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { Music, ArrowLeft, Send, CheckCircle } from "lucide-react";

const GENRES = ["afrobeats","amapiano","afropop","highlife","rap","rnb","gospel","dancehall","other"];

export default function SubmitTrackPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    artist_name:"", track_title:"", track_url:"", cover_url:"",
    genre:"afrobeats", description:"", instagram:"", twitter:"", apple_music:"",
  });
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");

  const f = (k: string) => (e: any) => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.artist_name || !form.track_title || !form.track_url) {
      setError("Fill all required fields"); return;
    }
    setLoading(true); setError("");
    const res = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        social_links: { instagram: form.instagram, twitter: form.twitter, apple_music: form.apple_music },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setSubmitted(true);
    else setError(data.error || "Submission failed. Try again.");
  };

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Music className="w-12 h-12 text-zinc-700" />
        <p className="text-zinc-400">Sign in to submit your track</p>
        <Link href="/auth/login" className="bg-yellow-400 text-black font-black px-6 py-2.5 rounded-full">Sign In</Link>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-white font-black text-2xl mb-2">Track Submitted! 🎵</h2>
        <p className="text-zinc-400 text-sm mb-6">Our team will review your submission. If approved, it'll be featured in the Artist Hub within 24-48 hours.</p>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left space-y-2 mb-6">
          <div className="text-zinc-400 text-xs font-bold">WHAT HAPPENS NEXT</div>
          {["Admin reviews your track","You get notified on approval","Track goes live in Artist Hub 🚌","Featured submissions get extra promotion"].map((s,i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black text-xs">{i+1}</div>
              {s}
            </div>
          ))}
        </div>
        <Link href="/music" className="bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300">View Artist Hub</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/music" className="text-zinc-500 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="text-xl font-black text-white">Submit Your Track 🎵</h1>
        </div>

        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 mb-5">
          <p className="text-yellow-400 text-xs font-bold">🔥 Get your music in front of 3,000+ CC Hub members. Approved tracks are featured for 7 days minimum.</p>
        </div>

        <form onSubmit={submit} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">Artist Name *</label>
              <input value={form.artist_name} onChange={f("artist_name")} required placeholder="Your stage name"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1.5">Track Title *</label>
              <input value={form.track_title} onChange={f("track_title")} required placeholder="e.g. HARDINARY"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Track URL * <span className="text-zinc-600 font-normal">(Spotify, Apple Music, YouTube, SoundCloud, etc.)</span></label>
            <input value={form.track_url} onChange={f("track_url")} required type="url" placeholder="https://open.spotify.com/track/..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Cover Art URL <span className="text-zinc-600 font-normal">(optional)</span></label>
            <input value={form.cover_url} onChange={f("cover_url")} type="url" placeholder="https://..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Genre *</label>
            <select value={form.genre} onChange={f("genre")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 capitalize">
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-bold block mb-1.5">Track Description</label>
            <textarea value={form.description} onChange={f("description")} rows={3}
              placeholder="Tell the community about this track — what's the vibe?"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none" />
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <div className="text-zinc-400 text-xs font-bold mb-3">SOCIAL LINKS <span className="text-zinc-600 font-normal">(optional — helps fans follow you)</span></div>
            <div className="space-y-2">
              {[
                { k:"instagram",    ph:"https://instagram.com/yourusername" },
                { k:"twitter",      ph:"https://x.com/yourusername"         },
                { k:"apple_music",  ph:"https://music.apple.com/..."         },
              ].map(({ k, ph }) => (
                <input key={k} value={(form as any)[k]} onChange={f(k)} type="url" placeholder={ph}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
              ))}
            </div>
          </div>

          <p className="text-zinc-600 text-xs">By submitting, you confirm this is your original work and you have all rights to distribute it.</p>

          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 disabled:opacity-40 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> {loading ? "Submitting..." : "Submit Track for Review"}
          </button>
        </form>
      </main>
    </div>
  );
}
