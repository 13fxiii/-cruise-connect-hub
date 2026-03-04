"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, Package, X, Loader2, CheckCircle, ExternalLink, Plus, Store, Music } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

type Item = { id: string; name: string; category: string; price: number; sizes: string[]; is_limited: boolean; badge?: string; seller: string; };
type CartItem = Item & { selectedSize: string; quantity: number; };

const MOCK_ITEMS: Item[] = [
  { id:"1", name:"BIG CRUISE Tee — Design A (Black)", category:"Tees", price:12000, sizes:["S","M","L","XL","2XL"], is_limited:true, badge:"LIMITED", seller:"C&C Hub Official" },
  { id:"2", name:"BIG CRUISE Tee — Design A (White)", category:"Tees", price:12000, sizes:["S","M","L","XL"], is_limited:true, badge:"LIMITED", seller:"C&C Hub Official" },
  { id:"3", name:"C&C Hub Bus Tee — Design B (Black)", category:"Tees", price:11000, sizes:["S","M","L","XL","2XL"], is_limited:false, seller:"C&C Hub Official" },
  { id:"4", name:"BIG CRUISE Hoodie", category:"Hoodies", price:25000, sizes:["S","M","L","XL"], is_limited:false, badge:"🔥 Hot", seller:"C&C Hub Official" },
  { id:"5", name:"C&C Hub Cap", category:"Accessories", price:8500, sizes:["One Size"], is_limited:false, seller:"C&C Hub Official" },
  { id:"6", name:"Community Sticker Pack (5pcs)", category:"Accessories", price:2500, sizes:["One Size"], is_limited:false, seller:"C&C Hub Official" },
];

const EMOJIS: Record<string, string> = { "1":"🖤","2":"🤍","3":"🚌","4":"🔥","5":"🧢","6":"🏷️" };

const VENDORS = [
  { id:"1", name:"Naija Drip Store", category:"Fashion", desc:"Affordable Naija streetwear & accessories.", handle:"@naijadripstore", verified:true, emoji:"👔" },
  { id:"2", name:"Lagos Bites Catering", category:"Food", desc:"Jollof, suya, small chops. Events & corporate.", handle:"@lagosbites", verified:false, emoji:"🍲" },
  { id:"3", name:"TechFix Lagos", category:"Tech", desc:"Phone repairs, laptop servicing, accessories.", handle:"@techfixlag", verified:true, emoji:"🔧" },
  { id:"4", name:"Glow Beauty Bar", category:"Beauty", desc:"Lashes, nails, makeup. Home service in Lagos.", handle:"@glowbeautyng", verified:false, emoji:"💄" },
  { id:"5", name:"PrintHub Nigeria", category:"Printing", desc:"Custom merch printing. Bulk pricing.", handle:"@printhubng", verified:true, emoji:"🖨️" },
];

const ARTISTS = [
  { id:"1", name:"Lil Miss Thrill Seeker", handle:"@ThrillSeekaEnt", latest:"HARDINARY", genre:"Afrobeats", emoji:"🎵", link:"https://linktr.ee/ThrillSeekerEnt", streams:"12.4K" },
  { id:"2", name:"DJ ConnectPlug", handle:"@connectplug", latest:"Lagos Nights (Mix)", genre:"DJ/Mix", emoji:"🎧", link:"#", streams:"8.1K" },
  { id:"3", name:"Wavey Sosa", handle:"@waveysosa", latest:"No Wahala", genre:"Afropop", emoji:"🌊", link:"#", streams:"5.6K" },
];

const CATEGORIES = ["All","Tees","Hoodies","Accessories"];
const TABS = ["merch","vendors","artists"] as const;

export default function ShopPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("merch");
  const [cat, setCat] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<string,string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<CartItem|null>(null);
  const [orderForm, setOrderForm] = useState({ address:"", phone:"" });
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const filteredItems = cat==="All" ? MOCK_ITEMS : MOCK_ITEMS.filter(i=>i.category===cat);

  const addToCart = (item: Item) => {
    const size = selectedSizes[item.id] || item.sizes[0];
    const exists = cart.find(c=>c.id===item.id&&c.selectedSize===size);
    if (exists) {
      setCart(prev=>prev.map(c=>c.id===item.id&&c.selectedSize===size?{...c,quantity:c.quantity+1}:c));
    } else {
      setCart(prev=>[...prev,{...item,selectedSize:size,quantity:1}]);
    }
    setShowCart(true);
  };

  const removeFromCart = (id: string, size: string) => setCart(prev=>prev.filter(c=>!(c.id===id&&c.selectedSize===size)));

  const cartTotal = cart.reduce((sum,c)=>sum+c.price*c.quantity,0);
  const cartCount = cart.reduce((sum,c)=>sum+c.quantity,0);

  const startCheckout = (item: CartItem) => { setCheckoutItem(item); };

  const placeOrder = async () => {
    if (!checkoutItem||!orderForm.phone) return;
    setOrdering(true);
    try {
      await fetch("/api/shop",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        item_id:checkoutItem.id, item_name:checkoutItem.name,
        size:checkoutItem.selectedSize, quantity:checkoutItem.quantity,
        amount:checkoutItem.price*checkoutItem.quantity,
        delivery_address:orderForm.address, contact_phone:orderForm.phone,
      })});
      setOrderSuccess(true);
      setCart([]);
    } catch {}
    setOrdering(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3"><ShoppingBag className="text-yellow-400 w-8 h-8"/>C&C Shop</h1>
            <p className="text-zinc-400 mt-1">Official merch · Community vendors · Artist releases</p>
          </div>
          <button onClick={()=>setShowCart(!showCart)} className="relative bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:border-yellow-400/40">
            <ShoppingBag className="w-4 h-4"/> Cart
            {cartCount>0&&<span className="bg-yellow-400 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>

        {/* Cart Drawer */}
        {showCart&&cart.length>0&&(
          <div className="bg-zinc-900 border border-yellow-400/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-yellow-400"/>Your Cart ({cartCount})</h3>
              <button onClick={()=>setShowCart(false)}><X className="w-4 h-4 text-zinc-400"/></button>
            </div>
            <div className="space-y-3 mb-4">
              {cart.map(c=>(
                <div key={`${c.id}-${c.selectedSize}`} className="flex items-center justify-between gap-3 bg-zinc-800 rounded-xl p-3">
                  <div className="text-2xl">{EMOJIS[c.id]||"📦"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{c.name}</div>
                    <div className="text-xs text-zinc-400">Size: {c.selectedSize} · Qty: {c.quantity}</div>
                  </div>
                  <div className="text-sm font-black text-yellow-400">₦{(c.price*c.quantity).toLocaleString()}</div>
                  <button onClick={()=>removeFromCart(c.id,c.selectedSize)} className="text-zinc-500 hover:text-red-400"><X className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-zinc-700 pt-3 mb-3">
              <span className="font-black text-white">Total: ₦{cartTotal.toLocaleString()}</span>
              <span className="text-xs text-zinc-400">+ delivery</span>
            </div>
            {orderSuccess?(
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2"/>
                <p className="font-black text-white">Order received! 🎉</p>
                <p className="text-xs text-zinc-400 mt-1">DM <span className="text-yellow-400">@CCHub_</span> with your payment receipt to confirm</p>
              </div>
            ):checkoutItem?(
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">Delivery Details</h4>
                <input value={orderForm.address} onChange={e=>setOrderForm(p=>({...p,address:e.target.value}))} placeholder="Delivery address" className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-500"/>
                <input value={orderForm.phone} onChange={e=>setOrderForm(p=>({...p,phone:e.target.value}))} placeholder="Phone number *" className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-500 placeholder:text-zinc-500"/>
                <button onClick={placeOrder} disabled={ordering||!orderForm.phone} className="w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300 disabled:opacity-50 flex items-center justify-center gap-2">
                  {ordering?<><Loader2 className="w-4 h-4 animate-spin"/>Placing...</>:"✅ Confirm Order"}
                </button>
                <p className="text-xs text-zinc-500 text-center">Pay via transfer after DM confirmation. Paystack coming soon.</p>
              </div>
            ):(
              <button onClick={()=>setCheckoutItem(cart[0])} className="w-full bg-yellow-400 text-black font-black py-3 rounded-full hover:bg-yellow-300">
                Checkout →
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab===t?"bg-yellow-400 text-black":"text-zinc-400 hover:text-white"}`}>
              {t==="merch"?"👕 Merch":t==="vendors"?"🏪 Vendors":"🎤 Artists"}
            </button>
          ))}
        </div>

        {/* MERCH */}
        {tab==="merch"&&(
          <>
            <div className="bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-2xl p-5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-yellow-400 font-black text-sm mb-1">🔥 LIMITED DROP — BIG CRUISE Collection</div>
                <p className="text-zinc-300 text-sm">Official C&C Hub merch. Rep the brand, ride the culture.</p>
              </div>
              <Package className="text-yellow-400 w-10 h-10 flex-shrink-0 ml-4"/>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setCat(c)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat===c?"bg-yellow-400 text-black":"bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-yellow-400/40"}`}>{c}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item=>(
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl overflow-hidden transition-all">
                  <div className="h-44 bg-zinc-800 flex items-center justify-center text-6xl relative">
                    {EMOJIS[item.id]||"📦"}
                    {item.badge&&<span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1 leading-tight">{item.name}</h3>
                    <p className="text-xs text-zinc-500 mb-3">{item.seller}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.sizes.map(s=>(
                        <button key={s} onClick={()=>setSelectedSizes(p=>({...p,[item.id]:s}))} className={`text-xs px-2 py-1 rounded-md border transition-colors ${selectedSizes[item.id]===s||(!selectedSizes[item.id]&&item.sizes[0]===s)?"border-yellow-400 bg-yellow-400/10 text-yellow-400":"border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>{s}</button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white">₦{item.price.toLocaleString()}</span>
                      <button onClick={()=>addToCart(item)} className="text-xs font-bold px-4 py-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <p className="text-zinc-400 text-sm mb-3">Confirm order via DM · Pay after confirmation</p>
              <a href="https://twitter.com/CCHub_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300">
                DM to Order @CCHub_ <ExternalLink className="w-4 h-4"/>
              </a>
            </div>
          </>
        )}

        {/* VENDORS */}
        {tab==="vendors"&&(
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-zinc-400 text-sm">Verified community businesses.</p>
              <a href="/shop/vendor-apply" className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 flex items-center gap-2"><Plus className="w-4 h-4"/>List Your Business</a>
            </div>
            <div className="space-y-4">
              {VENDORS.map(v=>(
                <div key={v.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 flex items-center gap-4 transition-all">
                  <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center text-3xl">{v.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">{v.name}</span>
                      {v.verified&&<span className="text-yellow-400 text-xs">✓ Verified</span>}
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{v.category} · <span className="text-yellow-400">{v.handle}</span></p>
                    <p className="text-xs text-zinc-300">{v.desc}</p>
                  </div>
                  <a href={`https://twitter.com/${v.handle.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-zinc-800 text-zinc-300 font-bold px-4 py-2 rounded-full text-sm hover:bg-zinc-700 flex items-center gap-1">
                    DM<ExternalLink className="w-3 h-3"/>
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-xl p-5">
              <h3 className="font-black text-white mb-1">List Your Business</h3>
              <p className="text-sm text-zinc-400 mb-3">Get your brand in front of 15,000+ members.</p>
              <div className="flex gap-2 flex-wrap text-sm">
                <span className="bg-zinc-800 px-3 py-1.5 rounded-full text-zinc-300">Basic listing — FREE</span>
                <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-full">Featured — ₦20,000/week</span>
              </div>
            </div>
          </>
        )}

        {/* ARTISTS */}
        {tab==="artists"&&(
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-zinc-400 text-sm">Artists dropping new music. Stream & share.</p>
              <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 flex items-center gap-2"><Plus className="w-4 h-4"/>Submit Track</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARTISTS.map(a=>(
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400/30 rounded-xl p-5 transition-all">
                  <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-4xl mb-4">{a.emoji}</div>
                  <h3 className="font-black text-white mb-0.5">{a.name}</h3>
                  <p className="text-xs text-yellow-400 mb-1">{a.handle}</p>
                  <p className="text-xs text-zinc-400 mb-3">{a.genre}</p>
                  <div className="bg-zinc-800 rounded-lg p-3 mb-3">
                    <div className="text-xs text-zinc-500 mb-0.5">Latest Release</div>
                    <div className="font-bold text-white text-sm">{a.latest}</div>
                    <div className="text-xs text-zinc-400">{a.streams} streams</div>
                  </div>
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className="w-full bg-yellow-400 text-black font-bold py-2.5 rounded-full text-sm hover:bg-yellow-300 flex items-center justify-center gap-2">
                    🎵 Stream Now
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="font-black text-white mb-1">🎤 Are You an Artist?</h3>
              <p className="text-sm text-zinc-400 mb-3">Showcase your music to the C&C Hub community.</p>
              <button className="bg-yellow-400 text-black font-black px-6 py-3 rounded-full hover:bg-yellow-300">Submit Your Music</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
