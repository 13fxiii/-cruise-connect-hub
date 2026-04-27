"use client";

import { useMemo, useState } from "react";
import { Film, PlayCircle, Search, Star, Clapperboard } from "lucide-react";

type Movie = {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: number;
  runtime: string;
  overview: string;
  poster: string;
  trailerId: string;
  source: string;
};

const MOVIES: Movie[] = [
  {
    id: "tt4154796",
    title: "Avengers: Endgame",
    year: 2019,
    genre: "Action · Sci‑Fi",
    rating: 8.4,
    runtime: "181m",
    overview: "The Avengers assemble one final time to reverse the snap and restore balance.",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    trailerId: "TcMBFSGVi1c",
    source: "NyumatFlix-style catalog",
  },
  {
    id: "tt6105098",
    title: "The Lion King",
    year: 2019,
    genre: "Adventure · Family",
    rating: 6.8,
    runtime: "118m",
    overview: "A young lion prince flees his kingdom only to learn the true meaning of responsibility.",
    poster: "https://image.tmdb.org/t/p/w500/2bXbqYdUdNVa8VIWXVfclP2ICtT.jpg",
    trailerId: "7TavVZMewpY",
    source: "NyumatFlix-style catalog",
  },
  {
    id: "tt6791350",
    title: "Guardians of the Galaxy Vol. 3",
    year: 2023,
    genre: "Action · Comedy",
    rating: 7.9,
    runtime: "150m",
    overview: "The Guardians set out on a mission to save one of their own.",
    poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    trailerId: "u3V5KDHRQvk",
    source: "NyumatFlix-style catalog",
  },
  {
    id: "tt8124974",
    title: "King of Boys",
    year: 2018,
    genre: "Crime · Drama",
    rating: 8.1,
    runtime: "169m",
    overview: "A Lagos power broker battles betrayal and politics in a dangerous game of influence.",
    poster: "https://image.tmdb.org/t/p/w500/qqm6Xxgmz3g4q2QjXH4u6M6Wdf5.jpg",
    trailerId: "VdKbJAX6PfA",
    source: "Cruise Connect picks",
  },
  {
    id: "tt9419884",
    title: "The Black Book",
    year: 2023,
    genre: "Thriller",
    rating: 6.6,
    runtime: "124m",
    overview: "A deacon with a dark past seeks justice after his son is framed.",
    poster: "https://image.tmdb.org/t/p/w500/tFw9jR2QxvH8i0LQnVJ8nQ0KX3x.jpg",
    trailerId: "ykfMZQfK0_A",
    source: "Cruise Connect picks",
  },
];

export default function MoviesPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Movie | null>(null);

  const filtered = useMemo(() => {
    const value = q.trim().toLowerCase();
    if (!value) return MOVIES;
    return MOVIES.filter(
      (movie) =>
        movie.title.toLowerCase().includes(value) ||
        movie.genre.toLowerCase().includes(value) ||
        movie.overview.toLowerCase().includes(value)
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <header className="mb-6 rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-zinc-900 to-black p-5">
          <p className="text-yellow-400 text-xs font-black tracking-wider">CRUISE CONNECT MOVIES</p>
          <h1 className="text-white text-2xl font-black mt-1 flex items-center gap-2">
            <Film className="w-6 h-6 text-yellow-400" />
            Cruise Connect Movies
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            In-app movie hub inspired by NyumatFlix. Browse and watch trailers directly inside Cruise Connect.
          </p>
        </header>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Cruise Connect Movies"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-yellow-400"
          />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((movie) => (
            <button
              key={movie.id}
              onClick={() => setActive(movie)}
              className="group text-left rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-yellow-400/60 transition-colors"
            >
              <img src={movie.poster} alt={movie.title} className="w-full h-60 object-cover" loading="lazy" />
              <div className="p-3">
                <p className="text-white text-sm font-bold line-clamp-1">{movie.title}</p>
                <p className="text-zinc-400 text-xs mt-1">{movie.year} · {movie.runtime}</p>
                <p className="text-zinc-500 text-[11px] mt-1 line-clamp-1">{movie.genre}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5" /> {movie.rating}
                  </span>
                  <span className="inline-flex items-center gap-1 text-zinc-300 text-xs">
                    <PlayCircle className="w-3.5 h-3.5" /> Play
                  </span>
                </div>
              </div>
            </button>
          ))}
        </section>

        {active && (
          <section className="mt-7 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 md:p-5">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold tracking-wider mb-2">
              <Clapperboard className="w-4 h-4" /> NOW PLAYING IN APP
            </div>
            <h2 className="text-xl font-black text-white">{active.title}</h2>
            <p className="text-zinc-400 text-sm mt-2 mb-3">{active.overview}</p>
            <div className="rounded-2xl overflow-hidden border border-zinc-800 aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${active.trailerId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${active.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-zinc-500 text-xs mt-2">Catalog source: {active.source}.</p>
          </section>
        )}
      </main>
    </div>
  );
}
