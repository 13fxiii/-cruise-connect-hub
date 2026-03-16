"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Search, Users, FileText, Music, ShoppingBag, TrendingUp, X, Loader2 } from "lucide-react";

const TABS = [
  { id:"all",         label:"All",         icon:Search       },
  { id:"users",       label:"People",      icon:Users        },
  { id:"posts",       label:"Posts",       icon:FileText     },
  { id:"music",       label:"Music",       icon:Music        },
  { id:"marketplace", label:"Marketplace", icon:ShoppingBag  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  user:        { icon:"👤", color:"bg-blue-500/20 text-blue-400"   },
  post:        { icon:"📝", color:"bg-zinc-700/40 text-zinc-400"   },
  music:       { icon:"🎵", color:"bg-pink-500/20 text-pink-400"   },
  marketplace: { icon:"🛒", color:"bg-green-500/20 text-green-400" },
};

const TRENDING = ["#Afrobeats","#NaijaMusic","#CCHub","#BigCruise","#AfroArtists","#GamingNaija","#NaijaTwitter","#CruiseVibes"];

export default function SearchPage() {
  const [query, setQuery]     = useState("");
  const [tab, setTab]         = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const debounceRef           = useRef<NodeJS.Timeout>();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${tab}`);
      const data = await res.json();
      setResults(data.results || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, tab]);

  const filtered = tab === "all" ? results : results.filter(r => r.type === tab);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search members, posts, music, marketplace..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-12 pr-10 py-3.5 text-white text-sm outline-none focus:border-yellow-400 transition-colors"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                  active ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}>
                <Icon className="w-3 h-3" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
          </div>
        )}

        {/* Results */}
        {!loading && query.length >= 2 && (
          filtered.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No results for "{query}"</p>
              <p className="text-zinc-700 text-xs mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Group by type */}
              {["user","post","music","marketplace"].map(type => {
                const group = filtered.filter(r => r.type === type);
                if (group.length === 0) return null;
                const cfg = TYPE_CONFIG[type];
                const labels: Record<string, string> = { user:"PEOPLE", post:"POSTS", music:"MUSIC", marketplace:"MARKETPLACE" };
                return (
                  <div key={type}>
                    <div className="text-zinc-600 text-[10px] font-black px-1 mb-1.5 mt-3">{labels[type]}</div>
                    {group.map(r => (
                      <Link key={r.id} href={r.link}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all mb-1.5">
                        {/* Avatar / Icon */}
                        {r.avatar ? (
                          <img src={r.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${cfg.color}`}>
                            {cfg.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm truncate">{r.title}</div>
                          {r.subtitle && <div className="text-zinc-500 text-xs mt-0.5 truncate">{r.subtitle}</div>}
                        </div>
                        {r.meta && (
                          <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>{r.meta}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Trending / Empty state */}
        {!query && (
          <div className="space-y-6 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-black text-sm">Trending in CC Hub</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(tag => (
                  <button key={tag} onClick={() => setQuery(tag.replace('#', ''))}
                    className="bg-zinc-900 border border-zinc-800 text-yellow-400 text-xs font-bold px-3 py-2 rounded-full hover:bg-zinc-800 transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white font-black text-sm mb-3">🔍 Search across</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon:"👤", label:"3,000+ Members",    sub:"Find community members", q:"" },
                  { icon:"🎵", label:"Artist Hub Tracks",  sub:"Naija music discovery",  q:"" },
                  { icon:"🛒", label:"Marketplace Listings",sub:"Buy beats, services",   q:"" },
                  { icon:"📝", label:"Community Posts",    sub:"Browse the feed",        q:"" },
                ].map(item => (
                  <div key={item.label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-700 transition-all">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-white font-black text-sm">{item.label}</div>
                    <div className="text-zinc-600 text-xs mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
