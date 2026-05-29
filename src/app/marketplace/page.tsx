// @ts-nocheck
'use client';
import AppHeader from '@/components/layout/AppHeader';
import { useState, useEffect } from 'react';
import { ShoppingBag, Store, Music, Plus, ExternalLink, Loader2, 
         CheckCircle, Heart, Send, Mic2, Shirt, Users, Star } from 'lucide-react';

import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

/* ── Types ─────────────────────────────────────────────────── */
type Tab = 'digital' | 'merch' | 'vendors' | 'artists';

const DIGITAL_CATS = ['all','beats','design','shoutout','collab','course','service','other'];
const MERCH_ITEMS = [
  { id:'m1', name:'BIG CRUISE Tee — Black', category:'Tees', price:12000, badge:'LIMITED', emoji:'🖤', sizes:['S','M','L','XL','2XL'] },
  { id:'m2', name:'BIG CRUISE Tee — White', category:'Tees', price:12000, badge:'LIMITED', emoji:'🤍', sizes:['S','M','L','XL'] },
  { id:'m3', name:'C&C Hub Bus Tee', category:'Tees', price:11000, emoji:'🚌', sizes:['S','M','L','XL','2XL'] },
  { id:'m4', name:'BIG CRUISE Hoodie', category:'Hoodies', price:25000, badge:'🔥 Hot', emoji:'🔥', sizes:['S','M','L','XL'] },
  { id:'m5', name:'C&C Hub Cap', category:'Accessories', price:8500, emoji:'🧢', sizes:['One Size'] },
  { id:'m6', name:'Sticker Pack (5pcs)', category:'Accessories', price:2500, emoji:'🏷️', sizes:['One Size'] },
];
const VENDORS = [
  { id:'v1', name:'Naija Drip Store', cat:'Fashion', desc:'Affordable Naija streetwear & accessories.', handle:'@naijadripstore', verified:true, emoji:'👔' },
  { id:'v2', name:'Lagos Bites Catering', cat:'Food', desc:'Jollof, suya, small chops. Events & corporate.', handle:'@lagosbites', verified:false, emoji:'🍲' },
  { id:'v3', name:'TechFix Lagos', cat:'Tech', desc:'Phone repairs, laptop servicing, accessories.', handle:'@techfixlag', verified:true, emoji:'🔧' },
  { id:'v4', name:'Glow Beauty Bar', cat:'Beauty', desc:'Lashes, nails, makeup. Home service in Lagos.', handle:'@glowbeautyng', verified:false, emoji:'💄' },
  { id:'v5', name:'PrintHub Nigeria', cat:'Printing', desc:'Custom merch printing. Bulk pricing.', handle:'@printhubng', verified:true, emoji:'🖨️' },
];

function fmt(kobo: number) { return '₦' + (kobo/100).toLocaleString('en-NG'); }

/* ── Main component ─────────────────────────────────────────── */
export default function MarketplacePage() {
  const { user }          = useAuth();
  const [tab, setTab]     = useState<Tab>('digital');
  const [listings, set]   = useState<any[]>([]);
  const [artists, setArt] = useState<any[]>([]);
  const [cat, setCat]     = useState('all');
  const [loading, setLd]  = useState(false);
  const [selSizes, setSS] = useState<Record<string,string>>({});
  const [cart, setCart]   = useState<any[]>([]);
  const [showCart, setSC] = useState(false);
  const [buyId, setBuy]   = useState<string|null>(null);
  const [buying, setByg]  = useState(false);
  const [bought, setBgt]  = useState(false);
  const supabase = createClient();

  /* digital listings */
  useEffect(() => {
    if (tab !== 'digital') return;
    setLd(true);
    fetch(`/api/marketplace?category=${cat}`)
      .then(r => r.json())
      .then(d => { set(d.listings || []); setLd(false); });
  }, [cat, tab]);

  /* artists */
  useEffect(() => {
    if (tab !== 'artists') return;
    setLd(true);
    fetch('/api/artists')
      .then(r => r.json())
      .then(d => { setArt(d.tracks || d.artists || []); setLd(false); });
  }, [tab]);

  const buyDigital = async (id: string) => {
    if (!user) { window.location.href = '/auth/login'; return; }
    setByg(true);
    const res = await fetch('/api/marketplace/purchase', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ listing_id: id }),
    });
    const d = await res.json();
    if (res.ok) { setBgt(true); setTimeout(() => { setBgt(false); setBuy(null); }, 2000); }
    else alert(d.error || 'Purchase failed');
    setByg(false);
  };

  const addMerch = (item: any) => {
    const size = selSizes[item.id] || item.sizes[0];
    const exists = cart.find(c => c.id === item.id && c.size === size);
    if (exists) setCart(c => c.map(x => x.id === item.id && x.size === size ? { ...x, qty: x.qty+1 } : x));
    else setCart(c => [...c, { ...item, size, qty: 1 }]);
    setSC(true);
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id:'digital', label:'Digital', icon:Store },
    { id:'merch',   label:'Merch',   icon:Shirt },
    { id:'vendors', label:'Vendors', icon:Users },
    { id:'artists', label:'Artists', icon:Music },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Cruise Connect Store" showSearch />
      
      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="text-yellow-400" /> Cruise Connect Store〽️
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">Merch · PR/Ads · Vendors · Artists · Shop</p>
          </div>
          {tab === 'digital' && (
            <Link href="/marketplace/sell"
              className="flex items-center gap-1.5 bg-yellow-400 text-black font-black text-xs px-3 py-2 rounded-xl hover:bg-yellow-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Sell
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── DIGITAL TAB ── */}
        {tab === 'digital' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {DIGITAL_CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${cat===c ? 'bg-yellow-400 text-black' : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'}`}>
                  {c === 'all' ? 'All' : c.charAt(0).toUpperCase()+c.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🛒</p>
                <p className="text-zinc-400 mb-4">No listings yet — be the first to sell!</p>
                <Link href="/marketplace/sell" className="bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl hover:bg-yellow-300 text-sm inline-block">List a Service</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((l: any) => (
                  <div key={l.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {l.cover_url || '📦'}
                      </div>
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full capitalize">{l.category}</span>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{l.title}</h3>
                    <p className="text-zinc-500 text-xs mb-3 line-clamp-2">{l.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-yellow-400 font-black">{l.price_display || fmt(l.price)}</div>
                        <div className="text-zinc-600 text-xs">{l.purchase_count || 0} sold</div>
                      </div>
                      <button onClick={() => setBuy(l.id)}
                        className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-yellow-400/20 transition-colors">
                        Buy
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800 text-zinc-600 text-xs">
                      by {l.profiles?.display_name || l.profiles?.username || 'Seller'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MERCH TAB ── */}
        {tab === 'merch' && (
          <>
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Official CC Hub Merch</p>
                <p className="text-zinc-400 text-xs">Rep the brand, ride the culture</p>
              </div>
              {cart.length > 0 && (
                <button onClick={() => setSC(true)} className="bg-yellow-400 text-black font-black text-xs px-3 py-1.5 rounded-xl">
                  🛒 {cart.reduce((a,i) => a+i.qty,0)}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MERCH_ITEMS.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="text-4xl mb-3 text-center">{item.emoji}</div>
                  {item.badge && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">{item.badge}</span>
                  )}
                  <p className="text-white font-bold text-sm mt-2 mb-1">{item.name}</p>
                  <p className="text-yellow-400 font-black mb-3">₦{item.price.toLocaleString()}</p>
                  <select value={selSizes[item.id] || item.sizes[0]}
                    onChange={e => setSS(p => ({...p, [item.id]: e.target.value}))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg p-2 mb-2 outline-none">
                    {item.sizes.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => addMerch(item)}
                    className="w-full bg-yellow-400 text-black font-black text-xs py-2 rounded-xl hover:bg-yellow-300 transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── VENDORS TAB ── */}
        {tab === 'vendors' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm">Community businesses & services</p>
              <Link href="/shop/vendor-apply" className="text-yellow-400 text-xs hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> List yours
              </Link>
            </div>
            <div className="space-y-3">
              {VENDORS.map(v => (
                <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{v.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-sm">{v.name}</span>
                      {v.verified && <span className="text-yellow-400 text-xs">✓</span>}
                    </div>
                    <p className="text-zinc-400 text-xs truncate">{v.desc}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{v.handle} · {v.cat}</p>
                  </div>
                  <button className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-xl hover:border-zinc-500 transition-colors flex-shrink-0">
                    DM
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ARTISTS TAB ── */}
        {tab === 'artists' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm">Featured community artists</p>
              <Link href="/music/submit" className="text-yellow-400 text-xs hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Submit music
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-yellow-400 animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {/* Featured: ThrillSeekaEnt */}
                <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/5 border border-yellow-400/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center text-2xl">🎵</div>
                    <div>
                      <p className="text-white font-black">Lil Miss Thrill Seeker</p>
                      <p className="text-zinc-400 text-xs">@ThrillSeekaEnt · Afrobeats</p>
                    </div>
                    <span className="ml-auto text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">FEATURED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {['HARDINARY','JUMP ROPE','SPEAKEASY'].map(t => (
                      <div key={t} className="bg-zinc-900/50 rounded-xl p-2 text-center">
                        <p className="text-white text-xs font-bold truncate">{t}</p>
                      </div>
                    ))}
                  </div>
                  <a href="https://linktr.ee/ThrillSeekerEnt" target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-xs py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Listen / Follow
                  </a>
                </div>

                {/* DB artists */}
                {artists.map((a: any) => (
                  <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {a.cover_url ? <img src={a.cover_url} className="w-full h-full rounded-xl object-cover" alt="" /> : '🎤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{a.title || a.artist_name}</p>
                      <p className="text-zinc-500 text-xs">{a.artist || a.genre}</p>
                    </div>
                    {a.external_link && (
                      <a href={a.external_link} target="_blank" rel="noreferrer"
                        className="text-yellow-400 hover:text-yellow-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}

                {artists.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    No artists yet — <Link href="/music/submit" className="text-yellow-400 hover:underline">submit your music</Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Cart drawer ── */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-zinc-900 border-t border-zinc-700 rounded-t-3xl w-full max-w-lg mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">Cart ({cart.reduce((a,i)=>a+i.qty,0)})</h3>
              <button onClick={() => setSC(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="text-zinc-500 text-center py-4 text-sm">Cart is empty</p>
            ) : (
              <>
                {cart.map((item,i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800">
                    <div>
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-zinc-500 text-xs">{item.size} × {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-bold text-sm">₦{(item.price*item.qty).toLocaleString()}</span>
                      <button onClick={() => setCart(c => c.filter((_,j)=>j!==i))} className="text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-3 flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Total</span>
                  <span className="text-white font-black">₦{cart.reduce((a,i)=>a+(i.price*i.qty),0).toLocaleString()}</span>
                </div>
                <button className="w-full mt-4 bg-yellow-400 text-black font-black py-3.5 rounded-xl hover:bg-yellow-300 transition-colors">
                  Order via WhatsApp
                </button>
                <p className="text-center text-zinc-600 text-xs mt-2">DM @TheCruiseCH on X to complete your order</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Buy modal ── */}
      {buyId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6">
            {bought ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-white font-black text-lg">Purchase Complete!</p>
                <p className="text-zinc-400 text-sm mt-1">Check your wallet & notifications</p>
              </div>
            ) : (
              <>
                <h3 className="text-white font-black text-lg mb-2">Confirm Purchase</h3>
                <p className="text-zinc-400 text-sm mb-5">Payment will be deducted from your wallet balance.</p>
                <div className="flex gap-3">
                  <button onClick={() => setBuy(null)} className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button onClick={() => buyDigital(buyId)} disabled={buying}
                    className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-black hover:bg-yellow-300 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Buy'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
