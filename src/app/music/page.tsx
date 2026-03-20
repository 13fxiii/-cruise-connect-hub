// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Music2, Radio, ExternalLink, Heart, Play, Loader2, Plus, TrendingUp, Upload } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const GENRES = ['all','afrobeats','amapiano','afropop','highlife','rap','rnb','gospel'];

const STATIONS = [
  { id:'afrobeats', label:'Afrobeats 🔥',     url:'https://stream.zeno.fm/f3wvbbqmdg8uv', color:'from-orange-500 to-red-600' },
  { id:'amapiano',  label:'Amapiano 🎹',       url:'https://stream.zeno.fm/f3wvbbqmdg8uv', color:'from-blue-500 to-purple-600' },
  { id:'naija',     label:'Old Skool Naija 🇳🇬', url:'https://stream.zeno.fm/f3wvbbqmdg8uv', color:'from-green-500 to-emerald-600' },
  { id:'ccradio',   label:'CC Hub Radio 🚌',   url:'https://stream.zeno.fm/f3wvbbqmdg8uv', color:'from-yellow-500 to-amber-600' },
];

export default function MusicPage() {
  const { user }           = useAuth();
  const [tab, setTab]      = useState<'artists'|'radio'|'submit'>('artists');
  const [tracks, setTracks]= useState<any[]>([]);
  const [genre, setGenre]  = useState('all');
  const [loading, setLd]   = useState(false);
  const [likedTx, setLiked]= useState<Set<string>>(new Set());
  const [station, setStn]  = useState<string|null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (tab !== 'artists') return;
    setLd(true);
    fetch(`/api/artists?genre=${genre}`)
      .then(r => r.json())
      .then(d => { setTracks(d.tracks || []); setLd(false); });
  }, [genre, tab]);

  const likeTrack = async (id: string) => {
    if (!user) { window.location.href = '/auth/login'; return; }
    await fetch(`/api/artists/${id}`, { method:'POST', body: JSON.stringify({ action:'like' }), headers:{'Content-Type':'application/json'} });
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const playTrack = (id: string) => {
    fetch(`/api/artists/${id}`, { method:'POST', body: JSON.stringify({ action:'play' }), headers:{'Content-Type':'application/json'} });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <Music2 className="w-7 h-7 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-black text-white">CC Hub Music〽️</h1>
            <p className="text-zinc-500 text-xs">Discover · Listen · Support</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
          {[
            { id:'artists', label:'🎵 Artists' },
            { id:'radio',   label:'📻 Radio'   },
            { id:'submit',  label:'📤 Submit'  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ARTISTS TAB ── */}
        {tab === 'artists' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${genre===g ? 'bg-yellow-400 text-black' : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'}`}>
                  {g === 'all' ? 'All Genres' : g.charAt(0).toUpperCase()+g.slice(1)}
                </button>
              ))}
            </div>

            {/* ThrillSeekaEnt featured card — always shown */}
            <div className="bg-gradient-to-br from-yellow-400/15 via-amber-400/5 to-zinc-900 border border-yellow-400/30 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 flex items-center justify-center text-3xl border border-yellow-400/20">🎵</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black">Lil Miss Thrill Seeker</p>
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">FEATURED</span>
                  </div>
                  <p className="text-zinc-400 text-xs">@ThrillSeekaEnt · Afrobeats · Afropop</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {['HARDINARY','JUMP ROPE','SPEAKEASY'].map(title => (
                  <div key={title} className="bg-zinc-900/60 rounded-xl p-2.5 text-center">
                    <p className="text-yellow-400 text-xs font-bold truncate">{title}</p>
                    <p className="text-zinc-600 text-xs">Single</p>
                  </div>
                ))}
              </div>

              <a href="https://linktr.ee/ThrillSeekerEnt" target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
                <ExternalLink className="w-4 h-4" /> Listen · Follow · Share
              </a>
              <p className="text-center text-zinc-600 text-xs mt-2">If you love discovering music before it blows, this is for you 👀🔥</p>
            </div>

            {/* DB tracks */}
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 text-yellow-400 animate-spin" /></div>
            ) : tracks.length > 0 ? (
              <div className="space-y-2">
                {tracks.map((t: any) => (
                  <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 hover:border-zinc-700 transition-colors">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {t.cover_url ? <img src={t.cover_url} className="w-full h-full rounded-xl object-cover" alt="" /> : '🎤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{t.title}</p>
                      <p className="text-zinc-500 text-xs">{t.artist_name} · {t.genre}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => likeTrack(t.id)}
                        className={`p-1.5 rounded-lg transition-colors ${likedTx.has(t.id) ? 'text-pink-400 bg-pink-400/10' : 'text-zinc-500 hover:text-pink-400'}`}>
                        <Heart className="w-4 h-4" />
                      </button>
                      {t.external_link && (
                        <a href={t.external_link} target="_blank" rel="noreferrer" onClick={() => playTrack(t.id)}
                          className="text-yellow-400 hover:text-yellow-300 p-1.5 rounded-lg bg-yellow-400/10">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No tracks for this genre yet — <Link href="/music/submit" className="text-yellow-400 hover:underline">submit yours</Link>
              </div>
            )}
          </>
        )}

        {/* ── RADIO TAB ── */}
        {tab === 'radio' && (
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm mb-4">Tune into CC Hub radio stations 📻</p>
            {STATIONS.map(s => (
              <div key={s.id} className={`bg-gradient-to-r ${s.color} p-px rounded-2xl`}>
                <div className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-black">{s.label}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{station === s.id ? '▶ Now playing' : 'Tap to tune in'}</p>
                  </div>
                  <button onClick={() => setStn(station === s.id ? null : s.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${station === s.id ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                    {station === s.id ? '⏸' : '▶'}
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-4">
              <p className="text-zinc-400 text-xs text-center">
                🎙️ Want to host a live audio space?{' '}
                <Link href="/spaces" className="text-yellow-400 hover:underline">Go to Spaces →</Link>
              </p>
            </div>
          </div>
        )}

        {/* ── SUBMIT TAB ── */}
        {tab === 'submit' && (
          <div className="space-y-4">
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white font-black">Submit Your Music</p>
                  <p className="text-zinc-400 text-xs">Get featured in front of the CC Hub community</p>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {['Get featured on the Artists tab','Reach 3,000+ active community members','Drive streams & followers to your profiles','Direct link to your Spotify/Apple/Linktree'].map(b => (
                  <li key={b} className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="text-yellow-400">✓</span> {b}
                  </li>
                ))}
              </ul>
              <Link href="/music/submit"
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors text-sm">
                <Plus className="w-4 h-4" /> Submit Now — It's Free
              </Link>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">📋 What we need</p>
              <ul className="space-y-1 text-zinc-500 text-xs">
                <li>• Track title, artist name & genre</li>
                <li>• Link to your music (Spotify, Apple, Audiomack, etc.)</li>
                <li>• Your X / Instagram handle</li>
                <li>• Short bio (optional)</li>
              </ul>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
