"use client";
import { useState } from "react";
import { Music, Play, Pause, Heart, Share2, Mic2, Radio, Upload, ExternalLink, Headphones, Star, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const PLATFORMS = [
  { key:"spotify", label:"Spotify", emoji:"🎵", color:"bg-green-500/15 border-green-500/40 hover:bg-green-500/25", textColor:"text-green-400", icon:"🟢" },
  { key:"apple", label:"Apple Music", emoji:"🍎", color:"bg-red-500/15 border-red-500/40 hover:bg-red-500/25", textColor:"text-red-400", icon:"🔴" },
  { key:"youtube", label:"YouTube Music", emoji:"▶️", color:"bg-red-700/15 border-red-700/40 hover:bg-red-700/25", textColor:"text-red-500", icon:"🔴" },
  { key:"audiomack", label:"Audiomack", emoji:"🎧", color:"bg-orange-500/15 border-orange-500/40 hover:bg-orange-500/25", textColor:"text-orange-400", icon:"🟠" },
];

type Track = {
  id:string; title:string; artist:string; artist_handle:string; genre:string;
  plays:number; likes:number; duration:string; featured:boolean; cover:string; label:string;
  spotify_url:string; apple_url:string; youtube_url:string; audiomack_url:string; linktree:string;
};

const TRACKS: Track[] = [
  {
    id:"1", title:"HARDINARY", artist:"Lil Miss Thrill Seeker", artist_handle:"@ThrillSeekaEnt",
    genre:"Afrobeats", plays:12400, likes:892, duration:"3:24", featured:true, cover:"🎵", label:"ThrillSeeka Ent",
    spotify_url:"https://linktr.ee/ThrillSeekerEnt",
    apple_url:"https://linktr.ee/ThrillSeekerEnt",
    youtube_url:"https://linktr.ee/ThrillSeekerEnt",
    audiomack_url:"https://linktr.ee/ThrillSeekerEnt",
    linktree:"https://linktr.ee/ThrillSeekerEnt",
  },
  {
    id:"2", title:"JUMP ROPE", artist:"Lil Miss Thrill Seeker", artist_handle:"@ThrillSeekaEnt",
    genre:"Afropop", plays:9800, likes:674, duration:"2:58", featured:true, cover:"🎤", label:"ThrillSeeka Ent",
    spotify_url:"https://linktr.ee/ThrillSeekerEnt",
    apple_url:"https://linktr.ee/ThrillSeekerEnt",
    youtube_url:"https://linktr.ee/ThrillSeekerEnt",
    audiomack_url:"https://linktr.ee/ThrillSeekerEnt",
    linktree:"https://linktr.ee/ThrillSeekerEnt",
  },
  {
    id:"3", title:"SPEAKEASY", artist:"Lil Miss Thrill Seeker", artist_handle:"@ThrillSeekaEnt",
    genre:"R&B", plays:7200, likes:543, duration:"4:02", featured:true, cover:"🎸", label:"ThrillSeeka Ent",
    spotify_url:"https://linktr.ee/ThrillSeekerEnt",
    apple_url:"https://linktr.ee/ThrillSeekerEnt",
    youtube_url:"https://linktr.ee/ThrillSeekerEnt",
    audiomack_url:"https://linktr.ee/ThrillSeekerEnt",
    linktree:"https://linktr.ee/ThrillSeekerEnt",
  },
  {
    id:"4", title:"Lagos Nights (Mix)", artist:"DJ ConnectPlug", artist_handle:"@connectplug",
    genre:"Mix", plays:5600, likes:321, duration:"45:00", featured:false, cover:"🎧", label:"Independent",
    spotify_url:"#", apple_url:"#", youtube_url:"#", audiomack_url:"#", linktree:"#",
  },
  {
    id:"5", title:"No Wahala", artist:"Wavey Sosa", artist_handle:"@waveysosa",
    genre:"Afropop", plays:4300, likes:287, duration:"3:15", featured:false, cover:"🌊", label:"Independent",
    spotify_url:"#", apple_url:"#", youtube_url:"#", audiomack_url:"#", linktree:"#",
  },
];

const STATIONS = [
  { id:"s1", name:"Afrobeats 24/7 🔥", host:"@connectplug", listeners:847, genre:"Afrobeats", live:true, x_space:"https://twitter.com/i/spaces" },
  { id:"s2", name:"Naija R&B Vibes ✨", host:"@ThrillSeekaEnt", listeners:312, genre:"R&B", live:true, x_space:"https://twitter.com/i/spaces" },
  { id:"s3", name:"Underground Artists 🎙️", host:"@13fxiii", listeners:189, genre:"Mixed", live:false, x_space:"https://twitter.com/i/spaces" },
];

const GENRES = ["All","Afrobeats","Afropop","R&B","Hip-Hop","Mix","Amapiano","Highlife"];

function PlatformLinks({ track }: { track: Track }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {PLATFORMS.map(p => {
        const url = p.key==="spotify"?track.spotify_url:p.key==="apple"?track.apple_url:p.key==="youtube"?track.youtube_url:track.audiomack_url;
        const isReal = url && url !== "#";
        return (
          <a key={p.key} href={isReal?url:"#"} target={isReal?"_blank":"_self"} rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold
              ${isReal?`${p.color} ${p.textColor}`:"border-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed"}`}>
            <span className="text-base">{p.emoji}</span>
            <span>{p.label}</span>
            {isReal && <ExternalLink className="w-3 h-3 ml-auto opacity-60" />}
          </a>
        );
      })}
    </div>
  );
}

export default function MusicPage() {
  const [tab, setTab] = useState<"discover"|"stations"|"submit">("discover");
  const [playing, setPlaying] = useState<string|null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [genre, setGenre] = useState("All");
  const [expandedTrack, setExpandedTrack] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ artist:"",title:"",handle:"",spotify:"",apple:"",youtube:"",audiomack:"",genre:"Afrobeats",desc:"" });
  const [submitted, setSubmitted] = useState(false);

  const filtered = TRACKS.filter(t=>{
    const matchesGenre = genre==="All"||t.genre===genre;
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const toggleLike=(id:string)=>setLiked(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const togglePlay=(id:string)=>setPlaying(p=>p===id?null:id);
  const toggleExpand=(id:string)=>setExpandedTrack(p=>p===id?null:id);

  const handleSubmit=()=>{
    if(!formData.artist||!formData.title) return;
    setSubmitted(true);
    setTimeout(()=>setSubmitted(false),4000);
    setFormData({artist:"",title:"",handle:"",spotify:"",apple:"",youtube:"",audiomack:"",genre:"Afrobeats",desc:""});
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><Music className="text-yellow-400 w-8 h-8"/>Music Hub</h1>
          <p className="text-zinc-400 mt-1">Discover new sounds curated by <span className="text-yellow-400 font-bold">@ThrillSeekaEnt</span></p>
        </div>

        {/* Live Banner */}
        <div className="bg-gradient-to-r from-green-500/10 via-zinc-900 to-transparent border border-green-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <div className="flex-1">
              <div className="text-green-400 font-bold text-sm">Afrobeats 24/7 is LIVE right now</div>
              <div className="text-zinc-500 text-xs">847 listeners · Hosted by @connectplug</div>
            </div>
            <a href="https://twitter.com/i/spaces" target="_blank" rel="noopener noreferrer"
              className="bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-green-500/30 transition-all flex items-center gap-1">
              <Headphones className="w-3 h-3"/>Join Space
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit overflow-x-auto">
          {[["discover","🎵 Discover"],["stations","📻 Stations"],["submit","🎤 Submit Track"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${tab===v?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>

        {tab==="discover"&&(
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tracks or artists..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-400 transition-colors"/>
            </div>

            {/* Genre Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {GENRES.map(g=>(
                <button key={g} onClick={()=>setGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${genre===g?"bg-yellow-400 text-black":"bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}>{g}</button>
              ))}
            </div>

            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/30 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400"/>
                <span className="text-yellow-400 font-bold text-sm">A&R Spotlight by @ThrillSeekaEnt</span>
              </div>
              <p className="text-zinc-400 text-xs">Discover HARDINARY, JUMP ROPE & SPEAKEASY — stream on all platforms 🎵</p>
              <a href="https://linktr.ee/ThrillSeekerEnt" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-yellow-400 text-xs font-bold hover:text-yellow-300">
                Stream Now <ExternalLink className="w-3 h-3"/>
              </a>
            </div>

            {/* Track List */}
            <div className="space-y-3">
              {filtered.map(track=>(
                <div key={track.id} className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${track.featured?"border-yellow-400/30":"border-zinc-800"}`}>
                  <div className="p-4 flex items-center gap-4">
                    {/* Cover */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${track.featured?"bg-gradient-to-br from-yellow-400/20 to-orange-500/20":"bg-zinc-800"}`}>
                      {track.cover}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-sm truncate">{track.title}</span>
                        {track.featured&&<span className="bg-yellow-400/20 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">FEATURED</span>}
                      </div>
                      <div className="text-zinc-400 text-xs">{track.artist}</div>
                      <div className="flex items-center gap-3 text-zinc-600 text-xs mt-1">
                        <span>{track.plays.toLocaleString()} plays</span>
                        <span>{track.duration}</span>
                        <span className="bg-zinc-800 px-2 py-0.5 rounded-full">{track.genre}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={()=>toggleLike(track.id)} className={`p-2 rounded-full transition-all ${liked.has(track.id)?"text-red-400":"text-zinc-600 hover:text-zinc-400"}`}>
                        <Heart className={`w-4 h-4 ${liked.has(track.id)?"fill-current":""}`}/>
                      </button>
                      <button onClick={()=>togglePlay(track.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${playing===track.id?"bg-yellow-400 text-black":"bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                        {playing===track.id?<Pause className="w-4 h-4"/>:<Play className="w-4 h-4 ml-0.5"/>}
                      </button>
                    </div>
                  </div>

                  {/* Platform Links Toggle */}
                  <div className="px-4 pb-3">
                    <button onClick={()=>toggleExpand(track.id)}
                      className={`text-xs font-bold transition-colors ${expandedTrack===track.id?"text-yellow-400":"text-zinc-500 hover:text-zinc-300"}`}>
                      {expandedTrack===track.id?"▲ Hide platforms":"▼ Stream on Apple Music · Spotify · YouTube · Audiomack"}
                    </button>

                    {expandedTrack===track.id&&(
                      <div className="mt-3">
                        <PlatformLinks track={track}/>
                        {track.linktree&&track.linktree!="#"&&(
                          <a href={track.linktree} target="_blank" rel="noopener noreferrer"
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold py-2 rounded-xl hover:bg-yellow-400/20 transition-all">
                            <ExternalLink className="w-3 h-3"/>All Links (Linktree)
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {playing===track.id&&(
                    <div className="px-4 pb-4">
                      <div className="h-8 bg-zinc-800 rounded-lg flex items-center justify-center gap-1 px-3">
                        {[...Array(20)].map((_,i)=>(
                          <div key={i} className="w-0.5 bg-yellow-400 rounded-full animate-pulse" style={{height:`${8+Math.random()*16}px`,animationDelay:`${i*0.1}s`}}/>
                        ))}
                        <span className="text-yellow-400 text-xs font-bold ml-2">Playing...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="stations"&&(
          <div className="space-y-4">
            {STATIONS.map(s=>(
              <div key={s.id} className={`bg-zinc-900 border rounded-2xl p-5 ${s.live?"border-green-500/30":"border-zinc-800"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {s.live&&<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>}
                      <h3 className="text-white font-black">{s.name}</h3>
                      {s.live&&<span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full">LIVE</span>}
                    </div>
                    <div className="text-zinc-500 text-xs">Hosted by {s.host} · {s.genre}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-black">{s.listeners.toLocaleString()}</div>
                    <div className="text-zinc-500 text-xs">listeners</div>
                  </div>
                </div>
                <a href={s.x_space} target="_blank" rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${s.live?"bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  <Headphones className="w-4 h-4"/>
                  {s.live?"Join Live Space":"Set Reminder"}
                </a>
              </div>
            ))}
          </div>
        )}

        {tab==="submit"&&(
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-white font-black text-lg">Submit Your Track 🎤</h2>
              <p className="text-zinc-400 text-sm mt-1">Get your music featured on the C&C Hub Music Hub. Our A&R team reviews every submission.</p>
            </div>

            {submitted&&(
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 font-bold text-sm">
                ✅ Track submitted! @ThrillSeekaEnt will review your music.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[{k:"artist",l:"Artist Name *",p:"Your name"},{k:"title",l:"Track Title *",p:"Song title"},{k:"handle",l:"X Handle",p:"@yourhandle"},{k:"genre",l:"Genre",p:"",select:["Afrobeats","Afropop","R&B","Hip-Hop","Amapiano","Highlife","Rap","Pop"]}].map(f=>(
                <div key={f.k}>
                  <label className="text-zinc-400 text-xs font-bold block mb-1">{f.l}</label>
                  {f.select?(
                    <select value={(formData as any)[f.k]} onChange={e=>setFormData(d=>({...d,[f.k]:e.target.value}))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400">
                      {f.select.map(o=><option key={o}>{o}</option>)}
                    </select>
                  ):(
                    <input value={(formData as any)[f.k]} onChange={e=>setFormData(d=>({...d,[f.k]:e.target.value}))} placeholder={f.p}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400"/>
                  )}
                </div>
              ))}
            </div>

            {/* Platform Links */}
            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-2">Streaming Links (paste where your music lives)</label>
              <div className="space-y-2">
                {PLATFORMS.map(p=>(
                  <div key={p.key} className={`flex items-center gap-3 border rounded-xl px-3 py-2 ${p.color}`}>
                    <span className="text-lg">{p.emoji}</span>
                    <input value={(formData as any)[p.key]} onChange={e=>setFormData(d=>({...d,[p.key]:e.target.value}))}
                      placeholder={`${p.label} URL`}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-600"/>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-bold block mb-1">About Your Music</label>
              <textarea value={formData.desc} onChange={e=>setFormData(d=>({...d,desc:e.target.value}))}
                placeholder="Tell us about your track, influences, what makes it special..."
                rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400 resize-none"/>
            </div>

            <button onClick={handleSubmit}
              className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-all">
              Submit for Review 🎵
            </button>

            <p className="text-zinc-600 text-xs text-center">Powered by @ThrillSeekaEnt · A&R review within 48 hours</p>
          </div>
        )}
      </main>
    </div>
  );
}
