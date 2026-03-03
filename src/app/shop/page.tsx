"use client";
import { useState } from "react";
import { ShoppingBag, Store, Music, Tag, Star, ExternalLink, Plus, ChevronRight, Flame, Package } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const MERCH = [
  { id: "1", name: "BIG CRUISE Tee — Design A (Black)", price: 12000, category: "Tees", badge: "LIMITED", img: "🖤", sizes: ["S","M","L","XL","2XL"], seller: "C&C Hub Official" },
  { id: "2", name: "BIG CRUISE Tee — Design A (White)", price: 12000, category: "Tees", badge: "LIMITED", img: "🤍", sizes: ["S","M","L","XL"], seller: "C&C Hub Official" },
  { id: "3", name: "C&C Hub Bus Tee — Design B (Black)", price: 11000, category: "Tees", badge: null, img: "🚌", sizes: ["S","M","L","XL","2XL"], seller: "C&C Hub Official" },
  { id: "4", name: "BIG CRUISE Hoodie", price: 25000, category: "Hoodies", badge: "🔥 Hot", img: "🔥", sizes: ["S","M","L","XL"], seller: "C&C Hub Official" },
  { id: "5", name: "C&C Hub Cap", price: 8500, category: "Accessories", badge: null, img: "🧢", sizes: ["One Size"], seller: "C&C Hub Official" },
  { id: "6", name: "Community Sticker Pack (5pcs)", price: 2500, category: "Accessories", badge: null, img: "🏷️", sizes: ["One Size"], seller: "C&C Hub Official" },
];

const VENDORS = [
  { id: "1", name: "Naija Drip Store", category: "Fashion", desc: "Affordable Naija streetwear & accessories. DM to order.", handle: "@naijadripstore", verified: true, img: "👔" },
  { id: "2", name: "Lagos Bites Catering", category: "Food", desc: "Jollof, suya, small chops delivery in Lagos. Events & corporate.", handle: "@lagosbites", verified: false, img: "🍲" },
  { id: "3", name: "TechFix Lagos", category: "Tech", desc: "Phone repairs, laptop servicing, accessories. Island & Mainland.", handle: "@techfixlag", verified: true, img: "🔧" },
  { id: "4", name: "Glow Beauty Bar", category: "Beauty", desc: "Lashes, nails, makeup. Home service available in Lagos.", handle: "@glowbeautyng", verified: false, img: "💄" },
  { id: "5", name: "PrintHub Nigeria", category: "Printing", desc: "Custom merch printing — T-shirts, hoodies, banners. Bulk pricing.", handle: "@printhubng", verified: true, img: "🖨️" },
];

const ARTISTS = [
  { id: "1", name: "Lil Miss Thrill Seeker", handle: "@ThrillSeekaEnt", latest: "HARDINARY", genre: "Afrobeats", img: "🎵", link: "https://linktr.ee/ThrillSeekerEnt", streams: "12.4K" },
  { id: "2", name: "DJ ConnectPlug", handle: "@connectplug", latest: "Lagos Nights (Mix)", genre: "DJ/Mix", img: "🎧", link: "#", streams: "8.1K" },
  { id: "3", name: "Wavey Sosa", handle: "@waveysosa", latest: "No Wahala", genre: "Afropop", img: "🌊", link: "#", streams: "5.6K" },
];

const TABS = ["merch", "vendors", "artists"] as const;
const CATEGORIES = ["All", "Tees", "Hoodies", "Accessories"];

export default function ShopPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("merch");
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({});

  const filteredMerch = cat === "All" ? MERCH : MERCH.filter(m => m.category === cat);

  const addToCart = (id: string) => {
    setCart(prev => { const n = new Set(prev); n.add(id); return n; });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <ShoppingBag className="text-yellow-400 w-8 h-8" /> C&C Shop
            </h1>
            <p className="text-zinc-400 mt-1">Official merch · Community vendors · Artist releases</p>
          </div>
          <div className="relative">
            <button className="bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:border-yellow-400/40 transition-colors">
              <ShoppingBag className="w-4 h-4" /> Cart
              {cart.size > 0 && <span className="bg-yellow-400 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{cart.size}</span>}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"}`}>
              {t === "merch" ? "👕 Official Merch" : t === "vendors" ? "🏪 Vendor Hub" : "🎤 Artist Spotlight"}
            </button>
          ))}
        </div>

        {/* ── MERCH ── */}
        {tab === "merch" && (
          <>
            <div className="bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <div className="text-yellow-400 font-black text-sm mb-1">🔥 LIMITED DROP — BIG CRUISE Collection</div>
                <p className="text-zinc-300 text-sm">Official C&C Hub merch. Rep the brand, ride the culture.</p>
              </div>
              <Package className="text-yellow-400 w-10 h-10 flex-shrink-0 ml-4" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMerch.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl overflow-hidden transition-all">
                  <div className="h-44 bg-zinc-800 flex items-center justify-center text-6xl relative">
                    {item.img}
                    {item.badge && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1 leading-tight">{item.name}</h3>
                    <p className="text-xs text-zinc-500 mb-3">{item.seller}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.sizes.map(s => (
                        <button key={s} onClick={() => setSelectedSize(prev => ({ ...prev, [item.id]: s }))}
                          className={`text-xs px-2 py-1 rounded-md border transition-colors ${selectedSize[item.id] === s ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-black text-white">₦{item.price.toLocaleString()}</span>
                      <button onClick={() => addToCart(item.id)}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${cart.has(item.id) ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-400 text-black hover:bg-yellow-300"}`}>
                        {cart.has(item.id) ? "✓ Added" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <p className="text-zinc-400 text-sm mb-3">Want to order? DM us on X to confirm size & delivery</p>
              <a href="https://twitter.com/CCHub_" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors">
                Order via DM @CCHub_ <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        )}

        {/* ── VENDORS ── */}
        {tab === "vendors" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-zinc-400 text-sm">Verified community businesses. Support Naija vendors.</p>
              <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> List Your Business
              </button>
            </div>

            <div className="space-y-4">
              {VENDORS.map(v => (
                <div key={v.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 transition-all flex items-center gap-4">
                  <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {v.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">{v.name}</span>
                      {v.verified && <span className="text-yellow-400 text-xs">✓ Verified</span>}
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{v.category} · <span className="text-yellow-400">{v.handle}</span></p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{v.desc}</p>
                  </div>
                  <a href={`https://twitter.com/${v.handle.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 bg-zinc-800 text-zinc-300 font-bold px-4 py-2 rounded-full text-sm hover:bg-zinc-700 transition-colors flex items-center gap-1">
                    DM <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-xl p-5">
              <h3 className="font-black text-white mb-1">List Your Business Here</h3>
              <p className="text-sm text-zinc-400 mb-3">Get your brand in front of 15,000+ community members. Verified badge available.</p>
              <div className="flex gap-2 text-sm text-zinc-300">
                <span className="bg-zinc-800 px-3 py-1.5 rounded-full">Basic listing — FREE</span>
                <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-full">Featured listing — ₦20,000/week</span>
              </div>
            </div>
          </>
        )}

        {/* ── ARTISTS ── */}
        {tab === "artists" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-zinc-400 text-sm">Artists dropping new music. Support the sound. Stream & share.</p>
              <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Submit Your Track
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARTISTS.map(a => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 transition-all">
                  <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-4xl mb-4">
                    {a.img}
                  </div>
                  <h3 className="font-black text-white mb-0.5">{a.name}</h3>
                  <p className="text-xs text-yellow-400 mb-1">{a.handle}</p>
                  <p className="text-xs text-zinc-400 mb-3">{a.genre}</p>
                  <div className="bg-zinc-800 rounded-lg p-3 mb-3">
                    <div className="text-xs text-zinc-500 mb-0.5">Latest Release</div>
                    <div className="font-bold text-white text-sm">{a.latest}</div>
                    <div className="text-xs text-zinc-400">{a.streams} streams</div>
                  </div>
                  <a href={a.link} target="_blank" rel="noopener noreferrer"
                    className="w-full bg-yellow-400 text-black font-bold py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
                    🎵 Stream Now
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-black text-white mb-1">🎤 Are You an Artist?</h3>
              <p className="text-sm text-zinc-400 mb-3">Showcase your latest track to the C&C Hub community. Get streams, fans, and feedback.</p>
              <button className="bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors">
                Submit Your Music
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
