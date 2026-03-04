"use client";
import { useState, useEffect } from "react";
import { Film, Calendar, Users, Play, X, ExternalLink, Star, Check, Loader2, Clock, Radio } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const MOVIES = [
  { id:"1", title:"Coming to America", year:1988, genre:"Comedy", rating:7.7, duration:"116 min", watch_party:true, youtube_id:"oN7YzrLKpW0", desc:"An African prince comes to America to find a wife.", emoji:"👑" },
  { id:"2", title:"Black Panther", year:2018, genre:"Action", rating:7.3, duration:"134 min", watch_party:true, youtube_id:"", desc:"T'Challa returns home to Wakanda to take his rightful place as king.", emoji:"🐾" },
  { id:"3", title:"Half of a Yellow Sun", year:2013, genre:"Drama", rating:6.6, duration:"111 min", watch_party:false, youtube_id:"", desc:"Two sisters' lives converge during the Nigerian Civil War.", emoji:"🌅" },
  { id:"4", title:"The Wedding Party", year:2016, genre:"Comedy", rating:6.5, duration:"104 min", watch_party:true, youtube_id:"", desc:"A Nollywood rom-com about a Lagos wedding gone hilariously wrong.", emoji:"💒" },
  { id:"5", title:"Lion King (2019)", year:2019, genre:"Animation", rating:6.9, duration:"118 min", watch_party:false, youtube_id:"", desc:"Simba returns to Pride Rock to claim his throne.", emoji:"🦁" },
  { id:"6", title:"Blood Sisters", year:2022, genre:"Thriller", rating:7.1, duration:"Series", watch_party:true, youtube_id:"", desc:"Netflix Naija — Two best friends bound by a dark secret.", emoji:"🩸" },
];

const MOVIE_NIGHTS = [
  { id:"1", title:"Friday Movie Night", movie:"Coming to America", host:"@CCHub_", scheduled:"Fri, 9PM WAT", rsvp:47, space_url:"https://twitter.com/i/spaces", youtube_id:"oN7YzrLKpW0", active:true },
  { id:"2", title:"Nollywood Sunday", movie:"The Wedding Party", host:"@theconnector", scheduled:"Sun, 8PM WAT", rsvp:23, space_url:"", youtube_id:"", active:false },
];

const VOTE_OPTIONS = ["Squid Game (S3)","Spider-Man: Across the Spider-Verse","Wakanda Forever","Blood Sisters S2"];
const GENRES = ["All","Comedy","Action","Drama","Animation","Thriller","Nollywood","Horror","Romance"];

export default function MoviesPage() {
  const [tab, setTab] = useState<"library"|"nights"|"vote">("library");
  const [genre, setGenre] = useState("All");
  const [votes, setVotes] = useState<Record<string,number>>({});
  const [myVote, setMyVote] = useState<string|null>(null);
  const [rsvped, setRsvped] = useState<Set<string>>(new Set());
  const [watching, setWatching] = useState<string|null>(null); // youtube_id
  const [watchTitle, setWatchTitle] = useState("");

  const filtered = genre==="All" ? MOVIES : MOVIES.filter(m=>m.genre===genre);

  const castVote = (option: string) => {
    if (myVote) return;
    setMyVote(option);
    setVotes(v=>({...v,[option]:(v[option]||0)+1}));
  };

  const totalVotes = Object.values(votes).reduce((a,b)=>a+b,0)+VOTE_OPTIONS.length*12;
  const getVoteCount = (o: string) => (votes[o]||0)+[342,891,234,567][VOTE_OPTIONS.indexOf(o)];

  const openWatch = (youtubeId: string, title: string) => { setWatching(youtubeId); setWatchTitle(title); };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* YouTube Watch Modal */}
        {watching&&(
          <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-white text-lg">🎬 {watchTitle}</h3>
                <button onClick={()=>setWatching(null)} className="bg-zinc-800 text-zinc-300 p-2 rounded-full hover:bg-zinc-700"><X className="w-5 h-5"/></button>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${watching}?autoplay=1&rel=0`} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen/>
              </div>
              <p className="text-xs text-zinc-500 mt-3 text-center">Join the X Space watch party for community commentary 🎉</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><Film className="text-yellow-400 w-8 h-8"/>Movie Hub</h1>
          <a href="/movies/watch" className="mt-2 inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-500/30 transition-colors"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>Watch Party LIVE — Join Now</a>
          <p className="text-zinc-400 mt-1">Community watch parties · Film library · Vote for next movie</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["library","nights","vote"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab===t?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>
              {t==="library"?"🎬 Library":t==="nights"?"🌙 Movie Nights":"🗳️ Vote Next"}
            </button>
          ))}
        </div>

        {/* LIBRARY */}
        {tab==="library"&&(
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {GENRES.map(g=>(
                <button key={g} onClick={()=>setGenre(g)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${genre===g?"bg-yellow-400 text-black":"bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>{g}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(movie=>(
                <div key={movie.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl overflow-hidden transition-all">
                  <div className="h-40 bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center text-6xl relative">
                    {movie.emoji}
                    {movie.watch_party&&<span className="absolute top-2 left-2 bg-red-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>Watch Party</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-0.5 leading-tight">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                      <span>{movie.year}</span><span>·</span><span>{movie.genre}</span><span>·</span><span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-400"/>{movie.rating}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{movie.desc}</p>
                    <div className="flex gap-2">
                      {movie.youtube_id?(
                        <button onClick={()=>openWatch(movie.youtube_id,movie.title)} className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-full text-xs hover:bg-yellow-300 flex items-center justify-center gap-1">
                          <Play className="w-3 h-3"/>Watch Free
                        </button>
                      ):(
                        <button className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-2 rounded-full text-xs cursor-not-allowed" disabled>
                          Coming Soon
                        </button>
                      )}
                      {movie.watch_party&&<button className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-full text-xs font-bold hover:bg-red-500/30 transition-colors flex items-center gap-1"><Radio className="w-3 h-3"/>Join</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MOVIE NIGHTS */}
        {tab==="nights"&&(
          <div className="space-y-4">
            {MOVIE_NIGHTS.map(night=>(
              <div key={night.id} className={`bg-zinc-900 border rounded-2xl p-5 transition-all ${night.active?"border-yellow-400/30":"border-zinc-800"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-black text-white text-lg mb-1">{night.title}</h3>
                    <div className="text-sm text-zinc-400 mb-1">🎬 <span className="text-white font-bold">{night.movie}</span></div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{night.scheduled}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{night.rsvp+(rsvped.has(night.id)?1:0)} RSVPs</span>
                      <span>Host: <span className="text-yellow-400">{night.host}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-col">
                    <button onClick={()=>setRsvped(prev=>{const n=new Set(prev);n.has(night.id)?n.delete(night.id):n.add(night.id);return n;})}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${rsvped.has(night.id)?"bg-green-500/20 text-green-400 border border-green-500/30":"bg-yellow-400 text-black hover:bg-yellow-300"}`}>
                      {rsvped.has(night.id)?"✓ RSVPed":"RSVP"}
                    </button>
                    {night.youtube_id&&<button onClick={()=>openWatch(night.youtube_id,night.movie)} className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-700 flex items-center gap-1 justify-center"><Play className="w-3.5 h-3.5"/>Preview</button>}
                    {night.space_url&&<a href={night.space_url} target="_blank" rel="noopener noreferrer" className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 justify-center"><Radio className="w-3.5 h-3.5"/>Join Space</a>}
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-5 text-center">
              <p className="text-zinc-500 text-sm mb-2">Want to host a movie night?</p>
              <a href="https://twitter.com/CCHub_" target="_blank" rel="noopener noreferrer" className="text-yellow-400 font-bold text-sm hover:underline">DM @CCHub_ to schedule one →</a>
            </div>
          </div>
        )}

        {/* VOTE */}
        {tab==="vote"&&(
          <div className="max-w-2xl">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-black text-white text-xl mb-1">🗳️ Next Movie Night Vote</h3>
              <p className="text-zinc-400 text-sm mb-5">Community picks the next watch party film. Most votes wins.</p>
              <div className="space-y-3">
                {VOTE_OPTIONS.map((opt,i)=>{
                  const v = getVoteCount(opt);
                  const pct = Math.round((v/(totalVotes))*100);
                  const isLeading = VOTE_OPTIONS.indexOf(VOTE_OPTIONS.reduce((a,b)=>getVoteCount(a)>getVoteCount(b)?a:b))===i;
                  return (
                    <button key={opt} onClick={()=>castVote(opt)} disabled={!!myVote} className={`w-full rounded-xl overflow-hidden border text-left transition-all ${myVote===opt?"border-yellow-400":isLeading&&myVote?"border-zinc-600":"border-zinc-700 hover:border-zinc-500 cursor-pointer"} ${myVote?"cursor-default":""}`}>
                      <div className="relative px-4 py-3">
                        {myVote&&<div className={`absolute inset-0 rounded-xl ${myVote===opt?"bg-yellow-400/15":isLeading?"bg-white/5":"bg-transparent"} transition-all duration-700`} style={{width:`${pct}%`}}/>}
                        <div className="relative flex items-center justify-between">
                          <span className={`font-medium text-sm ${myVote===opt?"text-yellow-400":"text-zinc-200"}`}>
                            {myVote===opt&&"✓ "}{opt}{isLeading&&myVote&&" 👑"}
                          </span>
                          {myVote&&<span className={`font-black text-sm ${isLeading?"text-yellow-400":"text-zinc-400"}`}>{pct}%</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {myVote&&<p className="text-xs text-zinc-500 text-right mt-3">{totalVotes} total votes · Results update daily</p>}
              {!myVote&&<p className="text-xs text-zinc-600 text-center mt-3">Click to vote · Results reveal after voting</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
