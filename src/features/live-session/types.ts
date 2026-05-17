export type SessionExperience = "space" | "game" | "music" | "movie" | "chat" | "vote";

export type SessionEventMeta = {
  timestamp: string;
};

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

export type SpaceAudioInput = Omit<SpaceAudioState, "muted" | "minimized" | "connected">;

export type LiveSessionEvent =
  | { type: "session:hydrate"; payload: LiveSessionState; meta: SessionEventMeta }
  | { type: "space:join"; payload: SpaceAudioInput; meta: SessionEventMeta }
  | { type: "space:toggle-mute"; meta: SessionEventMeta }
  | { type: "space:toggle-minimize"; meta: SessionEventMeta }
  | { type: "space:disconnect"; meta: SessionEventMeta };
