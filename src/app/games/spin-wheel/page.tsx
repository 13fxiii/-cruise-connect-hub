"use client";
import { useState, useRef, useEffect } from "react";
import { RotateCcw, Home, Share2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const PRIZES = [
  { label: "₦500 Cash", color: "#EAB308", textColor: "#000", emoji: "💰" },
  { label: "Dare Time 😈", color: "#ef4444", textColor: "#fff", emoji: "😈" },
  { label: "₦1,000 Cash", color: "#22c55e", textColor: "#fff", emoji: "💵" },
  { label: "Free Pass ✅", color: "#3b82f6", textColor: "#fff", emoji: "✅" },
  { label: "Try Again 🔄", color: "#6b7280", textColor: "#fff", emoji: "🔄" },
  { label: "₦200 Cash", color: "#f97316", textColor: "#fff", emoji: "💸" },
  { label: "Song Request 🎵", color: "#a855f7", textColor: "#fff", emoji: "🎵" },
  { label: "Dance Off 🕺", color: "#ec4899", textColor: "#fff", emoji: "🕺" },
  { label: "₦2,000 JACKPOT", color: "#EAB308", textColor: "#000", emoji: "🎰" },
  { label: "Shoutout 📢", color: "#14b8a6", textColor: "#fff", emoji: "📢" },
];

const DARES = [
  "Do your best impression of a Nigerian politician 🎭",
  "Sing 30 seconds of any Burna Boy song 🎤",
  "Tell us your most embarrassing story 😅",
  "Do 10 push-ups RIGHT NOW 💪",
  "Share your most recent search history item 👀",
  "Send a voice note singing 'Ye' by Burna Boy 🎶",
  "Change your X bio for 24 hours to something funny 😂",
  "Tag 3 friends in this post saying they need to join C&C Hub 🚌",
  "Do your best Nigerian accent impression 🗣️",
  "Reply to the last 5 people who texted you with just '👀' 😭",
];

export default function SpinWheelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof PRIZES[0]|null>(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [dare, setDare] = useState("");
  const animRef = useRef<number>();
  const currentRotRef = useRef(0);

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W/2, cy = H/2;
    const radius = Math.min(W,H)/2 - 10;
    const sliceAngle = (2*Math.PI)/PRIZES.length;

    ctx.clearRect(0,0,W,H);

    // Draw slices
    PRIZES.forEach((prize, i) => {
      const startAngle = rot + i*sliceAngle - Math.PI/2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,radius,startAngle,endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(startAngle + sliceAngle/2);
      ctx.textAlign = "right";
      ctx.fillStyle = prize.textColor;
      ctx.font = "bold 11px system-ui";
      ctx.fillText(prize.label, radius - 12, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx,cy,30,0,2*Math.PI);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    ctx.strokeStyle = "#EAB308";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#EAB308";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", cx, cy+5);

    // Pointer
    ctx.beginPath();
    ctx.moveTo(cx+radius+8, cy);
    ctx.lineTo(cx+radius-10, cy-10);
    ctx.lineTo(cx+radius-10, cy+10);
    ctx.closePath();
    ctx.fillStyle = "#EAB308";
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(0);
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setDare("");

    const extraSpins = 5 + Math.floor(Math.random()*5);
    const targetAngle = currentRotRef.current + extraSpins*2*Math.PI + Math.random()*2*Math.PI;
    const duration = 4000 + Math.random()*2000;
    const startTime = performance.now();
    const startRot = currentRotRef.current;

    const easeOut = (t:number) => 1 - Math.pow(1-t, 4);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed/duration, 1);
      const easedProgress = easeOut(progress);
      const currentAngle = startRot + (targetAngle-startRot)*easedProgress;

      currentRotRef.current = currentAngle;
      drawWheel(currentAngle);

      if(progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Figure out result
        const sliceAngle = (2*Math.PI)/PRIZES.length;
        const normalized = ((currentAngle % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
        // pointer is at right side (0 rad from center), pointing right
        // offset by -PI/2 for top alignment
        const pointerAngle = (2*Math.PI - normalized + Math.PI/2 + Math.PI/2) % (2*Math.PI);
        const idx = Math.floor(pointerAngle / sliceAngle) % PRIZES.length;
        const prize = PRIZES[idx];
        setResult(prize);
        setHistory(h => [prize.label, ...h].slice(0,5));
        if(prize.label.includes("Dare")) {
          setDare(DARES[Math.floor(Math.random()*DARES.length)]);
        }
        setSpinning(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar/>
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="text-zinc-400 hover:text-white text-sm">← Games</Link>
          <h1 className="text-xl font-black text-white">Spin the Wheel 🎡</h1>
          <div className="w-16"/>
        </div>

        {/* Wheel */}
        <div className="relative flex justify-center mb-6">
          <canvas ref={canvasRef} width={320} height={320} className="rounded-full"/>
        </div>

        {/* Spin Button */}
        <button onClick={spin} disabled={spinning}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${spinning?"bg-zinc-800 text-zinc-500 cursor-not-allowed":"bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-[1.02]"}`}>
          {spinning?"Spinning... 🎡":"SPIN THE WHEEL 🎰"}
        </button>

        {/* Result */}
        {result&&(
          <div className="mt-5 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-3">
            <div className="text-4xl">{result.emoji}</div>
            <h2 className="text-2xl font-black text-white">{result.label}</h2>
            {result.label.includes("Cash")||result.label.includes("JACKPOT")?
              <p className="text-zinc-400 text-sm">DM <span className="text-yellow-400 font-bold">@CCHub_</span> on X to claim your prize! 🏆</p>:
              dare?<p className="text-orange-400 font-bold text-sm">{dare}</p>:
              <p className="text-zinc-400 text-sm">You got: {result.label}</p>
            }
            <button onClick={spin} className="bg-yellow-400 text-black font-black px-6 py-2 rounded-full hover:bg-yellow-300 text-sm">
              Spin Again
            </button>
          </div>
        )}

        {/* History */}
        {history.length>0&&(
          <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wide mb-3">Recent Spins</h3>
            <div className="space-y-2">
              {history.map((h,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <span className="text-zinc-600 text-xs">#{i+1}</span>
                  <span className="text-zinc-300 text-sm">{h}</span>
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
