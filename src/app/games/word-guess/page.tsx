"use client";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Home, Delete } from "lucide-react";

import Link from "next/link";

const WORDS = [
  {word:"NAIJA",hint:"Slang for Nigeria"},
  {word:"LAGOS",hint:"Nigeria's biggest city"},
  {word:"JOLLOF",hint:"The famous rice dish"},
  {word:"ABUJA",hint:"Nigeria's capital"},
  {word:"WAHALA",hint:"Means trouble/problem"},
  {word:"CRUISE",hint:"Chill/have fun"},
  {word:"SABI",hint:"To know / be skilled"},
  {word:"AFRO",hint:"Music style from Africa"},
  {word:"BANGA",hint:"A type of soup"},
  {word:"GELE",hint:"Traditional head tie"},
  {word:"DANFO",hint:"Yellow Lagos bus"},
  {word:"SUYA",hint:"Grilled spiced meat"},
  {word:"AGEGE",hint:"Lagos neighborhood famous for bread"},
  {word:"OWAMBE",hint:"Big Naija party"},
  {word:"PEPPER",hint:"Hot ingredient in Naija food"},
];

const MAX_GUESSES = 6;
const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

type LetterState = "correct"|"present"|"absent"|"empty"|"tbd";

interface LetterTile {
  letter: string;
  state: LetterState;
}

export default function WordGuessingPage() {
  const [wordData, setWordData] = useState(WORDS[0]);
  const [guesses, setGuesses] = useState<LetterTile[][]>([]);
  const [current, setCurrent] = useState("");
  const [phase, setPhase] = useState<"playing"|"won"|"lost">("playing");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [keyStates, setKeyStates] = useState<Record<string,LetterState>>({});

  const TARGET = wordData.word.toUpperCase();
  const wordLen = TARGET.length;

  const initGame = useCallback(() => {
    const w = WORDS[Math.floor(Math.random()*WORDS.length)];
    setWordData(w);
    setGuesses([]);
    setCurrent("");
    setPhase("playing");
    setMessage("");
    setKeyStates({});
  }, []);

  useEffect(()=>{ initGame(); }, []);

  const showMessage = (msg:string) => {
    setMessage(msg);
    setTimeout(()=>setMessage(""),2000);
  };

  const submitGuess = useCallback(()=>{
    if(current.length !== wordLen){ setShake(true); setTimeout(()=>setShake(false),600); showMessage(`Word must be ${wordLen} letters`); return; }

    const tiles: LetterTile[] = [];
    const targetArr = TARGET.split("");
    const guessArr = current.split("");
    const result: LetterState[] = Array(wordLen).fill("absent");
    const targetUsed = Array(wordLen).fill(false);

    // First pass: correct
    guessArr.forEach((l,i)=>{
      if(l===targetArr[i]){ result[i]="correct"; targetUsed[i]=true; }
    });
    // Second pass: present
    guessArr.forEach((l,i)=>{
      if(result[i]==="correct") return;
      const ti=targetArr.findIndex((t,j)=>t===l&&!targetUsed[j]);
      if(ti!==-1){ result[i]="present"; targetUsed[ti]=true; }
    });

    guessArr.forEach((l,i)=>tiles.push({letter:l,state:result[i]}));

    const newGuesses=[...guesses,tiles];
    setGuesses(newGuesses);
    setCurrent("");

    // Update key states
    const newKeys={...keyStates};
    tiles.forEach(({letter,state})=>{
      const prev=newKeys[letter];
      if(!prev||state==="correct"||(state==="present"&&prev==="absent")) newKeys[letter]=state;
    });
    setKeyStates(newKeys);

    if(current===TARGET){
      setPhase("won");
      showMessage(["Legendary!","Brilliant!","Great!","Nice!","Phew!","Lucky!"][newGuesses.length-1]||"Done!");
    } else if(newGuesses.length>=MAX_GUESSES){
      setPhase("lost");
      showMessage(`The word was ${TARGET}`);
    }
  },[current,wordLen,TARGET,guesses,keyStates]);

  const handleKey = useCallback((key:string)=>{
    if(phase!=="playing") return;
    if(key==="ENTER"){ submitGuess(); return; }
    if(key==="⌫"||key==="BACKSPACE"){ setCurrent(c=>c.slice(0,-1)); return; }
    if(/^[A-Z]$/.test(key)&&current.length<wordLen) setCurrent(c=>c+key);
  },[phase,current,wordLen,submitGuess]);

  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>handleKey(e.key.toUpperCase());
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[handleKey]);

  const tileColor = (state:LetterState) => ({
    correct:"bg-green-600 border-green-600 text-white",
    present:"bg-yellow-500 border-yellow-500 text-white",
    absent:"bg-zinc-700 border-zinc-700 text-white",
    empty:"bg-transparent border-zinc-700 text-white",
    tbd:"bg-transparent border-zinc-500 text-white",
  }[state]);

  const keyColor = (key:string) => {
    const s=keyStates[key];
    if(!s) return "bg-zinc-700 text-white hover:bg-zinc-600";
    if(s==="correct") return "bg-green-600 text-white";
    if(s==="present") return "bg-yellow-500 text-white";
    return "bg-zinc-800 text-zinc-500";
  };

  // Build display grid
  const displayRows: LetterTile[][] = [];
  for(let i=0;i<MAX_GUESSES;i++){
    if(i<guesses.length){ displayRows.push(guesses[i]); }
    else if(i===guesses.length&&phase==="playing"){
      const row: LetterTile[]=[];
      for(let j=0;j<wordLen;j++) row.push({letter:current[j]||"",state:current[j]?"tbd":"empty"});
      displayRows.push(row);
    } else {
      displayRows.push(Array(wordLen).fill({letter:"",state:"empty"}));
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="text-zinc-400 hover:text-white transition-colors text-sm">← Games</Link>
          <div className="text-center">
            <h1 className="text-xl font-black text-white">Naija Wordle 🇳🇬</h1>
            <p className="text-zinc-500 text-xs">Guess the Naija word</p>
          </div>
          <button onClick={initGame} className="text-zinc-400 hover:text-white transition-colors">
            <RotateCcw className="w-5 h-5"/>
          </button>
        </div>

        {/* Hint */}
        <div className="text-center mb-4">
          <span className="bg-zinc-800 text-zinc-300 text-sm px-3 py-1 rounded-full">💡 Hint: {wordData.hint}</span>
        </div>

        {/* Message */}
        {message&&(
          <div className="text-center mb-4">
            <span className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-full font-bold">{message}</span>
          </div>
        )}

        {/* Grid */}
        <div className="flex flex-col items-center gap-1.5 mb-6">
          {displayRows.map((row,ri)=>(
            <div key={ri} className={`flex gap-1.5 ${shake&&ri===guesses.length?"animate-bounce":""}`}>
              {row.map((tile,ci)=>(
                <div key={ci} className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-black rounded-lg transition-all duration-300 ${tileColor(tile.state)}`}>
                  {tile.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Win/Lose */}
        {(phase==="won"||phase==="lost")&&(
          <div className={`mb-4 p-4 rounded-2xl text-center border ${phase==="won"?"bg-green-500/10 border-green-500/30":"bg-red-500/10 border-red-500/30"}`}>
            <div className="text-3xl mb-2">{phase==="won"?"🏆":"😔"}</div>
            <p className="text-white font-black text-lg">{phase==="won"?`You got it in ${guesses.length}!`:`The word was: ${TARGET}`}</p>
            <button onClick={initGame} className="mt-3 bg-yellow-400 text-black font-black px-6 py-2 rounded-full hover:bg-yellow-300 transition-all text-sm">
              Play Again
            </button>
          </div>
        )}

        {/* Keyboard */}
        <div className="space-y-1.5">
          {KEYBOARD_ROWS.map((row,ri)=>(
            <div key={ri} className="flex justify-center gap-1">
              {row.map(key=>(
                <button key={key} onClick={()=>handleKey(key==="⌫"?"BACKSPACE":key)}
                  className={`rounded-lg font-black text-sm transition-all ${key.length>1?"px-3 py-4 text-xs min-w-[48px]":"w-9 h-12"} ${keyColor(key)}`}>
                  {key==="⌫"?<Delete className="w-4 h-4"/>:key}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <Link href="/games" className="text-zinc-500 text-sm hover:text-zinc-300 flex items-center gap-1 transition-colors">
            <Home className="w-4 h-4"/> Back to Games
          </Link>
        </div>
      </main>
    </div>
  );
}
