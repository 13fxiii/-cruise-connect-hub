"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { ShoppingBag, Plus, Search, Tag, Star, TrendingUp, ExternalLink } from "lucide-react";

const CATEGORIES = [
  { id:"all",         label:"All",          emoji:"🛒" },
  { id:"music",       label:"Music",        emoji:"🎵" },
  { id:"beats",       label:"Beats",        emoji:"🎹" },
  { id:"design",      label:"Design",       emoji:"🎨" },
  { id:"shoutout",    label:"Shoutout",     emoji:"📢" },
  { id:"service",     label:"Services",     emoji:"⚙️" },
  { id:"course",      label:"Courses",      emoji:"📚" },
  { id:"collab",      label:"Collab",       emoji:"🤝" },
  { id:"other",       label:"Other",        emoji:"✨" },
];

const DEMO_LISTINGS = [
  { id:"1", title:"Afrobeats Promo Pack — 5 Posts", description:"Premium social media promo for your music. 5 custom posts, captions, and hashtag sets.", category:"shoutout", price:50000, price_display:"₦500", cover:"🎵", purchase_count:24, profiles:{display_name:"MediaMaster", username:"mediamaster"} },
  { id:"2", title:"Custom Afrobeats Beat (Exclusive)", description:"Studio-quality Afrobeats beat, exclusive rights, all stems included. BPM: 95-105.", category:"beats", price:500000, price_display:"₦5,000", cover:"🎹", purchase_count:8, profiles:{display_name:"BeatsByFX", username:"beatsbyfx"} },
  { id:"3", title:"Logo Design (48hr turnaround)", description:"Professional logo design for your brand, music act, or business. 3 concepts + unlimited revisions.", category:"design", price:300000, price_display:"₦3,000", cover:"🎨", purchase_count:15, profiles:{display_name:"DesignKing", username:"designking"} },
  { id:"4", title:"X Growth Strategy (Naija Edition)", description:"Proven strategy document for growing your X following from 0 to 10K. Includes content calendar.", category:"course", price:200000, price_display:"₦2,000", cover:"📚", purchase_count:41, profiles:{display_name:"GrowthGuru", username:"growthguru"} },
  { id:"5", title:"Feature on CC Hub Community Feed", description:"Your music or business featured on the CC Hub community feed for 24 hours. 3K+ reach.", category:"shoutout", price:150000, price_display:"₦1,500", cover:"📢", purchase_count:33, profiles:{display_name:"CCHub Team", username:"cchub"} },
  { id:"6", title:"Collab: Verse for Your Song", description:"I'll record a verse for your track. Afrobeats/Pop/Amapiano. Professional mic + studio quality.", category:"collab", price:1000000, price_display:"₦10,000", cover:"🎤", purchase_count:6, profiles:{display_name:"VocalKing", username:"vocalking"} },
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [buying, setBuying]     = useState<string|null>(null);
  const [success, setSuccess]   = useState<string|null>(null);

  useEffect(() => {
    fetch(`/api/marketplace?category=${category}`)
      .then(r => r.json())
      .then(d => { if (d.listings?.length > 0) setListings(d.listings); });
  }, [category]);

  const filtered = listings.filter(l =>
    search ? l.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const purchase = async (listing: any) => {
    if (!user) return;
    setBuying(listing.id);
    const res = await fetch("/api/marketplace/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listing.id }),
    });
    const data = await res.json();
    setBuying(null);
    if (res.ok) setSuccess(`Successfully purchased "${listing.title}"! 🎉`);
    else alert(data.error || "Purchase failed");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-yellow-400" /> CC Hub Marketplace
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Buy & sell music, services, and digital goods</p>
          </div>
          {user && (
            <Link href="/marketplace/sell"
              className="bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-300 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Sell Something
            </Link>
          )}
        </div>

        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm font-bold">
            {success}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                category === c.id ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[["🛒","Active Listings","200+"],["💰","Total Sales","₦2.4M+"],["⭐","Verified Sellers","48"]].map(([icon,label,val]) => (
            <div key={label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-xl mb-0.5">{icon}</div>
              <div className="text-white font-black text-sm">{val}</div>
              <div className="text-zinc-600 text-[10px]">{label}</div>
            </div>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-400/30 transition-all group">
              {/* Cover */}
              <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-5xl group-hover:from-yellow-400/10 transition-all">
                {listing.cover || "📦"}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-black text-sm leading-tight line-clamp-2">{listing.title}</h3>
                  <div className="text-yellow-400 font-black text-sm flex-shrink-0">{listing.price_display}</div>
                </div>
                <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{listing.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    <span>@{listing.profiles?.username}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-600 text-xs">
                    <TrendingUp className="w-3 h-3" /> {listing.purchase_count} sold
                  </div>
                </div>
                {user ? (
                  <button onClick={() => purchase(listing)} disabled={buying === listing.id}
                    className="w-full bg-yellow-400 text-black font-black text-xs py-2 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
                    {buying === listing.id ? "Processing..." : `Buy for ${listing.price_display}`}
                  </button>
                ) : (
                  <Link href="/auth/login"
                    className="block w-full bg-zinc-800 text-zinc-300 font-bold text-xs py-2 rounded-xl text-center hover:bg-zinc-700">
                    Sign in to buy
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No listings found</p>
            {user && <Link href="/marketplace/sell" className="mt-3 inline-block text-yellow-400 text-sm font-bold hover:underline">Be the first to sell →</Link>}
          </div>
        )}
      </main>
    </div>
  );
}
