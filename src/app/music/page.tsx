// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, ExternalLink, Upload, Loader2, Music2, Radio, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

const GENRES = ['all','afrobeats','amapiano','afropop','highlife','rap','rnb','gospel'];

const STATIONS = [
  { id:'afrobeats',label:'Afrobeats 🔥',    url:'https://stream.zeno.fm/f3wvbbqmdg8uv',color:'from-orange-500 to-red-600' },
  { id:'amapiano', label:'Amapiano 🎹',      url:'https://stream.zeno.fm/f3wvbbqmdg8uv',color:'from-blue-500 to-purple-600' },
  { id:'naija',    label:'Old Skool 🇳🇬',     url:'https://stream.zeno.fm/f3wvbbqmdg8uv',color:'from-green-500 to-emerald-600' },
  { id:'ccradio',  label:'CC Hub Radio 🚌',  url:'https://stream.zeno.fm/f3wvbbqmdg8uv',color:'from-yellow-500 to-amber-600' },
];

const PLAYLIST_LINKS = [
  { label: "Spotify", url: "https://open.spotify.com/search/cruise%20connect" },
  { label: "Apple Music", url: "https://music.apple.com" },
  { label: "Audiomack", url: "https://audiomack.com" },
  { label: "Boomplay", url: "https://www.boomplay.com" },
  { label: "YouTube Music", url: "https://music.youtube.com" },
];

export default function MusicPage() {
  const { user }           = useAuth();
  const [tab, setTab]      = useState<'tracks'|'radio'|'submit'>('tracks');
  const [tracks, setTracks]= useState<any[]>([]);
  const [genre, setGenre]  = useState('all');
  const [loading, setLd]   = useState(false);
  const [liked, setLiked]  = useState<Set<string>>(new Set());
  const [playing, setPlay] = useState<string|null>(null);
  const [station, setStn]  = useState<string|null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  const loadTracks = async (g: string) => {
    setLd(true);
    try {
      const r = await fetch(`/api/music?genre=${g}&limit=30`);
      const d = await r.json();
      setTracks(d.tracks || []);
    } catch {}
    setLd(false);
  };

  useEffect(() => { loadTracks(genre); }, [genre]);

  useEffect(() => {
    if (!user) return;
    supabase.from('music_likes').select('track_id').eq('user_id', user.id)
      .then(({ data }) => setLiked(new Set((data || []).map((l: any) => l.track_id))));
  }, [user]);

  const togglePlay = (trackId: string, url: string) => {
    if (playing === trackId) {
      audioRef.current?.pause(); setPlay(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setPlay(null);
      setPlay(trackId);
      fetch(`/api/music/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ track_id: trackId }) }).catch(() => {});
    }
  };

  const toggleLike = async (trackId: string) => {
    const isLiked = liked.has(trackId);
    setLiked(prev => { const s = new Set(prev); isLiked ? s.delete(trackId) : s.add(trackId); return s; });
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, likes: (t.likes || 0) + (isLiked ? -1 : 1) } : t));
    if (isLiked) {
      await supabase.from('music_likes').delete().match({ user_id: user?.id, track_id: trackId });
    } else {
      await supabase.from('music_likes').upsert({ user_id: user?.id, track_id: trackId });
    }
  };

  const playStation = (id: string, url: string) => {
    if (station === id) {
      audioRef.current?.pause(); setStn(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play().catch(() => {});
      setStn(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Cruise Connect Music" back />

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 mb-4 bg-zinc-900 p-1 rounded-2xl">
        {[['tracks','🎵 Tracks'],['radio','📻 Radio'],['submit','⬆️ Submit']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${tab === t ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5">
        <p className="text-zinc-200 text-xs font-black tracking-wide mb-2">CRUISE CONNECT PLAYLIST LINKS</p>
        <div className="flex flex-wrap gap-2">
          {PLAYLIST_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-full border border-zinc-700 text-zinc-200 text-xs hover:border-yellow-400/40 hover:text-yellow-400"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Tracks tab */}
      {tab === 'tracks' && (
        <div className="max-w-lg mx-auto">
          {/* Genre pills */}
          <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-none">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  genre === g ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                {g}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3">🎵</div>
              <p className="text-white font-bold mb-1">No tracks yet</p>
              <p className="text-zinc-500 text-sm mb-4">Submit your music to get featured</p>
              <button onClick={() => setTab('submit')} className="px-5 py-2 bg-yellow-400 text-black font-black text-sm rounded-full">Submit Track</button>
            </div>
          ) : (
            <div className="px-4 space-y-2">
              {tracks.map(track => (
                <TrackCard key={track.id} track={track} playing={playing === track.id}
                  liked={liked.has(track.id)} onPlay={togglePlay} onLike={toggleLike} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Radio tab */}
      {tab === 'radio' && (
        <div className="max-w-lg mx-auto px-4 space-y-3">
          {STATIONS.map(s => (
            <button key={s.id} onClick={() => playStation(s.id, s.url)}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  {station === s.id ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white fill-white" />}
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-sm">{s.label}</p>
                  <p className={`text-xs ${station === s.id ? 'text-yellow-400' : 'text-zinc-500'}`}>
                    {station === s.id ? '● Playing' : 'Tap to play'}
                  </p>
                </div>
              </div>
              {station === s.id && <div className="flex gap-0.5 items-end h-5">{[3,5,4,6,3,5,4].map((h,i) => (
                <div key={i} className="w-1 bg-yellow-400 rounded-full animate-bounce" style={{ height:`${h*3}px`, animationDelay:`${i*0.1}s` }} />
              ))}</div>}
            </button>
          ))}
        </div>
      )}

      {/* Submit tab */}
      {tab === 'submit' && (
        <div className="max-w-lg mx-auto px-4">
          <SubmitForm user={user} onSuccess={() => { setTab('tracks'); loadTracks(genre); }} />
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function TrackCard({ track, playing, liked, onPlay, onLike }: any) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
        {track.cover_url ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>}
        {track.audio_url && (
          <button onClick={() => onPlay(track.id, track.audio_url)}
            className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {playing ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white" />}
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{track.title}</p>
        <p className="text-zinc-500 text-xs truncate">{track.artist_name || track.profiles?.display_name}</p>
        {playing && <div className="flex gap-0.5 mt-0.5">{[2,4,3,5,3].map((h,i) => (
          <div key={i} className="w-0.5 bg-yellow-400 rounded-full animate-bounce" style={{ height:`${h*2}px`, animationDelay:`${i*0.1}s` }} />
        ))}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-zinc-600">{(track.plays || track.play_count || 0).toLocaleString()}</span>
        <button onClick={() => onLike(track.id)} className={`p-1.5 ${liked ? 'text-red-400' : 'text-zinc-500'}`}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}

function SubmitForm({ user, onSuccess }: any) {
  const [f, setF] = useState({ title: '', artist: '', genre: 'afrobeats', audio_url: '', cover_url: '', bio: '' });
  const [loading, setLd] = useState(false);
  const [done, setDone]  = useState(false);
  const supabase = createClient();

  const submit = async () => {
    if (!f.title.trim() || !f.artist.trim() || !f.audio_url.trim()) return;
    setLd(true);
    const { error: subErr } = await supabase.from('music_submissions').insert({
      user_id: user?.id, title: f.title, artist_name: f.artist,
      genre: f.genre, audio_url: f.audio_url, cover_url: f.cover_url || null, bio: f.bio,
    });
    setLd(false);
    if (subErr) { alert("Submit failed: " + subErr.message); return; }
    setDone(true);
    setTimeout(onSuccess, 1500);
  };

  if (done) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎉</div>
      <p className="text-white font-black text-xl mb-2">Submitted!</p>
      <p className="text-zinc-400 text-sm">Your track is under review</p>
    </div>
  );

  if (!user) return (
    <div className="text-center py-12">
      <p className="text-white font-bold mb-2">Sign in to submit</p>
      <Link href="/auth/login" className="px-5 py-2 bg-yellow-400 text-black font-black rounded-full text-sm">Sign In</Link>
    </div>
  );

  const inp = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50";

  return (
    <div className="space-y-3 pb-6">
      <p className="text-zinc-400 font-bold text-xs tracking-wider mb-4">SUBMIT YOUR TRACK</p>
      <input className={inp} placeholder="Track title *" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      <input className={inp} placeholder="Artist name *" value={f.artist} onChange={e => setF({ ...f, artist: e.target.value })} />
      <select className={inp} value={f.genre} onChange={e => setF({ ...f, genre: e.target.value })}>
        {GENRES.filter(g => g !== 'all').map(g => <option key={g} value={g} className="bg-zinc-900 capitalize">{g}</option>)}
      </select>
      <input className={inp} placeholder="Audio URL (SoundCloud / Audiomack) *" value={f.audio_url} onChange={e => setF({ ...f, audio_url: e.target.value })} />
      <input className={inp} placeholder="Cover image URL (optional)" value={f.cover_url} onChange={e => setF({ ...f, cover_url: e.target.value })} />
      <textarea className={`${inp} resize-none`} rows={3} placeholder="Short bio or description..." value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} />
      <button onClick={submit} disabled={!f.title || !f.artist || !f.audio_url || loading}
        className="w-full py-3.5 bg-yellow-400 text-black font-black text-sm rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {loading ? 'Submitting…' : 'Submit Track'}
      </button>
    </div>
  );
}
