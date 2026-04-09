import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function CinemaPage() {
  const cinemaUrl = process.env.NEXT_PUBLIC_CRUISE_CINEMA_URL;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Cruise Cinema" back />
      <main className="max-w-5xl mx-auto px-4 pt-4">
        {!cinemaUrl ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <p className="text-white font-bold">Cruise Cinema not linked yet.</p>
            <p className="text-zinc-400 text-sm mt-1">
              Set <code>NEXT_PUBLIC_CRUISE_CINEMA_URL</code> to your NyumatFlix deployment URL.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-black">
            <iframe
              src={cinemaUrl}
              className="w-full min-h-[78vh]"
              title="Cruise Cinema"
              allow="autoplay; fullscreen; encrypted-media"
            />
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
