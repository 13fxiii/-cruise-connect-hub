"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { usePathname } from "next/navigation";

type SessionEventMeta = {
  timestamp: string;
};

type SessionState = {
  isLive: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

type SessionAction =
  | { type: "SESSION_STARTED"; meta: SessionEventMeta }
  | { type: "SESSION_ENDED"; meta: SessionEventMeta }
  | { type: "SESSION_RESET" };

const initialState: SessionState = {
  isLive: false,
  startedAt: null,
  endedAt: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SESSION_STARTED":
      return {
        ...state,
        isLive: true,
        startedAt: action.meta.timestamp,
        endedAt: null,
      };
    case "SESSION_ENDED":
      return {
        ...state,
        isLive: false,
        endedAt: action.meta.timestamp,
      };
    case "SESSION_RESET":
      return initialState;
    default:
      return state;
  }
}

type SessionContextValue = {
  state: SessionState;
  startSession: (timestamp: string) => void;
  endSession: (timestamp: string) => void;
  resetSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function LiveSessionDock() {
  const pathname = usePathname();
  const isHiddenRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/rules");

  if (isHiddenRoute) return null;
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const value = useMemo<SessionContextValue>(
    () => ({
      state,
      startSession: (timestamp: string) => dispatch({ type: "SESSION_STARTED", meta: { timestamp } }),
      endSession: (timestamp: string) => dispatch({ type: "SESSION_ENDED", meta: { timestamp } }),
      resetSession: () => dispatch({ type: "SESSION_RESET" }),
    }),
    [state],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      <LiveSessionDock />
    </SessionContext.Provider>
  );
}

export function useSessionState() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionState must be used within SessionProvider");
  return ctx;
}

export { sessionReducer, type SessionAction, type SessionState };
