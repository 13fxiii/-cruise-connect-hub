export type GameMode = 'solo' | 'bot' | 'multiplayer';
export type RoomStatus = 'lobby' | 'starting' | 'playing' | 'finished';
export interface RoomPlayer { id:string; name:string; avatar?:string; isBot?:boolean; ready:boolean; score:number; joinedAt:number; }
export interface GameRoom { id:string; game:string; mode:GameMode; hostId:string; targetPlayers:number; minPlayers:number; maxPlayers:number; status:RoomStatus; round:number; players:RoomPlayer[]; createdAt:number; updatedAt:number; }
export const DEFAULT_GAME_ROOM:Pick<GameRoom,'minPlayers'|'maxPlayers'|'targetPlayers'>={minPlayers:2,maxPlayers:12,targetPlayers:4};
export function normalizeTargetPlayers(value:unknown,min=2,max=12){const n=Number(value);if(!Number.isFinite(n))return Math.min(Math.max(4,min),max);return Math.min(Math.max(Math.floor(n),min),max);}
export function createGameRoom(input:{id:string;game:string;mode:GameMode;host:RoomPlayer;targetPlayers?:unknown;minPlayers?:number;maxPlayers?:number}):GameRoom{const min=input.mode==='solo'?1:Math.max(2,input.minPlayers??2),max=Math.max(min,input.maxPlayers??12),target=input.mode==='solo'?1:normalizeTargetPlayers(input.targetPlayers,min,max),host={...input.host,ready:input.mode==='solo',score:input.host.score??0};return{id:input.id,game:input.game,mode:input.mode,hostId:host.id,targetPlayers:target,minPlayers:min,maxPlayers:max,status:'lobby',round:1,players:[host],createdAt:Date.now(),updatedAt:Date.now()};}
export function canStartRoom(room:GameRoom){if(room.status!=='lobby')return false;if(room.mode==='solo')return room.players.length===1;return room.players.length>=room.minPlayers&&room.players.filter(p=>p.ready).length>=room.minPlayers;}
export function roomNeedsBots(room:GameRoom){return room.mode==='bot'&&room.players.length<room.targetPlayers;}
export function fillRoomWithBots(room:GameRoom,botFactory:(index:number)=>RoomPlayer){const players=[...room.players];let i=1;while(players.length<room.targetPlayers&&players.length<room.maxPlayers){const bot=botFactory(i++);players.push({...bot,isBot:true,ready:true,score:bot.score??0});}return{...room,players,updatedAt:Date.now()};}
export function addRoomPlayer(room:GameRoom,player:RoomPlayer){if(room.status!=='lobby'||room.players.some(p=>p.id===player.id)||room.players.length>=room.targetPlayers||room.players.length>=room.maxPlayers)return room;return{...room,players:[...room.players,{...player,score:player.score??0}],updatedAt:Date.now()};}
export function removeRoomPlayer(room:GameRoom,playerId:string){if(room.status!=='lobby')return room;return{...room,players:room.players.filter(p=>p.id!==playerId),updatedAt:Date.now()};}
export function setPlayerReady(room:GameRoom,playerId:string,ready:boolean){return{...room,players:room.players.map(p=>p.id===playerId?{...p,ready}:p),updatedAt:Date.now()};}
export function startRoom(room:GameRoom){return canStartRoom(room)?{...room,status:'playing' as const,updatedAt:Date.now()}:room;}
export function updateScore(room:GameRoom,playerId:string,delta:number){return{...room,players:room.players.map(p=>p.id===playerId?{...p,score:p.score+delta}:p),updatedAt:Date.now()};}
export function advanceRound(room:GameRoom){return{...room,round:room.round+1,status:'playing' as const,updatedAt:Date.now()};}
export function finishRoom(room:GameRoom){return{...room,status:'finished' as const,updatedAt:Date.now()};}
