import type { LiveSessionEvent, LiveSessionState } from "./types";

export function createEmptySession(
  sessionId: string,
  hostId: string,
  timestamp = new Date().toISOString(),
): LiveSessionState {
  return {
    sessionId,
    hostId,
    experiences: ["chat", "vote"],
    updatedAt: timestamp,
  };
}

export function reduceSessionState(
  current: LiveSessionState,
  event: LiveSessionEvent,
): LiveSessionState {
  switch (event.type) {
    case "session:hydrate":
      return event.payload;
    case "space:join":
      return {
        ...current,
        experiences: current.experiences.includes("space")
          ? current.experiences
          : [...current.experiences, "space"],
        spaceAudio: {
          ...event.payload,
          muted: false,
          minimized: false,
          connected: true,
        },
        updatedAt: event.meta.timestamp,
      };
    case "space:toggle-mute":
      if (!current.spaceAudio) return current;
      return {
        ...current,
        spaceAudio: { ...current.spaceAudio, muted: !current.spaceAudio.muted },
        updatedAt: event.meta.timestamp,
      };
    case "space:toggle-minimize":
      if (!current.spaceAudio) return current;
      return {
        ...current,
        spaceAudio: { ...current.spaceAudio, minimized: !current.spaceAudio.minimized },
        updatedAt: event.meta.timestamp,
      };
    case "space:disconnect":
      return {
        ...current,
        experiences: current.experiences.filter((experience) => experience !== "space"),
        spaceAudio: current.spaceAudio
          ? { ...current.spaceAudio, connected: false }
          : undefined,
        updatedAt: event.meta.timestamp,
      };
    default: {
      const exhaustiveCheck: never = event;
      return exhaustiveCheck;
    }
  }
}
