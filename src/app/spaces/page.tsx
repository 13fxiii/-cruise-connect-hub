import { Mic, Radio, Users, ExternalLink, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MOCK_SPACES = [
  { id: "1", title: "Afrobeats Vibes 🔥", host: "@theconnector", status: "live", listeners: 342, tags: ["music","afrobeats"], twitter_space_url: "https://twitter.com/i/spaces", started_at: "2h ago" },
  { id: "2", title: "Naija Entrepreneurs Roundtable", host: "@CCHub_", status: "live", listeners: 178, tags: ["business","nigeria"], twitter_space_url: "https://twitter.com/i/spaces", started_at: "45m ago" },
  { id: "3", title: "Gaming Night — Ludo Tournament Talk", host: "@13fxiii", status: "live", listeners: 89, tags: ["gaming","fun"], twitter_space_url: "https://twitter.com/i/spaces", started_at: "20m ago" },
  { id: "4", title: "Music Discovery: Underground Artists", host: "@ThrillSeekaEnt", status: "scheduled", listeners: 0, tags: ["music","discovery"], twitter_space_url: null, started_at: "Tomorrow 9PM" },
  { id: "5", title: "Creator Monetization Masterclass", host: "@CCHub_", status: "scheduled", listeners: 0, tags: ["creators","money"], twitter_space_url: null, started_at: "Fri 8PM" },
  { id: "6", title: "Men Crush Monday — Community Poll", host: "@theconnector", status: "ended", listeners: 512, tags: ["community","fun"], twitter_space_url: null, started_at: "Yesterday" },
];

export default function SpacesPage() {
  const live = MOCK_SPACES.filter(s => s.status === "live");
  const scheduled = MOCK_SPACES.filter(s => s.status === "scheduled");
  const ended = MOCK_SPACES.filter(s => s.status === "ended");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Mic className="text-yellow-400 w-8 h-8" /> Live Spaces
            </h1>
            <p className="text-zinc-400 mt-1">Audio rooms, community vibes, real conversations</p>
          </div>
          <a
            href="https://twitter.com/CCHub_"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2"
          >
            <Radio className="w-4 h-4" /> Join on X
          </a>
        </div>

        {/* Live NOW */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-white">Live Now</h2>
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{live.length}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map(s => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        </section>

        {/* Scheduled */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Scheduled</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {scheduled.map(s => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        </section>

        {/* Past */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-bold text-white">Recent</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {ended.map(s => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function SpaceCard({ space }: { space: typeof MOCK_SPACES[0] }) {
  const isLive = space.status === "live";
  const isScheduled = space.status === "scheduled";

  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 transition-all hover:border-yellow-500/40 ${
      isLive ? "border-red-500/40" : "border-zinc-800"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive && <span className="flex items-center gap-1 text-xs text-red-400 font-bold"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />LIVE</span>}
          {isScheduled && <span className="text-xs text-yellow-400 font-bold">UPCOMING</span>}
          {space.status === "ended" && <span className="text-xs text-zinc-500 font-bold">ENDED</span>}
        </div>
        {isLive && (
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Users className="w-3 h-3" /> {space.listeners.toLocaleString()}
          </div>
        )}
      </div>

      <h3 className="font-bold text-white text-sm leading-tight mb-1">{space.title}</h3>
      <p className="text-xs text-zinc-400 mb-3">Hosted by <span className="text-yellow-400">{space.host}</span></p>

      <div className="flex flex-wrap gap-1 mb-3">
        {space.tags.map(t => (
          <span key={t} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">#{t}</span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{space.started_at}</span>
        {isLive && space.twitter_space_url && (
          <a
            href={space.twitter_space_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-full hover:bg-yellow-300 transition-colors"
          >
            Listen <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {isScheduled && (
          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1.5 rounded-full">Set Reminder</span>
        )}
      </div>
    </div>
  );
}
