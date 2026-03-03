"use client";
import { useState } from "react";
import { Film, Play, Users, ExternalLink, Clock, Star, Radio, Popcorn, Calendar, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const MOVIES = [
  { id: "1", title: "Coming to America", year: 1988, genre: "Comedy", rating: 8.0, poster: "👑", duration: "1h 56m", link: "https://www.youtube.com/watch?v=tH9_UPTcGQw", source: "YouTube", watchParty: true },
  { id: "2", title: "Black Panther", year: 2018, genre: "Action", rating: 7.3, poster: "🐾", duration: "2h 14m", link: "#", source: "Community Pick", watchParty: false },
  { id: "3", title: "The Color Purple", year: 2023, genre: "Drama", rating: 7.5, poster: "💜", duration: "2h 21m", link: "#", source: "Community Pick", watchParty: false },
  { id: "4", title: "Knives Out", year: 2019, genre: "Mystery", rating: 7.9, poster: "🔪", duration: "2h 10m", link: "#", source: "Community Pick", watchParty: false },
  { id: "5", title: "Soul", year: 2020, genre: "Animation", rating: 8.1, poster: "🎹", duration: "1h 40m", link: "#", source: "Community Pick", watchParty: false },
  { id: "6", title: "Nollywood Vibes Collection", year: 2024, genre: "Nollywood", rating: 7.0, poster: "🎬", duration: "Various", link: "#", source: "Community Pick", watchParty: true },
];

const UPCOMING_NIGHTS = [
  { id: "1", title: "Friday Movie Night 🎬", movie: "TBA — Community Vote", date: "Friday Mar 7", time: "9PM WAT", host: "@theconnector", attendees: 89, space_url: "https://twitter.com/CCHub_" },
  { id: "2", title: "Nollywood Sunday 🇳🇬", movie: "Nollywood Classics Marathon", date: "Sunday Mar 9", time: "8PM WAT", host: "@CCHub_", attendees: 134, space_url: "https://twitter.com/CCHub_" },
];

const GENRES = ["All", "Action", "Comedy", "Drama", "Mystery", "Animation", "Nollywood", "Horror", "Romance"];

export default function MovieHubPage() {
  const [tab, setTab] = useState<"movies" | "nights" | "vote">("movies");
  const [genre, setGenre] = useState("All");
  const [votes, setVotes] = useState<Record<string, number>>({});

  const filtered = genre === "All" ? MOVIES : MOVIES.filter(m => m.genre === genre);

  const vote = (id: string) => {
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const VOTE_OPTIONS = [
    { id: "v1", title: "Bad Boys: Ride or Die", genre: "Action" },
    { id: "v2", title: "Deadpool & Wolverine", genre: "Comedy/Action" },
    { id: "v3", title: "Wicked (2024)", genre: "Musical" },
    { id: "v4", title: "A Quiet Place: Day One", genre: "Horror" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Film className="text-yellow-400 w-8 h-8" /> Movie Hub
            </h1>
            <p className="text-zinc-400 mt-1">Watch together while vibing on X Live Spaces · Community watch parties</p>
          </div>
        </div>

        {/* Live Watch Party Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍿</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-bold text-sm">WATCH PARTY LIVE</span>
              </div>
              <div className="text-white font-bold">Friday Movie Night — Vote for tonight's film!</div>
              <div className="text-xs text-zinc-400">Hosted by @theconnector · 134 people watching</div>
            </div>
          </div>
          <a href="https://twitter.com/CCHub_" target="_blank" rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2 flex-shrink-0">
            <Radio className="w-4 h-4" /> Join Space
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {(["movies", "nights", "vote"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
              {t === "movies" ? "🎬 Library" : t === "nights" ? "📅 Movie Nights" : "🗳️ Vote Next"}
            </button>
          ))}
        </div>

        {tab === "movies" && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === g ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>
                  {g}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(movie => (
                <div key={movie.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl overflow-hidden transition-all">
                  <div className="h-40 bg-zinc-800 flex items-center justify-center text-7xl relative">
                    {movie.poster}
                    {movie.watchParty && (
                      <span className="absolute top-2 right-2 bg-red-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> WATCH PARTY
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-white text-sm leading-tight">{movie.title}</h3>
                      <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold flex-shrink-0 ml-2">
                        <Star className="w-3 h-3" fill="currentColor" /> {movie.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                      <span>{movie.genre}</span>
                      <span>·</span>
                      <span>{movie.year}</span>
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{movie.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      {movie.link !== "#" ? (
                        <a href={movie.link} target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-yellow-400 text-black font-bold py-2 rounded-full text-xs text-center hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1">
                          <Play className="w-3 h-3" /> Watch Free
                        </a>
                      ) : (
                        <button className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-2 rounded-full text-xs hover:bg-zinc-700 transition-colors">
                          Add to Watchlist
                        </button>
                      )}
                      {movie.watchParty && (
                        <a href="https://twitter.com/CCHub_" target="_blank" rel="noopener noreferrer"
                          className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 px-3 rounded-full text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1">
                          <Radio className="w-3 h-3" /> Party
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "nights" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 mb-4">Join our weekly movie nights — watch together while vibing in the X Live Space.</p>
            {UPCOMING_NIGHTS.map(night => (
              <div key={night.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-white text-lg mb-1">{night.title}</h3>
                    <p className="text-zinc-300 text-sm mb-1">🎬 {night.movie}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {night.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {night.time}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {night.attendees} RSVPs</span>
                    </div>
                    <p className="text-xs text-yellow-400 mt-1">Hosted by {night.host}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a href={night.space_url} target="_blank" rel="noopener noreferrer"
                      className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition-colors text-center">
                      RSVP
                    </a>
                    <a href={night.space_url} target="_blank" rel="noopener noreferrer"
                      className="bg-zinc-800 text-zinc-300 font-bold px-4 py-2 rounded-full text-sm hover:bg-zinc-700 transition-colors text-center flex items-center gap-1">
                      <Radio className="w-3 h-3" /> Set Reminder
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "vote" && (
          <div>
            <p className="text-zinc-400 text-sm mb-5">Vote for next Friday's movie. Top voted film wins. Results announced Thursday.</p>
            <div className="space-y-3">
              {VOTE_OPTIONS.map(opt => {
                const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;
                const v = votes[opt.id] || 0;
                const pct = Math.round((v / total) * 100);
                return (
                  <div key={opt.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-white">{opt.title}</span>
                        <span className="text-xs text-zinc-400 ml-2">{opt.genre}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400 font-bold text-sm">{pct}%</span>
                        <button onClick={() => vote(opt.id)}
                          className="bg-yellow-400 text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-yellow-300 transition-colors">
                          Vote
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{v} votes</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
