export type SessionExperience = "space" | "game" | "music" | "movie" | "chat" | "vote";

export interface SpaceAudioState {
  spaceId: string;
  title: string;
  audioUrl?: string;
  muted: boolean;
  minimized: boolean;
  connected: boolean;
}

export interface LiveSessionState {
  sessionId: string;
  hostId: string;
  experiences: SessionExperience[];
  spaceAudio?: SpaceAudioState;
  activeGameId?: string;
  activeMovieId?: string;
  activePlaylistId?: string;
  updatedAt: string;
}

export type LiveSessionEvent =
  | { type: "session:hydrate"; payload: LiveSessionState }
  | { type: "space:join"; payload: Omit<SpaceAudioState, "muted" | "minimized" | "connected"> }
  | { type: "space:toggle-mute" }
  | { type: "space:toggle-minimize" }
  | { type: "space:disconnect" };
