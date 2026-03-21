"use client";
import { useState, useRef, useEffect, useCallback } from "react";

import {
  Shirt, Palette, Type, Download, ShoppingCart, Wand2,
  ChevronLeft, ChevronRight, Loader2, CheckCircle, RotateCcw,
  ZoomIn, ZoomOut, AlignCenter, Bold, Star, Package, ArrowRight,
  Minus, Plus, X, Upload, Sparkles
} from "lucide-react";

/* ─── Product catalogue ─────────────────────────────────────── */
const PRODUCTS = [
  { id:"tshirt",  label:"T-Shirt",      emoji:"👕", base_price:12000, custom_price:18000, sizes:["S","M","L","XL","2XL"], mockup_color:"bg-zinc-800" },
  { id:"hoodie",  label:"Hoodie",       emoji:"🧥", base_price:25000, custom_price:32000, sizes:["S","M","L","XL","2XL"], mockup_color:"bg-zinc-700" },
  { id:"cap",     label:"Cap",          emoji:"🧢", base_price:8500,  custom_price:13000, sizes:["One Size"],              mockup_color:"bg-zinc-800" },
  { id:"tote",    label:"Tote Bag",     emoji:"👜", base_price:6000,  custom_price:10000, sizes:["One Size"],              mockup_color:"bg-amber-900/60" },
  { id:"mug",     label:"Mug",          emoji:"☕", base_price:5000,  custom_price:8500,  sizes:["Standard"],              mockup_color:"bg-zinc-700" },
  { id:"sticker", label:"Sticker Pack", emoji:"🏷️", base_price:2500,  custom_price:4000,  sizes:["Standard"],              mockup_color:"bg-white/10" },
];

const GARMENT_COLORS = [
  { id:"black",  label:"Black",    hex:"#18181b" },
  { id:"white",  label:"White",    hex:"#fafafa" },
  { id:"yellow", label:"Gold",     hex:"#eab308" },
  { id:"navy",   label:"Navy",     hex:"#1e3a5f" },
  { id:"red",    label:"Red",      hex:"#dc2626" },
  { id:"green",  label:"Forest",   hex:"#14532d" },
];

const TEXT_FONTS = ["Impact","Arial Black","Georgia","Courier New","Verdana"];
const LOGO_TEXTS = [
  "CRUISE CONNECT HUB〽️",
  "CC HUB〽️",
  "CRUISE〽️",
  "@TheCruiseCH",
  "COMMUNITY FIRST 🚌",
];

export default function MerchPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Product state
  const [product, setProduct]   = useState(PRODUCTS[0]);
  const [garmentColor, setGarmentColor] = useState(GARMENT_COLORS[0]);
  const [size, setSize]         = useState("M");
  const [tab, setTab]           = useState<"design"|"order">("design");
  const [mode, setMode]         = useState<"diy"|"custom">("diy"); // diy = they design, custom = FX designs for them

  // Design state
  const [customText, setCustomText] = useState("CRUISE CONNECT HUB〽️");
  const [textColor, setTextColor]   = useState("#eab308");
  const [fontSize, setFontSize]     = useState(26);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [showLogo, setShowLogo]     = useState(true);
  const [logoScale, setLogoScale]   = useState(0.45);
  const [logoY, setLogoY]           = useState(0.28); // 0-1 fraction of height
  const [textY, setTextY]           = useState(0.72);
  const [generating, setGenerating] = useState(false);
  const [orderStep, setOrderStep]   = useState<"idle"|"form"|"done">("idle");
  const [qty, setQty]               = useState(1);

  // Order form
  const [orderForm, setOrderForm] = useState({
    name:"", address:"", phone:"", note:""
  });

  /* ── Load CC Hub logo ────────────────────────────── */
  useEffect(() => {
    const img = new Image();
    img.src = "/logo.jpeg";
    img.onload = () => { logoImgRef.current = img; renderCanvas(); };
    img.onerror = () => renderCanvas();
  }, []);

  /* ── Re-render whenever design changes ──────────── */
  useEffect(() => { renderCanvas(); },
    [garmentColor, customText, textColor, fontSize, fontFamily, showLogo, logoScale, logoY, textY, product]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width  = 400;
    const H = canvas.height = 460;

    ctx.clearRect(0, 0, W, H);

    // Background (garment shape)
    ctx.fillStyle = garmentColor.hex;

    if (product.id === "mug") {
      // Mug shape
      ctx.beginPath();
      ctx.roundRect(60, 60, 280, 220, 12);
      ctx.fill();
      // Handle
      ctx.beginPath();
      ctx.arc(340, 170, 45, -0.8, 0.8);
      ctx.strokeStyle = garmentColor.hex;
      ctx.lineWidth = 28;
      ctx.stroke();
    } else if (product.id === "cap") {
      // Cap brim
      ctx.beginPath();
      ctx.ellipse(200, 310, 160, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cap dome
      ctx.beginPath();
      ctx.arc(200, 220, 130, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
    } else if (product.id === "tote") {
      // Tote bag body
      ctx.beginPath();
      ctx.roundRect(80, 100, 240, 300, 8);
      ctx.fill();
      // Handles
      ctx.strokeStyle = garmentColor.hex === "#fafafa" ? "#d4d4d8" : garmentColor.hex;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(130, 100); ctx.quadraticCurveTo(130, 40, 170, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(270, 100); ctx.quadraticCurveTo(270, 40, 230, 40); ctx.stroke();
    } else if (product.id === "sticker") {
      // Sticker rounded square
      ctx.beginPath();
      ctx.roundRect(60, 60, 280, 280, 40);
      ctx.fill();
      // Border
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      ctx.setLineDash([8,5]);
      ctx.beginPath();
      ctx.roundRect(68, 68, 264, 264, 36);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // T-shirt / hoodie shape
      ctx.beginPath();
      ctx.moveTo(100, 60); ctx.lineTo(50, 130); ctx.lineTo(100, 150);
      ctx.lineTo(100, 380); ctx.lineTo(300, 380); ctx.lineTo(300, 150);
      ctx.lineTo(350, 130); ctx.lineTo(300, 60);
      ctx.quadraticCurveTo(260, 90, 200, 90);
      ctx.quadraticCurveTo(140, 90, 100, 60);
      ctx.closePath();
      ctx.fill();
    }

    // ── Logo ──────────────────────────────────────────
    if (showLogo && logoImgRef.current) {
      const logoW = W * logoScale;
      const logoH = logoW * (logoImgRef.current.naturalHeight / logoImgRef.current.naturalWidth);
      const logoX = (W - logoW) / 2;
      const lY    = H * logoY - logoH / 2;

      // White circle bg for logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H * logoY, logoW * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fill();
      ctx.restore();

      // Clip circle for logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H * logoY, logoW * 0.52, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImgRef.current, logoX, lY, logoW, logoH);
      ctx.restore();
    } else if (showLogo) {
      // Fallback CC badge
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H * logoY, W * logoScale * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#eab308";
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.round(W * logoScale * 0.6)}px Impact`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CC〽️", W / 2, H * logoY);
      ctx.restore();
    }

    // ── Custom text ───────────────────────────────────
    if (customText.trim()) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      // Shadow for readability
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;
      ctx.fillText(customText, W / 2, H * textY);
      ctx.restore();
    }
  }, [garmentColor, customText, textColor, fontSize, fontFamily, showLogo, logoScale, logoY, textY, product]);

  const downloadMockup = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `CCHub-${product.label}-${garmentColor.label}-mockup.png`;
    a.click();
  };

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `You are a Naija streetwear designer for Cruise Connect Hub (CC Hub), a 3000+ member Nigerian community. Suggest ONE short, punchy text for a ${product.label} merch design. It must feel authentic Naija, hype, and community-proud. Max 4 words. Return ONLY the text string, nothing else. Examples: "WE CRUISE 🚌", "NAIJA PLUG 〽️", "CC HUB FOREVER"`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim();
      if (text) setCustomText(text);
    } catch {}
    setGenerating(false);
  };

  const totalPrice = (mode === "diy" ? product.base_price : product.custom_price) * qty;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-16">
      
      <main className="max-w-5xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Shirt size={20} className="text-yellow-400" /> Merch Designer
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Design your own custom CC Hub merch · Learn to design · Order your piece</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          <button onClick={() => setMode("diy")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              mode === "diy" ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"
            }`}>
            🎨 DIY Designer
          </button>
          <button onClick={() => setMode("custom")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              mode === "custom" ? "bg-yellow-400 text-black" : "text-zinc-400 hover:text-white"
            }`}>
            ✨ Order Custom Design (FX does it)
          </button>
        </div>

        {mode === "diy" ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* LEFT — Canvas mockup */}
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold text-xs">Live Mockup Preview</span>
                  <button onClick={downloadMockup}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-yellow-400 border border-zinc-700 hover:border-yellow-400/40 px-3 py-1.5 rounded-lg transition-colors">
                    <Download size={12}/> Save PNG
                  </button>
                </div>
                <canvas ref={canvasRef} className="w-full rounded-xl border border-zinc-800" />
              </div>

              {/* Product + color pickers */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
                {/* Product */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold mb-2 block">Product</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRODUCTS.map(p => (
                      <button key={p.id} onClick={() => { setProduct(p); setSize(p.sizes[0]); }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all border ${
                          product.id === p.id
                            ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                            : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                        }`}>
                        <span className="text-lg">{p.emoji}</span>
                        <span className="text-[10px]">{p.label}</span>
                        <span className="text-[9px] opacity-70">₦{p.base_price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garment colour */}
                <div>
                  <label className="text-zinc-400 text-xs font-bold mb-2 block">Colour — {garmentColor.label}</label>
                  <div className="flex gap-2 flex-wrap">
                    {GARMENT_COLORS.map(c => (
                      <button key={c.id} onClick={() => setGarmentColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          garmentColor.id === c.id ? "border-yellow-400 scale-110" : "border-transparent"
                        }`} style={{ backgroundColor: c.hex }} title={c.label} />
                    ))}
                  </div>
                </div>

                {/* Size */}
                {product.sizes.length > 1 && (
                  <div>
                    <label className="text-zinc-400 text-xs font-bold mb-2 block">Size</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {product.sizes.map(s => (
                        <button key={s} onClick={() => setSize(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            size === s ? "border-yellow-400 bg-yellow-400/10 text-yellow-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Design controls */}
            <div className="space-y-4">
              {/* CC Hub Logo */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Star size={12} className="text-yellow-400"/> CC Hub Logo
                  </label>
                  <button onClick={() => setShowLogo(!showLogo)}
                    className={`relative w-10 h-5 rounded-full transition-all ${showLogo ? "bg-yellow-400" : "bg-zinc-700"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showLogo ? "left-5" : "left-0.5"}`}/>
                  </button>
                </div>
                {showLogo && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-zinc-500 text-[11px] mb-1 block">Logo Size — {Math.round(logoScale * 100)}%</label>
                      <input type="range" min={20} max={70} value={Math.round(logoScale * 100)}
                        onChange={e => setLogoScale(Number(e.target.value) / 100)}
                        className="w-full accent-yellow-400 cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-zinc-500 text-[11px] mb-1 block">Logo Position (vertical)</label>
                      <input type="range" min={15} max={85} value={Math.round(logoY * 100)}
                        onChange={e => setLogoY(Number(e.target.value) / 100)}
                        className="w-full accent-yellow-400 cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>

              {/* Custom text */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Type size={12} className="text-yellow-400"/> Custom Text
                  </label>
                  <button onClick={generateWithAI} disabled={generating}
                    className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-yellow-400 border border-zinc-700 hover:border-yellow-400/40 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
                    {generating ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>}
                    AI Suggest
                  </button>
                </div>

                <input value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="Your custom text..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors font-bold" />

                {/* Quick text presets */}
                <div className="flex gap-1.5 flex-wrap">
                  {LOGO_TEXTS.map(t => (
                    <button key={t} onClick={() => setCustomText(t)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors border border-zinc-700 hover:border-yellow-400/30 font-medium">
                      {t}
                    </button>
                  ))}
                </div>

                {/* Font + color */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-500 text-[11px] mb-1 block">Font</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-2 focus:border-yellow-400 focus:outline-none">
                      {TEXT_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-[11px] mb-1 block">Text Colour</label>
                    <div className="flex gap-1.5 flex-wrap mt-0.5">
                      {["#eab308","#ffffff","#000000","#ef4444","#22c55e","#3b82f6"].map(c => (
                        <button key={c} onClick={() => setTextColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${textColor === c ? "border-zinc-300 scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-500 text-[11px] mb-1 block">Font Size — {fontSize}px</label>
                  <input type="range" min={14} max={52} value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer" />
                </div>

                <div>
                  <label className="text-zinc-500 text-[11px] mb-1 block">Text Position (vertical)</label>
                  <input type="range" min={15} max={90} value={Math.round(textY * 100)}
                    onChange={e => setTextY(Number(e.target.value) / 100)}
                    className="w-full accent-yellow-400 cursor-pointer" />
                </div>
              </div>

              {/* Order section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-black text-base">₦{totalPrice.toLocaleString()}</p>
                    <p className="text-zinc-500 text-xs">{product.label} · {size} · {garmentColor.label}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-1.5 border border-zinc-700">
                    <button onClick={() => setQty(q => Math.max(1, q-1))} className="text-zinc-400 hover:text-white transition-colors"><Minus size={14}/></button>
                    <span className="text-white font-bold text-sm w-5 text-center">{qty}</span>
                    <button onClick={() => setQty(q => q+1)} className="text-zinc-400 hover:text-white transition-colors"><Plus size={14}/></button>
                  </div>
                </div>

                {orderStep === "idle" && (
                  <button onClick={() => setOrderStep("form")}
                    className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl text-sm hover:bg-yellow-300 transition-all hover:shadow-lg hover:shadow-yellow-400/20 flex items-center justify-center gap-2">
                    <ShoppingCart size={16}/> Order My Design
                  </button>
                )}

                {orderStep === "form" && (
                  <div className="space-y-2.5">
                    <p className="text-white font-bold text-xs mb-1">Shipping details</p>
                    {[
                      { key:"name",    label:"Full Name",       placeholder:"Your name" },
                      { key:"phone",   label:"WhatsApp Number", placeholder:"+234 xxx xxx xxxx" },
                      { key:"address", label:"Delivery Address",placeholder:"Full address, city, state" },
                      { key:"note",    label:"Design Note",     placeholder:"Any special instruction?" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-zinc-500 text-[11px] mb-0.5 block">{label}</label>
                        <input value={orderForm[key as keyof typeof orderForm]}
                          onChange={e => setOrderForm(prev => ({...prev, [key]: e.target.value}))}
                          placeholder={placeholder}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setOrderStep("idle")} className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors">Cancel</button>
                      <button onClick={() => setOrderStep("done")}
                        disabled={!orderForm.name || !orderForm.phone || !orderForm.address}
                        className="flex-1 bg-yellow-400 text-black font-black py-2 rounded-xl text-xs hover:bg-yellow-300 transition-colors disabled:opacity-50">
                        Confirm Order →
                      </button>
                    </div>
                  </div>
                )}

                {orderStep === "done" && (
                  <div className="text-center py-2">
                    <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                    <p className="text-white font-black text-sm">Order Received! 🎉</p>
                    <p className="text-zinc-400 text-xs mt-1">FX〽️ will WhatsApp you shortly to confirm and share payment details. Your mockup has been saved.</p>
                    <button onClick={() => { setOrderStep("idle"); setOrderForm({name:"",address:"",phone:"",note:""}); }}
                      className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors">
                      Design another piece
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── CUSTOM ORDER MODE (FX designs) ──────────────────── */
          <div className="max-w-lg mx-auto space-y-4">
            <div className="bg-gradient-to-br from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-xl">
                  👑
                </div>
                <div>
                  <h2 className="text-white font-black text-sm">Custom Design by FX〽️</h2>
                  <p className="text-zinc-400 text-xs">Sat back while I cook your merch design from scratch</p>
                </div>
              </div>
              <div className="bg-zinc-900/60 rounded-xl p-3 space-y-2 text-xs">
                {[
                  "✅ Fully custom design built around your vision",
                  "✅ CC Hub logo placed professionally",
                  "✅ High-res print-ready file delivered",
                  "✅ Unlimited revisions until you're happy",
                  "✅ Comes with your own PNG mockup to flex",
                ].map(i => <p key={i} className="text-zinc-300">{i}</p>)}
              </div>
            </div>

            {/* Product picker */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <label className="text-white font-bold text-xs mb-3 block">Pick Your Product</label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.map(p => (
                  <button key={p.id} onClick={() => setProduct(p)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      product.id === p.id
                        ? "border-yellow-400/50 bg-yellow-400/10"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}>
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className={`text-xs font-bold ${product.id === p.id ? "text-yellow-400" : "text-white"}`}>{p.label}</p>
                      <p className="text-zinc-500 text-[10px]">₦{p.custom_price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom order form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <label className="text-white font-bold text-xs">Your Design Brief</label>
              {[
                { key:"name",    label:"Your Name",            placeholder:"Your name" },
                { key:"phone",   label:"WhatsApp Number",      placeholder:"+234 xxx xxx xxxx" },
                { key:"address", label:"Delivery Address",     placeholder:"Full address" },
                { key:"note",    label:"What do you want? 👇", placeholder:"Describe your vision — colours, text, style, vibes. Be specific!" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-zinc-500 text-[11px] mb-0.5 block">{label}</label>
                  {key === "note" ? (
                    <textarea value={orderForm[key as keyof typeof orderForm]}
                      onChange={e => setOrderForm(prev => ({...prev, [key]: e.target.value}))}
                      placeholder={placeholder} rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors resize-none" />
                  ) : (
                    <input value={orderForm[key as keyof typeof orderForm]}
                      onChange={e => setOrderForm(prev => ({...prev, [key]: e.target.value}))}
                      placeholder={placeholder}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors" />
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div>
                  <p className="text-white font-black">₦{product.custom_price.toLocaleString()}</p>
                  <p className="text-zinc-500 text-[11px]">{product.label} · Custom Design</p>
                </div>
                {orderStep === "done" ? (
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                    <CheckCircle size={16}/> Sent!
                  </div>
                ) : (
                  <button onClick={() => setOrderStep("done")}
                    disabled={!orderForm.name || !orderForm.phone || !orderForm.note}
                    className="flex items-center gap-1.5 bg-yellow-400 text-black font-black text-xs px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50">
                    <ShoppingCart size={13}/> Order Custom Design
                  </button>
                )}
              </div>
            </div>

            {orderStep === "done" && (
              <div className="bg-green-400/10 border border-green-400/20 rounded-2xl p-4 text-center">
                <p className="text-green-400 font-black text-sm mb-1">Order received! 🎉</p>
                <p className="text-zinc-400 text-xs">FX〽️ will reach out on WhatsApp within 24 hours to discuss your design and share payment details.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
