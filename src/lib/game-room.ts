export type GameMode = 'solo' | 'bot' | 'multiplayer';
export type RoomStatus = 'lobby' | 'starting' | 'playing' | 'finished';

export interface RoomPlayer {
  id: string;
  name: string;
  avatar?: string;
  isBot?: boolean;
  ready: boolean;
  score: number;
  joinedAt: number;
}

export interface GameRoom {
  id: string;
  game: string;
  mode: GameMode;
  hostId: string;
  targetPlayers: number;
  minPlayers: number;
  maxPlayers: number;
  status: RoomStatus;
  round: number;
  players: RoomPlayer[];
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_GAME_ROOM: Pick<GameRoom, 'minPlayers' | 'maxPlayers' | 'targetPlayers'> = {
  minPlayers: 2,
  maxPlayers: 12,
  targetPlayers: 4,
};

export function normalizeTargetPlayers(value: unknown, min = 2, max = 12) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.min(Math.max(DEFAULT_GAME_ROOM.targetPlayers, min), max);
  return Math.min(Math.max(Math.floor(parsed), min), max);
}

export function canStartRoom(room: GameRoom) {
  if (room.status !== 'lobby') return false;
  if (room.players.length < room.minPlayers) return false;
  return room.players.filter((player) => player.ready).length >= room.minPlayers;
}

export function roomNeedsBots(room: GameRoom) {
  return room.mode === 'bot' && room.players.length < room.targetPlayers;
}

export function fillRoomWithBots(room: GameRoom, botFactory: (index: number) => RoomPlayer) {
  const nextPlayers = [...room.players];
  let botIndex = 1;
  while (nextPlayers.length < room.targetPlayers && nextPlayers.length < room.maxPlayers) {
    nextPlayers.push(botFactory(botIndex));
    botIndex += 1;
  }
  return { ...room, players: nextPlayers, updatedAt: Date.now() };
}

export function addRoomPlayer(room: GameRoom, player: RoomPlayer) {
  if (room.status !== 'lobby') return room;
  if (room.players.some((existing) => existing.id === player.id)) return room;
  if (room.players.length >= room.maxPlayers) return room;
  return { ...room, players: [...room.players, player], updatedAt: Date.now() };
}

export function setPlayerReady(room: GameRoom, playerId: string, ready: boolean) {
  return {
    ...room,
    players: room.players.map((player) => player.id === playerId ? { ...player, ready } : player),
    updatedAt: Date.now(),
  };
}

export function advanceRound(room: GameRoom) {
  return { ...room, round: room.round + 1, status: 'playing' as const, updatedAt: Date.now() };
}
