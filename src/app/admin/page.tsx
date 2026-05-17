"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_HANDLES = ["13fxiii", "13fxiii_", "thecruisech"];

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        return;
      }

      const metadata = user.user_metadata || {};
      const handle = String(
        metadata.preferred_username || metadata.username || metadata.user_name || "",
      )
        .toLowerCase()
        .replace(/^@/, "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, role, x_username, username")
        .eq("id", user.id)
        .maybeSingle();

      const profileHandle = String(profile?.x_username || profile?.username || "")
        .toLowerCase()
        .replace(/^@/, "");

      setAuthorized(
        ADMIN_HANDLES.includes(handle) ||
          ADMIN_HANDLES.includes(profileHandle) ||
          profile?.is_admin === true ||
          profile?.role === "admin",
      );
    }

    checkAccess().catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-4 py-6 text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-yellow-400" />
            <p className="text-sm text-zinc-500">Checking admin access...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-4 py-6 text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-sm text-center">
            <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-red-400" />
            <h1 className="mb-2 text-xl font-black">Restricted Area</h1>
            <p className="mb-6 text-sm leading-relaxed text-zinc-500">
              This admin panel is locked to Cruise Connect Hub admins while the Foundation MVP is being stabilized.
            </p>
            <Link href="/feed" className="inline-flex rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black">
              Back to Feed
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-6 pb-28 text-white">
      <section className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black">Admin Panel</h1>
            <p className="text-xs text-zinc-500">Foundation MVP stabilization mode</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-2 text-sm font-bold text-white">Production Focus</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Advanced admin tools are intentionally parked during this pass so auth, onboarding, profiles, feed, live
            sessions, one game, and one music room can ship cleanly first.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Feed", "/feed"],
            ["Live Spaces", "/spaces"],
            ["Games", "/games"],
            ["Music", "/music"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm font-bold text-zinc-200"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
