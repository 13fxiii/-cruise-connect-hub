// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Users, FileText, Music, ShoppingBag } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const TABS = [
  { id: 'all',   label: 'All' },
  { id: 'users', label: '👤 People' },
  { id: 'posts', label: '📝 Posts' },
  { id: 'music', label: '🎵 Music' },
];

const TRENDING = ['#Afrobeats','#NaijaMusic','#CCHub','#BigCruise','#AfroArtists','#GamingNaija'];

export default function SearchPage() {
  const [query, setQ]     = useState('');
  const [tab, setTab]     = useState('all');
  const [results, setRes] = useState<any[]>([]);
  const [loading, setLd]  = useState(false);
  const inputRef          = useRef<HTMLInputElement>(null);
  const timer             = useRef<NodeJS.Timeout>();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim()) { setRes([]); return; }
    setLd(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${tab}`);
        const d = await r.json();
        setRes(d.results || []);
      } catch {}
      setLd(false);
    }, 400);
  }, [query, tab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Search bar header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
            placeholder="Search people, posts, music…"
            value={query}
            onChange={e => setQ(e.target.value)}
          />
          {query && (
            <button onClick={() => setQ('')} className="text-zinc-500 shrink-0 p-0.5">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {query && (
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === t.id ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {!query ? (
          /* Trending */
          <div className="px-4 pt-5">
            <p className="text-zinc-400 font-bold text-xs tracking-wider mb-3">TRENDING</p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(tag => (
                <button key={tag} onClick={() => setQ(tag.slice(1))}
                  className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-300 font-medium active:bg-zinc-800">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-white font-bold">No results for "{query}"</p>
            <p className="text-zinc-500 text-sm mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 mt-2">
            {results.map((r, i) => <ResultRow key={i} result={r} />)}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function ResultRow({ result }: { result: any }) {
  if (result.type === 'user') return (
    <Link href={`/profile/${result.username}`} className="flex items-center gap-3 px-4 py-3 active:bg-zinc-900/60">
      {result.avatar_url
        ? <img src={result.avatar_url} className="w-10 h-10 rounded-full object-cover shrink-0" alt={result.display_name} />
        : <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-zinc-400">{(result.display_name || result.username || '?')[0].toUpperCase()}</span></div>}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{result.display_name || result.username}</p>
        <p className="text-zinc-500 text-xs">@{result.username}</p>
      </div>
      <span className="text-[10px] text-zinc-600">{result.followers_count || 0} followers</span>
    </Link>
  );

  if (result.type === 'post') return (
    <Link href={`/posts/${result.id}`} className="flex gap-3 px-4 py-3 active:bg-zinc-900/60">
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm line-clamp-2">{result.content}</p>
        <p className="text-zinc-500 text-xs mt-0.5">@{result.username} · {result.likes_count || 0} likes</p>
      </div>
    </Link>
  );

  if (result.type === 'music') return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
        {result.cover_url ? <img src={result.cover_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{result.title}</p>
        <p className="text-zinc-500 text-xs">{result.artist_name}</p>
      </div>
      <span className="text-[10px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full">🎵</span>
    </div>
  );

  return null;
}
