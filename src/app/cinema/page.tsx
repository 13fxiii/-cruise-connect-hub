import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";

export default function CinemaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Cruise Connect Movies" back />
      <main className="max-w-5xl mx-auto px-4 pt-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h1 className="text-white text-lg font-black">Cruise Connect Movies moved in-app ✅</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Movie browsing and playback now run directly inside Cruise Connect with no external redirect.
          </p>
          <Link
            href="/movies"
            className="inline-flex mt-4 rounded-xl bg-yellow-400 px-4 py-2 text-xs font-black text-black hover:bg-yellow-300"
          >
            Open Cruise Connect Movies
          </Link>
        </div>
      </main>
    </div>
  );
}
