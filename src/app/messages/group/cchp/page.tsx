import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

function parseCsv(value?: string | null): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function CchpGroupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?redirectTo=/messages/group/cchp");

  const allowedIds = parseCsv(process.env.CCHP_MEMBER_IDS || process.env.ADMIN_USER_IDS);
  const allowedHandles = parseCsv(process.env.CCHP_MEMBER_HANDLES);
  const userHandle = (session.user.twitterHandle || "").replace(/^@/, "").toLowerCase();
  const isIdAllowed = allowedIds.length === 0 || allowedIds.includes(session.user.id);
  const isHandleAllowed =
    allowedHandles.length === 0 ||
    allowedHandles.map((h) => h.replace(/^@/, "").toLowerCase()).includes(userHandle);
  const isAllowed = isIdAllowed && isHandleAllowed;
  if (!isAllowed) redirect("/messages");

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="CCHP Group" back />
      <main className="max-w-lg mx-auto px-4 pt-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-white font-bold">Cruise Connect Hangout Planners</p>
          <p className="text-zinc-400 text-sm mt-1">
            This channel is reserved for planning events, assigning roles, and posting logistics updates.
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
