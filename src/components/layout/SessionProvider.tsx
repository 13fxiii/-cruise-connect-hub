"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import LiveSessionDock from "@/components/live/LiveSessionDock";

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
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

type SessionContextValue = {
  state: SessionState;
  startSession: (timestamp: string) => void;
  endSession: (timestamp: string) => void;
  resetSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const startSession = useCallback(
    (timestamp: string) => dispatch({ type: "SESSION_STARTED", meta: { timestamp } }),
    [],
  );
  const endSession = useCallback(
    (timestamp: string) => dispatch({ type: "SESSION_ENDED", meta: { timestamp } }),
    [],
  );
  const resetSession = useCallback(() => dispatch({ type: "SESSION_RESET" }), []);

  const value = useMemo<SessionContextValue>(
    () => ({ state, startSession, endSession, resetSession }),
    [endSession, resetSession, startSession, state],
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
