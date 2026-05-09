"use client";

import { useMemo, useReducer } from "react";
import { Mic, MicOff, Minimize2, X } from "lucide-react";
import { createEmptySession, reduceSessionState } from "@/features/live-session/session-engine";

const defaultSession = createEmptySession("global-session", "host");

export default function LiveSessionDock() {
  const [session, dispatch] = useReducer(reduceSessionState, {
    ...defaultSession,
    spaceAudio: {
      spaceId: "demo-space",
      title: "Live X Space",
      muted: false,
      minimized: false,
      connected: false,
    },
  });

  const isConnected = Boolean(session.spaceAudio?.connected);
  const isMuted = Boolean(session.spaceAudio?.muted);
  const minimized = Boolean(session.spaceAudio?.minimized);

  const cta = useMemo(() => (isConnected ? "Connected" : "Join Space Audio"), [isConnected]);

  return (
    <div className="fixed bottom-20 left-3 right-3 z-40 md:right-auto md:max-w-sm">
      <div className="rounded-2xl border border-yellow-400/20 bg-zinc-950/80 backdrop-blur-xl shadow-xl shadow-black/30 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-yellow-400/80">Live Session</p>
            <p className="text-sm font-semibold text-white">{session.spaceAudio?.title}</p>
          </div>
          <button
            className="text-xs px-2 py-1 rounded-lg bg-yellow-400 text-black font-bold"
            onClick={() =>
              dispatch(
                isConnected
                  ? { type: "space:disconnect" }
                  : { type: "space:join", payload: { spaceId: "demo-space", title: "Live X Space" } },
              )
            }
          >
            {cta}
          </button>
        </div>

        {isConnected && !minimized && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: "space:toggle-mute" })}
              className="flex-1 rounded-xl border border-zinc-700 py-2 text-xs font-semibold text-zinc-100"
            >
              {isMuted ? <MicOff className="inline mr-1 h-4 w-4" /> : <Mic className="inline mr-1 h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={() => dispatch({ type: "space:toggle-minimize" })}
              className="rounded-xl border border-zinc-700 p-2 text-zinc-200"
              aria-label="Minimize space controls"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => dispatch({ type: "space:disconnect" })}
              className="rounded-xl border border-red-500/60 p-2 text-red-300"
              aria-label="Disconnect space audio"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isConnected && minimized && (
          <button
            onClick={() => dispatch({ type: "space:toggle-minimize" })}
            className="mt-3 w-full rounded-xl border border-zinc-700 py-2 text-xs font-semibold text-zinc-300"
          >
            Expand Audio Controls
          </button>
        )}
      </div>
    </div>
  );
}
