import type { LiveSessionEvent, LiveSessionState } from "./types";

export const createEmptySession = (sessionId: string, hostId: string): LiveSessionState => ({
  sessionId,
  hostId,
  experiences: ["chat", "vote"],
  updatedAt: new Date().toISOString(),
});

export const reduceSessionState = (
  current: LiveSessionState,
  event: LiveSessionEvent,
): LiveSessionState => {
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
        updatedAt: new Date().toISOString(),
      };
    case "space:toggle-mute":
      if (!current.spaceAudio) return current;
      return {
        ...current,
        spaceAudio: { ...current.spaceAudio, muted: !current.spaceAudio.muted },
        updatedAt: new Date().toISOString(),
      };
    case "space:toggle-minimize":
      if (!current.spaceAudio) return current;
      return {
        ...current,
        spaceAudio: { ...current.spaceAudio, minimized: !current.spaceAudio.minimized },
        updatedAt: new Date().toISOString(),
      };
    case "space:disconnect":
      return {
        ...current,
        experiences: current.experiences.filter((x) => x !== "space"),
        spaceAudio: current.spaceAudio
          ? { ...current.spaceAudio, connected: false }
          : undefined,
        updatedAt: new Date().toISOString(),
      };
    default:
      return current;
  }
};
