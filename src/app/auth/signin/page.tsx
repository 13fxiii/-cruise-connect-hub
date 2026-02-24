"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Twitter, Mail, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleTwitter = async () => {
    setLoading("twitter");
    await signIn("twitter", { callbackUrl: "/feed" });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    const res = await signIn("resend", { email, redirect: false, callbackUrl: "/feed" });
    setLoading(null);
    if (res?.ok) setEmailSent(true);
  };

  return (
    <div className="min-h-screen bg-cch-black flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cch-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <Link href="/" className="flex items-center gap-1.5 text-cch-muted hover:text-white transition-colors text-sm mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cch-gold flex items-center justify-center mx-auto mb-4 gold-glow">
            <Zap size={24} className="text-black" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Join the Cruise 🚀</h1>
          <p className="text-cch-muted text-sm">Cruise & Connect Hub〽️</p>
        </div>

        {emailSent ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-bold text-white mb-2">Check your email!</h2>
            <p className="text-cch-muted text-sm">We sent a magic link to <strong className="text-white">{email}</strong></p>
            <button onClick={() => setEmailSent(false)} className="mt-4 text-cch-gold text-sm hover:underline">
              Use different email
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Twitter/X */}
            <button
              onClick={handleTwitter}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1DA1F2] hover:bg-[#1a94da] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Twitter size={18} fill="white" />
              {loading === "twitter" ? "Connecting..." : "Continue with X (Twitter)"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-cch-border" />
              <span className="text-cch-muted text-xs">or</span>
              <div className="flex-1 h-px bg-cch-border" />
            </div>

            {/* Email */}
            <form onSubmit={handleEmail} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-cch-surface-2 border border-cch-border rounded-xl px-4 py-3 text-white placeholder:text-cch-muted focus:outline-none focus:border-cch-gold transition-colors text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!!loading || !email}
                className="w-full flex items-center justify-center gap-2 btn-outline py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                {loading === "email" ? "Sending..." : "Continue with Email"}
              </button>
            </form>

            <p className="text-center text-cch-muted text-xs pt-2">
              By joining, you agree to our{" "}
              <Link href="/terms" className="text-cch-gold hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-cch-gold hover:underline">Privacy Policy</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
