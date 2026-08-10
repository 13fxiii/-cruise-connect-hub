export type SocialMode = 'solo' | 'bot' | 'multiplayer';
export type SocialRole = 'mafia' | 'werewolf' | 'detective' | 'doctor' | 'villager';
export type SocialPhase = 'lobby' | 'role-reveal' | 'night' | 'discussion' | 'vote' | 'results';

export interface SocialPlayer {
  id: string; name: string; avatar?: string; isBot?: boolean; role?: SocialRole;
  alive: boolean; ready: boolean; votes: number;
}

export interface SocialRoom {
  id: string; mode: SocialMode; targetPlayers: number; hostId: string;
  phase: SocialPhase; day: number; players: SocialPlayer[];
}

export const BOT_NAMES = ['Lagos King','Abuja Babe','PH G','Calabar Queen','Kano Chief','Ibadan Ace','Ibadan Ace','Cruise Minister'];

export function roleSet(count:number, faction:'mafia'|'werewolf'='werewolf'): SocialRole[] {
  const roles:SocialRole[] = [faction, 'detective', 'doctor'];
  while(roles.length<count) roles.push('villager');
  return roles.sort(()=>Math.random()-.5);
}

export function createSocialRoom(mode:SocialMode,targetPlayers:number):SocialRoom {
  const target = mode==='solo'?1:Math.min(12,Math.max(4,Math.floor(targetPlayers||6)));
  return {id:`social-${Date.now()}`,mode,targetPlayers:target,hostId:'you',phase:'lobby',day:1,players:[{id:'you',name:'You',avatar:'😎',alive:true,ready:mode==='solo',votes:0}]};
}

export function fillSocialBots(room:SocialRoom):SocialRoom {
  if(room.mode!=='bot') return room;
  const players=[...room.players];
  for(let i=players.length;i<room.targetPlayers;i++) players.push({id:`bot-${i}`,name:BOT_NAMES[i-1]||`Cruise Bot ${i}`,avatar:['🤖','👑','🔥','💅','🎭','🕺','😂','😎'][i%8],isBot:true,alive:true,ready:true,votes:0});
  return {...room,players};
}

export function assignRoles(room:SocialRoom,faction:'mafia'|'werewolf'='werewolf'):SocialRoom {
  const roles=roleSet(room.players.length,faction);
  return {...room,phase:'role-reveal',players:room.players.map((p,i)=>({...p,role:roles[i],alive:true,votes:0}))};
}

export function alivePlayers(room:SocialRoom){return room.players.filter(p=>p.alive)}
export function winner(room:SocialRoom){
  const alive=alivePlayers(room), evil=alive.filter(p=>p.role=== 'mafia'||p.role==='werewolf').length;
  const good=alive.length-evil;
  if(evil===0)return 'Village'; if(evil>=good)return room.players.some(p=>p.role==='werewolf')?'Werewolves':'Mafia'; return null;
}

export function voteOut(room:SocialRoom,targetId:string):SocialRoom {
  return {...room,players:room.players.map(p=>p.id===targetId?{...p,alive:false}:p),phase:'results'};
}
