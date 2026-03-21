"use client";
import { useState, useCallback } from "react";
import { Flame, Users, Shuffle, Home, RefreshCw } from "lucide-react";

import Link from "next/link";

type Category = "mild"|"spicy"|"savage";

const TRUTHS: Record<Category,string[]> = {
  mild:[
    "What's your most embarrassing moment this year?",
    "Have you ever lied to get out of plans?",
    "What's the most childish thing you still do?",
    "Who in this group would you swap lives with for a day?",
    "What's your biggest pet peeve?",
    "What's a bad habit you can't break?",
    "Have you ever eaten food that fell on the floor?",
    "What's your most unpopular opinion?",
    "When was the last time you cried and why?",
    "What's something you're embarrassed to admit you enjoy?",
    "What's the most recent lie you told?",
    "What's something you've never told your best friend?",
    "What's the last thing you searched on Google?",
    "Have you ever talked bad about someone and got caught?",
    "What's your most embarrassing childhood memory?",
  ],
  spicy:[
    "Who was your first celebrity crush?",
    "Have you ever had feelings for someone in this group?",
    "What's the most daring thing you've done for love?",
    "Have you ever slid into someone's DMs and got left on read?",
    "What's the worst date you've ever been on?",
    "Have you ever cheated on a test or exam?",
    "What's the most money you've wasted on something stupid?",
    "Have you ever broken up with someone via text?",
    "What's something you pretend to like to impress someone?",
    "Who is your secret crush right now?",
    "Have you ever stalked an ex on social media in the last month?",
    "What's the most embarrassing thing you've done for attention?",
    "Have you ever catfished someone online? Even a little bit?",
    "What's your biggest insecurity you never talk about?",
    "Have you ever told someone you loved them just to keep them?",
  ],
  savage:[
    "Who in your contact list would you delete and never miss?",
    "What's the pettiest reason you've ended a friendship?",
    "Rate everyone in this chat by attractiveness out of 10 — GO!",
    "What's something you've done that would disappoint your parents?",
    "Have you ever liked someone's photo from years ago to get their attention?",
    "What's the most savage thing you've said to someone and never apologized?",
    "Who was the last person you deep-stalked on Instagram?",
    "Have you ever pretended to be busy to avoid someone and got caught?",
    "What's the most questionable thing on your phone right now?",
    "If you could erase one thing you've done from history, what is it?",
    "Who do you talk to less than you should because they annoy you?",
    "What's the messiest drama you've been involved in?",
    "Be honest: how many people are you currently leading on?",
    "What's your most illegal thing you've ever done?",
    "What's something you've lied about consistently for years?",
  ]
};

const DARES: Record<Category,string[]> = {
  mild:[
    "Do your best dance move for 15 seconds 🕺",
    "Send a funny selfie in this group chat 🤳",
    "Call someone and sing Happy Birthday even if it's not their birthday 🎂",
    "Speak in an accent for the next 3 rounds 🗣️",
    "Do 10 jumping jacks right now 💪",
    "Show the last photo in your camera roll 📸",
    "Text your mum 'Are you proud of me?' right now 😂",
    "Change your X profile picture to something funny for 1 hour 😅",
    "Do your best cooking impression without speaking 🍳",
    "Eat a spoonful of the hottest condiment in reach 🌶️",
    "Walk around like a penguin for 1 full minute 🐧",
    "Try to lick your elbow for 30 seconds 😂",
    "Do your best robot dance for 20 seconds 🤖",
    "Speak in a whisper for the next 2 rounds 🤫",
    "Send a text to your last contact saying 'We need to talk' 👀",
  ],
  spicy:[
    "Send a voice note singing Burna Boy 'Ye' to this chat 🎤",
    "Post a throwback photo from 5+ years ago on your story 😭",
    "DM your ex 'thinking of you 🙂' and show us 📱",
    "Put three ice cubes in your shirt and keep them there 🧊",
    "Text your most recent ex just a 👀 and show the reaction 😂",
    "Change your X bio to 'I talk too much' for 24 hours 😭",
    "Call someone you like and say 'I've been thinking about you' 😳",
    "Post 'this person [tag someone] is my hero' on your story 😂",
    "Send your most embarrassing voice note to this chat 😅",
    "Reply to the last 5 people who messaged you with just '👀' 😭",
    "Take a photo making the ugliest face you can and post it 🤮",
    "Text your dad a compliment right now ❤️",
    "Do your best impression of a Nigerian politician giving speech 🎭",
    "Show us your most unread notification 😂",
    "Call a random number in your contacts and say 'I miss you' 📞",
  ],
  savage:[
    "Post 'I have something to confess 👀' as your X status for 2 hours and don't explain 😭",
    "Send a voice note in this chat confessing your most embarrassing secret 🔊",
    "Tag 5 people on your story with: 'Y'all need to be on C&C Hub ASAP 🚌'",
    "Call the person you have the most drama with right now 😬",
    "Post the most embarrassing photo from your phone as your story 📱",
    "Read out the most embarrassing text you've sent in the last 7 days 💀",
    "Write 'I am the main character' on your arm and show everyone 😂",
    "Do a full minute of continuous compliments about the person you argue with most 😭",
    "Post 'I've been lying about something. DM me.' on your X and leave it for 2 hours 👀",
    "Screenshot your screen time and show everyone in this chat 📊",
    "Dramatically re-enact your most embarrassing moment this year 🎭",
    "Show the group your most embarrassing text conversation 😅",
    "Post on your story: 'I have a confession — I'm joining C&C Hub 🚌' and tag @TheCruiseCH",
    "Send a heartfelt apology to someone you've wronged — in this chat 💙",
    "Show us your most liked post and most embarrassing post side by side 😂",
  ]
};

export default function TruthDarePage() {
  const [mode, setMode] = useState<"truth"|"dare">("truth");
  const [category, setCategory] = useState<Category>("mild");
  const [currentCard, setCurrentCard] = useState<string|null>(null);
  const [cardHistory, setCardHistory] = useState<{mode:string;text:string}[]>([]);
  const [flipping, setFlipping] = useState(false);
  const [players, setPlayers] = useState(["Player 1","Player 2"]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  const draw = useCallback(()=>{
    setFlipping(true);
    setTimeout(()=>{
      const pool = mode==="truth"?TRUTHS[category]:DARES[category];
      const card = pool[Math.floor(Math.random()*pool.length)];
      setCurrentCard(card);
      setCardHistory(h=>[{mode,text:card},...h].slice(0,10));
      setFlipping(false);
    },300);
  },[mode,category]);

  const nextPlayer = () => {
    setCurrentPlayer(p=>(p+1)%players.length);
    setCurrentCard(null);
  };

  const addPlayer = () => {
    if(newPlayerName.trim()&&players.length<8){
      setPlayers(p=>[...p,newPlayerName.trim()]);
      setNewPlayerName("");
      setAddingPlayer(false);
    }
  };

  const catColors: Record<Category,string> = {
    mild:"border-blue-500 bg-blue-500/10 text-blue-400",
    spicy:"border-orange-500 bg-orange-500/10 text-orange-400",
    savage:"border-red-600 bg-red-600/10 text-red-400",
  };

  const modeGradient = mode==="truth"
    ?"from-blue-600/20 to-purple-600/20 border-blue-500/30"
    :"from-red-600/20 to-orange-600/20 border-red-500/30";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="text-zinc-400 hover:text-white text-sm">← Games</Link>
          <h1 className="text-xl font-black text-white flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400"/>Truth or Dare</h1>
          <div className="w-16"/>
        </div>

        {/* Mode Select */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["truth","dare"] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setCurrentCard(null);}}
              className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${mode===m
                ?(m==="truth"?"bg-blue-500/20 border-blue-500 text-blue-400":"bg-red-500/20 border-red-500 text-red-400")
                :"border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
              {m==="truth"?"🧠 TRUTH":"🔥 DARE"}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(["mild","spicy","savage"] as const).map(c=>(
            <button key={c} onClick={()=>{setCategory(c);setCurrentCard(null);}}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap ${category===c?catColors[c]:"border-zinc-800 text-zinc-500"}`}>
              {c==="mild"?"😊 Mild":c==="spicy"?"🌶️ Spicy":"💀 Savage"}
            </button>
          ))}
        </div>

        {/* Players */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400"/>
              <span className="text-zinc-300 font-bold text-sm">Players ({players.length})</span>
            </div>
            {players.length<8&&(
              <button onClick={()=>setAddingPlayer(true)} className="text-yellow-400 text-xs font-bold hover:text-yellow-300">+ Add Player</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map((p,i)=>(
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${i===currentPlayer?"bg-yellow-400 text-black":"bg-zinc-800 text-zinc-300"}`}>
                {i===currentPlayer?"▶ ":""}{p}
              </span>
            ))}
          </div>
          {addingPlayer&&(
            <div className="mt-3 flex gap-2">
              <input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addPlayer()}
                placeholder="Player name..." autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"/>
              <button onClick={addPlayer} className="bg-yellow-400 text-black px-3 py-2 rounded-lg font-bold text-sm">Add</button>
              <button onClick={()=>setAddingPlayer(false)} className="text-zinc-500 px-2">✕</button>
            </div>
          )}
        </div>

        {/* Current Player */}
        <div className="text-center mb-4">
          <span className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-bold">
            🎯 {players[currentPlayer]}'s Turn
          </span>
        </div>

        {/* Card */}
        <div className={`bg-gradient-to-br ${modeGradient} border rounded-3xl p-8 mb-5 min-h-[200px] flex items-center justify-center transition-all duration-300 ${flipping?"opacity-0 scale-95":"opacity-100 scale-100"}`}>
          {currentCard?(
            <div className="text-center space-y-4">
              <div className="text-4xl">{mode==="truth"?"🧠":"🔥"}</div>
              <p className="text-white text-xl font-bold leading-relaxed">{currentCard}</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${catColors[category]}`}>
                {category.charAt(0).toUpperCase()+category.slice(1)} {mode.charAt(0).toUpperCase()+mode.slice(1)}
              </span>
            </div>
          ):(
            <div className="text-center space-y-3">
              <div className="text-5xl">{mode==="truth"?"🧠":"🔥"}</div>
              <p className="text-zinc-400">Tap the button below to get your {mode}!</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={draw}
            className={`py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${mode==="truth"?"bg-blue-600 hover:bg-blue-500 text-white":"bg-red-600 hover:bg-red-500 text-white"}`}>
            <RefreshCw className="w-4 h-4"/>{currentCard?"New Card":"Draw Card"}
          </button>
          <button onClick={nextPlayer} disabled={players.length<2}
            className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            Next Player →
          </button>
        </div>

        {/* History */}
        {cardHistory.length>0&&(
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wide mb-3">Recent Cards</h3>
            <div className="space-y-2">
              {cardHistory.slice(0,5).map((c,i)=>(
                <div key={i} className="flex items-start gap-2 p-2 bg-zinc-800 rounded-xl">
                  <span className="text-sm flex-shrink-0">{c.mode==="truth"?"🧠":"🔥"}</span>
                  <p className="text-zinc-400 text-xs leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Link href="/games" className="text-zinc-500 text-sm hover:text-zinc-300 flex items-center gap-1">
            <Home className="w-4 h-4"/> Back to Games
          </Link>
        </div>
      </main>
    </div>
  );
}
