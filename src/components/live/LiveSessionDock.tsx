"use client";

import { useMemo, useReducer } from "react";
import { usePathname } from "next/navigation";
import { Mic, MicOff, Minimize2, X } from "lucide-react";
import { createEmptySession, reduceSessionState } from "@/features/live-session/session-engine";
import { shouldHideAppChrome } from "@/lib/routeVisibility";
import type { SpaceAudioInput } from "@/features/live-session/types";

const DEFAULT_SPACE: SpaceAudioInput = {
  spaceId: "foundation-live-space",
  title: "Live X Space",
};

function timestampMeta() {
  return { timestamp: new Date().toISOString() };
}

export default function LiveSessionDock() {
  const pathname = usePathname();
  const [session, dispatch] = useReducer(
    reduceSessionState,
    createEmptySession("foundation-session", "cruise-connect-hub"),
  );

  const isConnected = Boolean(session.spaceAudio?.connected);
  const isMuted = Boolean(session.spaceAudio?.muted);
  const minimized = Boolean(session.spaceAudio?.minimized);
  const title = session.spaceAudio?.title || DEFAULT_SPACE.title;
  const cta = useMemo(() => (isConnected ? "Connected" : "Join Space Audio"), [isConnected]);

  if (shouldHideAppChrome(pathname)) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-40 md:right-auto md:max-w-sm">
      <div className="rounded-2xl border border-yellow-400/20 bg-zinc-950/90 p-3 shadow-xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80">Live Session</p>
            <p className="truncate text-sm font-semibold text-white">{title}</p>
          </div>
          <button
            className="shrink-0 rounded-lg bg-yellow-400 px-2 py-1 text-xs font-bold text-black"
            onClick={() =>
              dispatch(
                isConnected
                  ? { type: "space:disconnect", meta: timestampMeta() }
                  : { type: "space:join", payload: DEFAULT_SPACE, meta: timestampMeta() },
              )
            }
          >
            {cta}
          </button>
        </div>

        {isConnected && !minimized && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: "space:toggle-mute", meta: timestampMeta() })}
              className="flex-1 rounded-xl border border-zinc-700 py-2 text-xs font-semibold text-zinc-100"
            >
              {isMuted ? <MicOff className="mr-1 inline h-4 w-4" /> : <Mic className="mr-1 inline h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={() => dispatch({ type: "space:toggle-minimize", meta: timestampMeta() })}
              className="rounded-xl border border-zinc-700 p-2 text-zinc-200"
              aria-label="Minimize space controls"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => dispatch({ type: "space:disconnect", meta: timestampMeta() })}
              className="rounded-xl border border-red-500/60 p-2 text-red-300"
              aria-label="Disconnect space audio"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isConnected && minimized && (
          <button
            onClick={() => dispatch({ type: "space:toggle-minimize", meta: timestampMeta() })}
            className="mt-3 w-full rounded-xl border border-zinc-700 py-2 text-xs font-semibold text-zinc-300"
          >
            Expand Audio Controls
          </button>
        )}
      </div>
    </div>
  );
}
