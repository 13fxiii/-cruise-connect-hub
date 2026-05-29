import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function HangoutsGroupPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Hangouts Group" back />
      <main className="max-w-lg mx-auto px-4 pt-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-white font-bold">Cruise Connect Hangouts</p>
          <p className="text-zinc-400 text-sm mt-1">
            This is the social room for community hangout reminders, gist, and meetup follow-ups.
          </p>
          <Link href="/messages" className="inline-block mt-4 text-xs text-yellow-400 hover:underline">
            ← Back to Messages
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
