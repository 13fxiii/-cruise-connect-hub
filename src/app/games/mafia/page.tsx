// @ts-nocheck
"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Eye, EyeOff, Moon, Sun, Users, Skull, Shield, Search } from "lucide-react";

type Role = "Mafia"|"Detective"|"Doctor"|"Villager";
type Phase = "lobby"|"role-reveal"|"night"|"day-discuss"|"day-vote"|"result"|"game-over";

const ROLES: Record<Role, {icon:string;color:string;desc:string}> = {
  Mafia:      { icon:"🔪", color:"text-red-400",    desc:"Eliminate villagers at night without being caught" },
  Detective:  { icon:"🔍", color:"text-blue-400",   desc:"Investigate one player each night to learn their role" },
  Doctor:     { icon:"💊", color:"text-green-400",  desc:"Protect one player each night from elimination" },
  Villager:   { icon:"👤", color:"text-zinc-300",   desc:"Vote to eliminate the Mafia during the day" },
};

const BOT_NAMES = ["Lagos King","Abuja Babe","PH G","Calabar Queen","Kano Chief","Ibadan Ace"];

function assignRoles(count: number): Role[] {
  const roles: Role[] = ["Mafia","Detective","Doctor"];
  for (let i = roles.length; i < count; i++) roles.push("Villager");
  return roles.sort(() => Math.random() - 0.5);
}

export default function MafiaPage() {
  const [playerCount, setPlayerCount] = useState(6);
  const [phase, setPhase]   = useState<Phase>("lobby");
  const [roles, setRoles]   = useState<Role[]>([]);
  const [alive, setAlive]   = useState<boolean[]>([]);
  const [showRole, setShowRole] = useState(false);
  const [nightTarget, setNightTarget] = useState<number|null>(null);
  const [protectedPlayer, setProtectedPlayer] = useState<number|null>(null);
  const [voteTarget, setVoteTarget] = useState<number|null>(null);
  const [log, setLog]       = useState<string[]>([]);
  const [day, setDay]       = useState(1);
  const [winner, setWinner] = useState<string|null>(null);

  const allPlayers = ["You", ...BOT_NAMES.slice(0, playerCount - 1)];

  const startGame = () => {
    const r = assignRoles(playerCount);
    setRoles(r);
    setAlive(new Array(playerCount).fill(true));
    setPhase("role-reveal");
    setDay(1);
    setLog(["Game started! Check your role."]);
    setWinner(null);
  };

  const checkWin = (aliveArr: boolean[], rolesArr: Role[]) => {
    const alivePlayers = aliveArr.map((a, i) => a ? rolesArr[i] : null).filter(Boolean);
    const mafiaAlive = alivePlayers.filter(r => r === "Mafia").length;
    const villageAlive = alivePlayers.filter(r => r !== "Mafia").length;
    if (mafiaAlive === 0) return "Village";
    if (mafiaAlive >= villageAlive) return "Mafia";
    return null;
  };

  const processNight = () => {
    if (nightTarget === null) return;
    const newAlive = [...alive];
    let eliminated: string | null = null;

    // Mafia eliminates (player is mafia? bot eliminates random)
    if (roles[0] === "Mafia") {
      // Player chose target
      if (nightTarget !== protectedPlayer) {
        newAlive[nightTarget] = false;
        eliminated = allPlayers[nightTarget];
      } else {
        eliminated = null; // Doctor saved
      }
    } else {
      // Bot mafia eliminates random non-mafia
      const mafiaIdx = roles.findIndex((r, i) => r === "Mafia" && i > 0);
      const villageTargets = alive.map((a, i) => a && roles[i] !== "Mafia" ? i : -1).filter(i => i >= 0);
      const mafiaTarget = villageTargets[Math.floor(Math.random() * villageTargets.length)];
      if (mafiaTarget !== undefined && mafiaTarget !== protectedPlayer) {
        newAlive[mafiaTarget] = false;
        eliminated = allPlayers[mafiaTarget];
      }
    }

    setAlive(newAlive);
    const newLog = [...log];
    if (eliminated) newLog.push(`☀️ Dawn: ${eliminated} was eliminated last night!`);
    else newLog.push("☀️ Dawn: No one was eliminated last night!");

    const w = checkWin(newAlive, roles);
    if (w) { setWinner(w); setPhase("game-over"); setLog(newLog); return; }

    setLog(newLog);
    setNightTarget(null);
    setProtectedPlayer(null);
    setPhase("day-discuss");
  };

  const processVote = () => {
    if (voteTarget === null) return;
    const newAlive = [...alive];
    newAlive[voteTarget] = false;
    setAlive(newAlive);
    const newLog = [...log, `🗳️ The village voted to eliminate ${allPlayers[voteTarget]} (${ROLES[roles[voteTarget]].icon} ${roles[voteTarget]})`];

    const w = checkWin(newAlive, roles);
    if (w) { setWinner(w); setPhase("game-over"); setLog(newLog); return; }

    setLog(newLog);
    setVoteTarget(null);
    setDay(d => d + 1);
    setPhase("night");
  };

  const myRole = roles[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/games" className="text-zinc-500 hover:text-white text-sm">← Games</Link>
          <h1 className="text-2xl font-black text-white">Mafia / Werewolf 🔪</h1>
        </div>

        {/* LOBBY */}
        {phase === "lobby" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <div className="text-5xl">🔪</div>
            <h2 className="text-white font-black text-2xl">Mafia</h2>
            <p className="text-zinc-400 text-sm">Villagers try to eliminate the Mafia. Mafia tries to take over the village. Can you find who's lying?</p>
            <div className="grid grid-cols-2 gap-3 text-left max-w-xs mx-auto">
              {(Object.entries(ROLES) as [Role, any][]).map(([role, info]) => (
                <div key={role} className="bg-zinc-900 rounded-xl p-3">
                  <div className={`font-black text-sm ${info.color}`}>{info.icon} {role}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{info.desc}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-zinc-400 text-xs mb-2">Number of players</div>
              <div className="flex gap-2 justify-center">
                {[5,6,7,8].map(n => (
                  <button key={n} onClick={() => setPlayerCount(n)}
                    className={`w-10 h-10 rounded-xl font-black text-sm ${playerCount === n ? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-300"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startGame} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300">
              Start Game 🔪
            </button>
          </div>
        )}

        {/* ROLE REVEAL */}
        {phase === "role-reveal" && myRole && (
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center">
              <div className="text-zinc-400 text-xs font-bold mb-3 tracking-widest">YOUR SECRET ROLE</div>
              <button onClick={() => setShowRole(!showRole)}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full hover:border-yellow-400 transition-all">
                {showRole ? (
                  <div>
                    <div className="text-5xl mb-2">{ROLES[myRole].icon}</div>
                    <div className={`text-2xl font-black mb-2 ${ROLES[myRole].color}`}>{myRole}</div>
                    <div className="text-zinc-400 text-sm">{ROLES[myRole].desc}</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <EyeOff className="w-8 h-8 text-zinc-600" />
                    <div className="text-zinc-500 text-sm">Tap to reveal your role</div>
                    <div className="text-zinc-600 text-xs">(Don't let others see!)</div>
                  </div>
                )}
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="text-zinc-400 text-xs font-bold mb-2">PLAYERS ({playerCount})</div>
              <div className="grid grid-cols-2 gap-2">
                {allPlayers.map((p, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${i === 0 ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-zinc-900"}`}>
                    <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-black text-white">{p.charAt(0)}</div>
                    <div className="text-white text-xs font-bold">{p}</div>
                    {i === 0 && <div className="ml-auto text-yellow-400 text-[10px] font-bold">YOU</div>}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setPhase("night")} className="w-full bg-zinc-800 text-white font-black py-3 rounded-xl hover:bg-zinc-700 flex items-center justify-center gap-2">
              <Moon className="w-4 h-4" /> Begin Night Phase
            </button>
          </div>
        )}

        {/* NIGHT */}
        {phase === "night" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="text-center">
              <Moon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h2 className="text-white font-black text-xl">Night Phase — Day {day}</h2>
              <p className="text-zinc-400 text-xs mt-1">Everyone closes their eyes. Mafia chooses a victim.</p>
            </div>
            {myRole === "Mafia" && (
              <div>
                <div className="text-red-400 font-bold text-sm mb-2">🔪 Choose your victim:</div>
                <div className="space-y-2">
                  {allPlayers.map((p, i) => i !== 0 && alive[i] && (
                    <button key={i} onClick={() => setNightTarget(i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${nightTarget === i ? "border-red-500 bg-red-500/10" : "border-zinc-700 bg-zinc-900"}`}>
                      <Skull className="w-4 h-4 text-red-400" />
                      <span className="text-white font-bold">{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {myRole === "Doctor" && (
              <div>
                <div className="text-green-400 font-bold text-sm mb-2">💊 Protect someone:</div>
                <div className="space-y-2">
                  {allPlayers.map((p, i) => alive[i] && (
                    <button key={i} onClick={() => setProtectedPlayer(i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${protectedPlayer === i ? "border-green-500 bg-green-500/10" : "border-zinc-700 bg-zinc-900"}`}>
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-white font-bold">{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {myRole === "Detective" && (
              <div>
                <div className="text-blue-400 font-bold text-sm mb-2">🔍 Investigate someone:</div>
                <div className="space-y-2">
                  {allPlayers.map((p, i) => i !== 0 && alive[i] && (
                    <button key={i} onClick={() => setNightTarget(i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${nightTarget === i ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 bg-zinc-900"}`}>
                      <Search className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-bold">{p}</span>
                      {nightTarget === i && <span className="ml-auto text-blue-400 text-xs font-bold">{roles[i] === "Mafia" ? "⚠️ MAFIA!" : "✅ Innocent"}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {myRole === "Villager" && (
              <div className="bg-zinc-900 rounded-xl p-4 text-center">
                <div className="text-zinc-400 text-sm">You are a Villager. Sleep and wait for dawn...</div>
                <div className="text-2xl mt-2">😴</div>
              </div>
            )}
            <button onClick={processNight} disabled={myRole === "Mafia" && nightTarget === null}
              className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center gap-2">
              <Sun className="w-4 h-4" /> Advance to Dawn
            </button>
          </div>
        )}

        {/* DAY DISCUSS */}
        {phase === "day-discuss" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="text-center">
              <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-white font-black text-xl">Day Phase — Discuss!</h2>
              <p className="text-zinc-400 text-xs mt-1">Talk, accuse, and convince the village who the Mafia is.</p>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {log.slice(-5).map((l, i) => <div key={i} className="text-zinc-300 text-sm">{l}</div>)}
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 space-y-2">
              {["That was suspicious...","I think I know who it is!","Don't vote for me, I'm innocent!","We need to be careful."].map((msg, i) => (
                <div key={i} className={`text-zinc-400 text-xs bg-zinc-800 rounded-lg px-3 py-1.5`}>
                  <span className="text-yellow-400 font-bold">{allPlayers[i % allPlayers.length]}:</span> {msg}
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("day-vote")} className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 flex items-center justify-center gap-2">
              <Users className="w-4 h-4" /> Proceed to Vote
            </button>
          </div>
        )}

        {/* DAY VOTE */}
        {phase === "day-vote" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-white font-black text-xl">🗳️ Vote to Eliminate</h2>
              <p className="text-zinc-400 text-xs mt-1">Who do you think is the Mafia?</p>
            </div>
            <div className="space-y-2">
              {allPlayers.map((p, i) => alive[i] && i !== 0 && (
                <button key={i} onClick={() => setVoteTarget(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${voteTarget === i ? "border-yellow-400 bg-yellow-400/10" : "border-zinc-700 bg-zinc-900"}`}>
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-black text-white">{p.charAt(0)}</div>
                  <span className="text-white font-bold">{p}</span>
                  {voteTarget === i && <span className="ml-auto text-yellow-400 text-xs font-bold">SELECTED</span>}
                </button>
              ))}
            </div>
            <button onClick={processVote} disabled={voteTarget === null}
              className="w-full bg-red-600 text-white font-black py-3 rounded-xl hover:bg-red-500 disabled:opacity-40">
              Eliminate Selected Player 🗳️
            </button>
          </div>
        )}

        {/* GAME OVER */}
        {phase === "game-over" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <div className="text-5xl">{winner === "Village" ? "🎉" : "💀"}</div>
            <h2 className="text-white font-black text-2xl">{winner === "Village" ? "Village Wins!" : "Mafia Wins!"}</h2>
            <p className="text-zinc-400 text-sm">{winner === "Village" ? "The Mafia has been eliminated!" : "The Mafia controls the village!"}</p>
            <div className="space-y-2">
              <div className="text-zinc-400 text-xs font-bold">ALL ROLES REVEALED:</div>
              {allPlayers.map((p, i) => (
                <div key={i} className={`flex items-center gap-3 bg-zinc-900 rounded-xl p-3 ${!alive[i] ? "opacity-50" : ""}`}>
                  <span className="text-xl">{ROLES[roles[i]]?.icon}</span>
                  <span className="text-white font-bold">{p}</span>
                  <span className={`ml-auto font-bold text-sm ${ROLES[roles[i]]?.color}`}>{roles[i]}</span>
                  {!alive[i] && <span className="text-zinc-600 text-xs">☠️ eliminated</span>}
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("lobby")} className="bg-yellow-400 text-black font-black px-8 py-3 rounded-full hover:bg-yellow-300">
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
