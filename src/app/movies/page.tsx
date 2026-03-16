"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  Play, X, Star, Users, Clock, Calendar, Film,
  ExternalLink, ChevronRight, Tv, PartyPopper, Vote, Search, Filter
} from "lucide-react";

/* ──────────── MOVIE DATA ──────────────────────────────────────
   youtube_id: Official trailers / free full films on YouTube
   full_youtube_id: Full movie if legally on YouTube (public domain / official upload)
   For members to watch FULL movies, you point them to Netflix/Prime links
   But trailers + some full free films play IN-APP via YouTube embed
────────────────────────────────────────────────────────────── */
const MOVIES = [
  {
    id:"1", title:"Coming to America", year:1988, genre:"Comedy", rating:7.7,
    duration:"116 min", cover:"👑", country:"Nigeria/USA",
    desc:"An African prince comes to America to find a bride of his own choosing.",
    youtube_id:"oN7YzrLKpW0",        // Official trailer
    full_youtube_id:"oN7YzrLKpW0",   // Replace with actual free full-movie ID if available
    has_full: false,
    stream_link:"https://www.primevideo.com",
    stream_label:"Watch on Prime",
    tags:["Classic","Naija-Vibes","Comedy"]
  },
  {
    id:"2", title:"Black Panther", year:2018, genre:"Action/Sci-Fi", rating:7.3,
    duration:"134 min", cover:"🐾", country:"USA (Africa-inspired)",
    desc:"T'Challa returns to Wakanda to claim his throne but faces a challenger.",
    youtube_id:"xjDjIWPwcPU",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.disneyplus.com",
    stream_label:"Watch on Disney+",
    tags:["Action","Africa","Superhero"]
  },
  {
    id:"3", title:"Half of a Yellow Sun", year:2013, genre:"Drama", rating:6.6,
    duration:"111 min", cover:"🌅", country:"Nigeria/UK",
    desc:"Two sisters' lives converge during the Nigerian-Biafran Civil War.",
    youtube_id:"nEUrbVH46_U",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.netflix.com",
    stream_label:"Watch on Netflix",
    tags:["Nollywood","History","Drama"]
  },
  {
    id:"4", title:"The Wedding Party", year:2016, genre:"Comedy", rating:6.5,
    duration:"104 min", cover:"💒", country:"Nigeria",
    desc:"A Nollywood rom-com about a Lagos wedding that goes hilariously wrong.",
    youtube_id:"e1PQkaLSmR4",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.netflix.com",
    stream_label:"Watch on Netflix",
    tags:["Nollywood","Comedy","Romance","Lagos"]
  },
  {
    id:"5", title:"Lionheart", year:2018, genre:"Drama", rating:5.9,
    duration:"95 min", cover:"🦁", country:"Nigeria",
    desc:"A woman fights to save her father's transport company — first Netflix original from Nigeria.",
    youtube_id:"qQ-WPSgOlpM",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.netflix.com",
    stream_label:"Watch on Netflix",
    tags:["Nollywood","Drama","Netflix Original"]
  },
  {
    id:"6", title:"Blood Sisters", year:2022, genre:"Thriller", rating:7.1,
    duration:"Series", cover:"🩸", country:"Nigeria",
    desc:"Netflix Naija — Two best friends bound by a dark secret after a wedding night gone wrong.",
    youtube_id:"PkSXGx7sFdE",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.netflix.com",
    stream_label:"Watch on Netflix",
    tags:["Nollywood","Thriller","Series","Netflix"]
  },
  {
    id:"7", title:"King of Boys", year:2018, genre:"Crime/Drama", rating:8.1,
    duration:"195 min", cover:"👸", country:"Nigeria",
    desc:"A female crime boss navigates Lagos politics and criminal underworld.",
    youtube_id:"VdKbJAX6PfA",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.netflix.com",
    stream_label:"Watch on Netflix",
    tags:["Nollywood","Crime","Lagos","Award-winning"]
  },
  {
    id:"8", title:"Wakanda Forever", year:2022, genre:"Action", rating:6.7,
    duration:"161 min", cover:"✊", country:"USA",
    desc:"Wakanda fights to protect itself after the death of King T'Challa.",
    youtube_id:"_Z3QKkl1WyM",
    full_youtube_id:"",
    has_full: false,
    stream_link:"https://www.disneyplus.com",
    stream_label:"Watch on Disney+",
    tags:["Action","Africa","Superhero","MCU"]
  },
];

const GENRES = ["All","Nollywood","Comedy","Drama","Action","Thriller","Series","Classic"];

const WATCH_NIGHTS = [
  { id:"1", title:"Friday Movie Night 🎬", movie:"Coming to America", host:"@TheCruiseCH",
    scheduled:"Fri 9PM WAT", rsvp:47, active:true,
    youtube_id:"oN7YzrLKpW0",
    space_url:"https://x.com/i/communities/1897164314764579242" },
  { id:"2", title:"Nollywood Sunday 🇳🇬", movie:"King of Boys", host:"@theconnector",
    scheduled:"Sun 8PM WAT", rsvp:31, active:false,
    youtube_id:"VdKbJAX6PfA",
    space_url:"" },
];

const VOTE_OPTIONS = [
  "Squid Game S3 (Netflix)", "Wakanda Forever", "King of Boys 3", "Blood & Water S4",
  "The Black Book", "Citation"
];

export default function MoviesPage() {
  const [tab, setTab]           = useState<"browse"|"watchparty"|"vote">("browse");
  const [genre, setGenre]       = useState("All");
  const [search, setSearch]     = useState("");
  const [playing, setPlaying]   = useState<{id:string; title:string; isTrailer:boolean} | null>(null);
  const [rsvped, setRsvped]     = useState<Set<string>>(new Set());
  const [myVote, setMyVote]     = useState<string|null>(null);
  const [votes, setVotes]       = useState<Record<string,number>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const filtered = MOVIES.filter(m => {
    const matchGenre = genre === "All" || m.tags.some(t => t === genre) || m.genre.includes(genre);
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const castVote = (opt: string) => {
    if (myVote) return;
    setMyVote(opt);
    setVotes(v => ({...v, [opt]: (v[opt]||0)+1}));
  };
  const totalVotes = Object.values(votes).reduce((a,b)=>a+b,0) + VOTE_OPTIONS.length * 8;

  const openTrailer = (movie: typeof MOVIES[0]) => {
    setPlaying({ id: movie.youtube_id, title: movie.title, isTrailer: !movie.has_full });
  };

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setPlaying(null);
    };
    if (playing) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [playing]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Fullscreen video modal */}
      {playing && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div ref={modalRef} className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-black text-lg">{playing.title}</h3>
                <p className="text-zinc-400 text-xs">{playing.isTrailer ? "📽️ Official Trailer" : "🎬 Full Movie"}</p>
              </div>
              <button onClick={() => setPlaying(null)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900"
              style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${playing.id}?autoplay=1&rel=0&modestbranding=1`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {playing.isTrailer && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 text-xs">Want to watch the full movie?</span>
                {MOVIES.find(m => m.youtube_id === playing.id) && (
                  <a href={MOVIES.find(m => m.youtube_id === playing.id)!.stream_link}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-yellow-400 text-black font-black text-xs px-3 py-1.5 rounded-full hover:bg-yellow-300 transition-colors">
                    {MOVIES.find(m => m.youtube_id === playing.id)!.stream_label} <ExternalLink size={11}/>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Film size={20} className="text-yellow-400"/> CC Movie Hub
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Watch trailers in-app · Join watch parties · Vote on next movie night</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
          {[
            { id:"browse",     label:"🎬 Browse",        badge:null },
            { id:"watchparty", label:"🍿 Watch Party",    badge:WATCH_NIGHTS.filter(n=>n.active).length },
            { id:"vote",       label:"🗳️ Vote Next Film", badge:null },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors relative ${
                tab === t.id ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"
              }`}>
              {t.label}
              {t.badge ? (
                <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── BROWSE TAB ────────────────────────────── */}
        {tab === "browse" && (
          <div className="space-y-5">
            {/* Search + filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
              </div>
            </div>

            {/* Genre filter */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    genre === g ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                  }`}>{g}</button>
              ))}
            </div>

            {/* Movie grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(movie => (
                <div key={movie.id}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-black/40">
                  {/* Cover */}
                  <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 h-44 flex items-center justify-center">
                    <span className="text-7xl">{movie.cover}</span>
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {movie.youtube_id && (
                        <button onClick={() => openTrailer(movie)}
                          className="flex items-center gap-1.5 bg-yellow-400 text-black font-black text-xs px-3 py-2 rounded-full hover:bg-yellow-300 transition-colors">
                          <Play size={13} fill="currentColor" />
                          {movie.has_full ? "Play" : "Trailer"}
                        </button>
                      )}
                      <a href={movie.stream_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700">
                        <ExternalLink size={11}/> Full Movie
                      </a>
                    </div>
                    {/* Rating badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 rounded-full px-2 py-0.5">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-[10px] font-bold">{movie.rating}</span>
                    </div>
                    {/* Country tag */}
                    <div className="absolute top-2 left-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {movie.tags[0]}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5">
                    <h3 className="text-white font-black text-sm truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-[11px] mt-0.5 mb-2">
                      <span>{movie.year}</span>
                      <span>·</span>
                      <span>{movie.genre}</span>
                      <span>·</span>
                      <Clock size={10}/>
                      <span>{movie.duration}</span>
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-3">{movie.desc}</p>

                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap mb-3">
                      {movie.tags.slice(0,3).map(t => (
                        <span key={t} className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-medium">{t}</span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {movie.youtube_id && (
                        <button onClick={() => openTrailer(movie)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl hover:bg-zinc-700 border border-zinc-700 transition-colors">
                          <Play size={12} fill="currentColor"/> Trailer
                        </button>
                      )}
                      <a href={movie.stream_link} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold py-2 rounded-xl hover:bg-yellow-400/20 transition-colors">
                        <Tv size={12}/> Stream
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-zinc-600">
                <Film size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No movies found. Try a different filter.</p>
              </div>
            )}
          </div>
        )}

        {/* ── WATCH PARTY TAB ───────────────────────── */}
        {tab === "watchparty" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <PartyPopper size={16} className="text-yellow-400"/>
                <h2 className="text-white font-black text-sm">Community Watch Parties</h2>
              </div>
              <p className="text-zinc-400 text-xs">We watch together via X Space — RSVP and we send you the link when it goes live.</p>
            </div>

            {WATCH_NIGHTS.map(night => (
              <div key={night.id}
                className={`bg-zinc-900 border rounded-2xl overflow-hidden ${
                  night.active ? "border-yellow-400/30" : "border-zinc-800"
                }`}>
                {night.active && (
                  <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-4 py-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    <span className="text-yellow-400 text-[11px] font-black">COMING UP NEXT</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    {night.youtube_id && (
                      <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-zinc-800 cursor-pointer group"
                        onClick={() => setPlaying({ id: night.youtube_id, title: night.movie, isTrailer: true })}>
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Play size={24} className="text-white fill-white" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1 rounded">Watch Trailer</div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-black text-sm">{night.title}</h3>
                      <p className="text-zinc-400 text-xs mt-0.5">🎬 {night.movie}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Calendar size={11}/> {night.scheduled}</span>
                        <span className="flex items-center gap-1"><Users size={11}/> {night.rsvp} going</span>
                        <span>Host: {night.host}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setRsvped(prev => {
                            const n = new Set(prev);
                            n.has(night.id) ? n.delete(night.id) : n.add(night.id);
                            return n;
                          })}
                          className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all ${
                            rsvped.has(night.id)
                              ? "bg-green-400/20 text-green-400 border border-green-400/30"
                              : "bg-yellow-400 text-black hover:bg-yellow-300"
                          }`}>
                          {rsvped.has(night.id) ? "✅ RSVP'd!" : "🎟️ RSVP"}
                        </button>
                        {night.space_url && (
                          <a href={night.space_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            X Community
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Host your own */}
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-5 text-center">
              <PartyPopper size={28} className="text-zinc-600 mx-auto mb-2" />
              <h3 className="text-zinc-300 font-bold text-sm mb-1">Host a Watch Party</h3>
              <p className="text-zinc-600 text-xs mb-3">Suggest a movie night for the community</p>
              <a href="https://x.com/i/communities/1897164314764579242" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-yellow-400/20 transition-colors">
                Suggest in Community <ExternalLink size={11}/>
              </a>
            </div>
          </div>
        )}

        {/* ── VOTE TAB ──────────────────────────────── */}
        {tab === "vote" && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Vote size={16} className="text-yellow-400"/>
                <h2 className="text-white font-black text-sm">What Should We Watch Next?</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-5">Most voted movie becomes the next Friday movie night pick 🍿</p>

              <div className="space-y-2.5">
                {VOTE_OPTIONS.map(opt => {
                  const v = (votes[opt]||0) + 8;
                  const pct = Math.round((v / totalVotes) * 100);
                  const isMyVote = myVote === opt;
                  return (
                    <button key={opt} onClick={() => castVote(opt)} disabled={!!myVote}
                      className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                        isMyVote
                          ? "border-yellow-400/50 bg-yellow-400/10"
                          : myVote
                            ? "border-zinc-800 bg-zinc-900/50 opacity-60 cursor-default"
                            : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                      }`}>
                      {/* Progress bar bg */}
                      <div className="absolute inset-0 rounded-xl"
                        style={{ width: `${pct}%`, background: isMyVote ? "rgba(250,204,21,0.08)" : "rgba(255,255,255,0.02)" }} />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isMyVote && <span className="text-yellow-400 text-xs">✓</span>}
                          <span className={`text-sm font-semibold ${isMyVote ? "text-yellow-400" : "text-white"}`}>{opt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {myVote && <span className={`text-xs font-bold ${isMyVote ? "text-yellow-400" : "text-zinc-500"}`}>{pct}%</span>}
                          {!myVote && <ChevronRight size={14} className="text-zinc-600"/>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-zinc-600 text-xs text-center mt-4">{totalVotes} total votes · Updates weekly</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
