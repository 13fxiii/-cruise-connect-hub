"use client";
import { useState, useRef, useCallback } from "react";
import { Share2, Copy, Check, Star, Trophy, Music, Gamepad2, Users, Download, Twitter, Instagram, Camera, Upload } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const LEVELS = [
  { min:0, name:"Newcomer", badge:"🌱", color:"text-zinc-400", bg:"bg-zinc-700" },
  { min:100, name:"Cruiser", badge:"🚌", color:"text-blue-400", bg:"bg-blue-500/20" },
  { min:500, name:"Connector", badge:"🔗", color:"text-green-400", bg:"bg-green-500/20" },
  { min:1000, name:"Hub Star", badge:"⭐", color:"text-yellow-400", bg:"bg-yellow-400/20" },
  { min:2500, name:"Culture King", badge:"👑", color:"text-orange-400", bg:"bg-orange-500/20" },
  { min:5000, name:"Community Legend", badge:"🏆", color:"text-yellow-300", bg:"bg-yellow-300/20" },
];

const BADGE_OPTIONS = [
  "🎵 Music Head","🎮 Gamer","🎤 Space Host","🏆 Winner",
  "🔥 Top Fan","💰 Earner","📢 Promoter","👑 OG Member",
  "🇳🇬 Naija Rep","🎬 Movie Buff","💬 Community Voice","🚀 Early Adopter",
];

const PLATFORMS = [
  { key:"x", name:"X (Twitter)", emoji:"𝕏", color:"bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-500", textColor:"text-white", desc:"Post your C&C Hub ID card" },
  { key:"instagram", name:"Instagram", emoji:"📸", color:"bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-transparent", textColor:"text-white", desc:"Share to your story" },
  { key:"whatsapp", name:"WhatsApp", emoji:"💬", color:"bg-green-600 hover:bg-green-500 border-transparent", textColor:"text-white", desc:"Send to your status" },
  { key:"telegram", name:"Telegram", emoji:"✈️", color:"bg-blue-500 hover:bg-blue-400 border-transparent", textColor:"text-white", desc:"Share in your groups" },
  { key:"tiktok", name:"TikTok", emoji:"🎵", color:"bg-zinc-900 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-500", textColor:"text-white", desc:"Post your flex" },
  { key:"facebook", name:"Facebook", emoji:"👥", color:"bg-blue-700 hover:bg-blue-600 border-transparent", textColor:"text-white", desc:"Share on your profile" },
];

function getLevel(pts:number){return[...LEVELS].reverse().find(l=>pts>=l.min)||LEVELS[0];}
function generateID(handle:string):string{
  const seed=handle.toLowerCase().split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return`CCH-${String(seed*13%90000+10000).padStart(5,"0")}`;
}

const SHARE_TEXTS: Record<string,(d:{id:string;name:string;handle:string;level:string;badge:string;points:number;joined:string;badges:string[]})=>string> = {
  x:d=>`Just copped my official C&C Hub Community ID 🚌✨\n\n🆔 ${d.id}\n👤 ${d.name} (${d.handle})\n${d.badge} ${d.level} · ${d.points.toLocaleString()} pts\n📅 Member since ${d.joined}\n\n${d.badges.slice(0,3).join(" · ")}\n\nJoin the wave 👉 @CCHub_\n#CruiseAndConnect #CCHub #NaijaCommunity`,
  instagram:d=>`My C&C Hub Member Card 🚌✨\n\n🆔 ${d.id}\n${d.badge} ${d.level}\n${d.points.toLocaleString()} community points\n\n${d.badges.join(" ")}\n\nJoin: @CCHub_\n.\n.\n#CruiseAndConnect #CCHub #NaijaCommunity #Lagos #Naija`,
  whatsapp:d=>`Hey! Check out my Cruise & Connect Hub Community ID 🚌\n\n🆔 ${d.id}\n👤 ${d.name}\n${d.badge} ${d.level}\n⭐ ${d.points.toLocaleString()} points\n\n${d.badges.join(" · ")}\n\nJoin the community 👉 search @CCHub_ on X`,
  telegram:d=>`🚌 My C&C Hub Community ID\n\n🆔 ${d.id}\n👤 ${d.name} (${d.handle})\n${d.badge} ${d.level} – ${d.points.toLocaleString()} pts\n\n${d.badges.join(" · ")}\n\nFind us: @CCHub_ on X`,
  tiktok:d=>`C&C Hub ID: ${d.id} 🚌 // ${d.badge} ${d.level} // ${d.points.toLocaleString()} pts // @CCHub_ // #CruiseAndConnect #CCHub #Naija`,
  facebook:d=>`Just joined the Cruise & Connect Hub community! 🚌\n\nMy member ID: ${d.id}\nLevel: ${d.badge} ${d.level}\nPoints: ${d.points.toLocaleString()}\n\n${d.badges.join(" · ")}\n\nFind us on X: @CCHub_`,
};

export default function CommunityIDPage() {
  const [handle, setHandle] = useState("@yourhandle");
  const [displayName, setDisplayName] = useState("Your Name");
  const [points, setPoints] = useState(1200);
  const [joinedMonth, setJoinedMonth] = useState("March 2025");
  const [selectedBadges, setSelectedBadges] = useState(["🎵 Music Head","🎮 Gamer","👑 OG Member"]);
  const [editMode, setEditMode] = useState(true);
  const [copied, setCopied] = useState<string|null>(null);
  const [shareTab, setShareTab] = useState<"card"|"platforms">("card");
  const [avatarUrl, setAvatarUrl] = useState<string|null>(null);
  const [bannerUrl, setBannerUrl] = useState<string|null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar"|"banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === "avatar") setAvatarUrl(ev.target?.result as string);
      else setBannerUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const memberId=generateID(handle);
  const level=getLevel(points);
  const nextLevel=LEVELS.find(l=>l.min>points);
  const progress=nextLevel?((points-level.min)/(nextLevel.min-level.min))*100:100;

  const toggleBadge=(badge:string)=>{
    setSelectedBadges(prev=>prev.includes(badge)?prev.filter(b=>b!==badge):prev.length<3?[...prev,badge]:prev);
  };

  const shareData={id:memberId,name:displayName,handle,level:level.name,badge:level.badge,points,joined:joinedMonth,badges:selectedBadges};

  const copyForPlatform=(platform:string)=>{
    const text=SHARE_TEXTS[platform]?.(shareData)||SHARE_TEXTS.x(shareData);
    navigator.clipboard?.writeText(text).catch(()=>{});
    setCopied(platform);
    setTimeout(()=>setCopied(null),2500);
  };

  const openPlatform=(platform:string)=>{
    const text=encodeURIComponent(SHARE_TEXTS[platform]?.(shareData)||"");
    const urls:Record<string,string>={
      x:`https://twitter.com/intent/tweet?text=${text}`,
      whatsapp:`https://wa.me/?text=${text}`,
      telegram:`https://t.me/share/url?url=https://cruise-connect-hub.netlify.app&text=${text}`,
      facebook:`https://www.facebook.com/sharer/sharer.php?u=https://cruise-connect-hub.netlify.app&quote=${text}`,
    };
    if(urls[platform]) window.open(urls[platform],"_blank");
    else copyForPlatform(platform);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/games" className="text-zinc-400 hover:text-white text-sm">← Games</Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Community ID Card 🚌</h1>
          <p className="text-zinc-400 mt-1">Generate your member card & flex it everywhere</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit mx-auto">
          {[["card","🪪 My Card"],["platforms","📤 Share On..."]].map(([v,l])=>(
            <button key={v} onClick={()=>setShareTab(v as any)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${shareTab===v?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>

        {shareTab==="card"&&(
          <div className="space-y-6">
            {/* ID CARD */}
            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-2 border-yellow-400/40 rounded-3xl overflow-hidden">

              {/* Banner image */}
              <div
                className="relative h-24 bg-gradient-to-r from-yellow-400/20 via-orange-500/10 to-yellow-400/5 cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
              >
                {!bannerUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-white text-xs font-bold">
                      <Camera className="w-3 h-3" /> Add Banner
                    </div>
                  </div>
                )}
                {bannerUrl && (
                  <button
                    onClick={e => { e.stopPropagation(); setBannerUrl(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >✕ Remove</button>
                )}
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageUpload(e, "banner")} />
              </div>

              <div className="p-6 -mt-10 relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"/>

                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <span className="text-black font-black text-xs">C&C</span>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-black text-sm">Cruise & Connect Hub</div>
                      <div className="text-zinc-500 text-[10px]">OFFICIAL MEMBER CARD</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-500 text-[10px]">MEMBER ID</div>
                    <div className="text-yellow-400 font-black text-sm tracking-widest">{memberId}</div>
                  </div>
                </div>

                {/* Avatar + Info */}
                <div className="flex items-center gap-5 mb-5">
                  {/* Avatar with upload */}
                  <div className="relative flex-shrink-0 group">
                    <div
                      className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer ring-2 ring-yellow-400/40"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <span className="text-3xl font-black text-black">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Upload overlay */}
                    <div
                      className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => handleImageUpload(e, "avatar")} />
                  </div>

                  <div className="flex-1">
                    <div className="text-white font-black text-xl">{displayName}</div>
                    <div className="text-yellow-400 font-bold text-sm">{handle}</div>
                    <div className="text-zinc-500 text-xs mt-1">Member since {joinedMonth}</div>
                  </div>
                </div>

              {/* Level & Points */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className={`${level.bg} rounded-xl p-3`}>
                  <div className="text-xs text-zinc-400 mb-1">LEVEL</div>
                  <div className={`font-black ${level.color} text-lg`}>{level.badge} {level.name}</div>
                </div>
                <div className="bg-yellow-400/10 rounded-xl p-3">
                  <div className="text-xs text-zinc-400 mb-1">POINTS</div>
                  <div className="font-black text-yellow-400 text-lg">⭐ {points.toLocaleString()}</div>
                </div>
              </div>

              {/* Progress bar */}
              {nextLevel&&(
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>{level.name}</span>
                    <span>{nextLevel.name} ({nextLevel.min.toLocaleString()} pts)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{width:`${progress}%`}}/>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedBadges.map(b=>(
                  <span key={b} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full font-bold">{b}</span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-600 text-xs">@CCHub_ on X</span>
                <span className="text-zinc-600 text-xs">cruise-connect-hub.vercel.app</span>
              </div>
            </div>
          </div>

            {/* Edit Mode */}
            <button onClick={()=>setEditMode(!editMode)} className="text-yellow-400 text-sm font-bold hover:text-yellow-300 transition-colors">
              {editMode?"▲ Hide Editor":"▼ Edit Card"}
            </button>

            {editMode&&(
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-bold">Customize Your Card</h3>

                {/* Image uploads */}
                <div className="flex gap-3">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-400/50 rounded-xl py-2.5 text-sm font-bold text-zinc-300 hover:text-white transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    {avatarUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-400/50 rounded-xl py-2.5 text-sm font-bold text-zinc-300 hover:text-white transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {bannerUrl ? "Change Banner" : "Upload Banner"}
                  </button>
                </div>
                {(avatarUrl || bannerUrl) && (
                  <div className="flex gap-2 flex-wrap">
                    {avatarUrl && (
                      <button onClick={() => setAvatarUrl(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        ✕ Remove photo
                      </button>
                    )}
                    {bannerUrl && (
                      <button onClick={() => setBannerUrl(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">
                        ✕ Remove banner
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 text-xs font-bold block mb-1">Display Name</label>
                    <input value={displayName} onChange={e=>setDisplayName(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"/>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-bold block mb-1">X Handle</label>
                    <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="@yourhandle"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"/>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-bold block mb-1">Points</label>
                    <input type="number" value={points} onChange={e=>setPoints(Number(e.target.value))} min={0} max={99999}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"/>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs font-bold block mb-1">Joined</label>
                    <input value={joinedMonth} onChange={e=>setJoinedMonth(e.target.value)} placeholder="Month Year"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"/>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs font-bold block mb-2">Badges (max 3) — {selectedBadges.length}/3</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map(b=>(
                      <button key={b} onClick={()=>toggleBadge(b)}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${selectedBadges.includes(b)?"bg-yellow-400/20 border-yellow-400 text-yellow-400":"border-zinc-700 text-zinc-500 hover:border-zinc-600"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Share */}
            <button onClick={()=>copyForPlatform("x")}
              className="w-full bg-yellow-400 text-black font-black py-4 rounded-2xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2">
              {copied==="x"?<><Check className="w-5 h-5"/>Copied!</>:<><Share2 className="w-5 h-5"/>Copy & Share</>}
            </button>
            <button onClick={()=>setShareTab("platforms")}
              className="w-full bg-zinc-900 border border-zinc-800 text-white font-bold py-3 rounded-2xl hover:bg-zinc-800 transition-all">
              Share on specific platform →
            </button>
          </div>
        )}

        {shareTab==="platforms"&&(
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm text-center">Choose where to share your Community ID card 🚌</p>

            {/* Platform Cards */}
            <div className="space-y-3">
              {PLATFORMS.map(p=>(
                <div key={p.key} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border text-xl font-black flex-shrink-0 ${p.color}`}>
                      {p.emoji}
                    </div>
                    <div className="flex-1">
                      <div className={`font-black ${p.textColor}`}>{p.name}</div>
                      <div className="text-zinc-500 text-xs">{p.desc}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>copyForPlatform(p.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${copied===p.key?"bg-green-500/20 border-green-500 text-green-400":"border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
                        {copied===p.key?<><Check className="w-3 h-3"/>Copied!</>:<><Copy className="w-3 h-3"/>Copy</>}
                      </button>
                      {["x","whatsapp","telegram","facebook"].includes(p.key)&&(
                        <button onClick={()=>openPlatform(p.key)}
                          className="px-3 py-2 bg-yellow-400 text-black rounded-xl text-xs font-black hover:bg-yellow-300 transition-all">
                          Open
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preview text */}
                  <div className="mt-3 bg-zinc-800 rounded-xl p-3">
                    <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line line-clamp-3">
                      {SHARE_TEXTS[p.key]?.(shareData)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* All-Platform Copy */}
            <div className="bg-zinc-900 border border-yellow-400/30 rounded-2xl p-5">
              <h3 className="text-yellow-400 font-black mb-3">📋 Universal Copy (works everywhere)</h3>
              <div className="bg-zinc-800 rounded-xl p-4 mb-3">
                <p className="text-zinc-300 text-sm whitespace-pre-line">
                  {`🚌 C&C Hub Member Card\n\n🆔 ${memberId}\n👤 ${displayName} (${handle})\n${level.badge} ${level.name} · ${points.toLocaleString()} pts\n📅 Since ${joinedMonth}\n\n${selectedBadges.join(" · ")}\n\n@CCHub_ on X | #CruiseAndConnect`}
                </p>
              </div>
              <button onClick={()=>{navigator.clipboard?.writeText(`🚌 C&C Hub Member Card\n\n🆔 ${memberId}\n👤 ${displayName} (${handle})\n${level.badge} ${level.name} · ${points.toLocaleString()} pts\n📅 Since ${joinedMonth}\n\n${selectedBadges.join(" · ")}\n\n@CCHub_ on X | #CruiseAndConnect`);setCopied("all");setTimeout(()=>setCopied(null),2500);}}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${copied==="all"?"bg-green-500/20 border border-green-500 text-green-400":"bg-yellow-400 text-black hover:bg-yellow-300"}`}>
                {copied==="all"?<><Check className="w-4 h-4"/>Copied to clipboard!</>:<><Copy className="w-4 h-4"/>Copy for Any Platform</>}
              </button>
            </div>

            <button onClick={()=>setShareTab("card")} className="w-full text-zinc-500 text-sm hover:text-zinc-300 py-2 transition-colors">
              ← Back to my card
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
