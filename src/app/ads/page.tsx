"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Megaphone, Check, ExternalLink, AlertCircle } from "lucide-react";

const PACKAGES = [
  { id: "day", label: "1 Day AD", price: 20000, desc: "Single post (article provided)", badge: null },
  { id: "day_dual", label: "1 Day Dual AD", price: 40000, desc: "Two posts in one day", badge: "🔥 Popular" },
  { id: "weekly", label: "Weekly ADS", price: 140000, desc: "1-week campaign (7 posts)", badge: null },
  { id: "monthly", label: "Monthly ADS", price: 350000, desc: "4-week campaign", badge: "💎 Best Value" },
  { id: "ambassador_3m", label: "3 Month Deal", price: 750000, desc: "Full endorsement", badge: null },
  { id: "ambassador_6m", label: "6 Month Deal", price: 1500000, desc: "Premium partnership", badge: "👑 Premium" },
];

export default function AdsPage() {
  const [selected, setSelected] = useState<string>("day");
  const [form, setForm] = useState({
    brand_name: "", contact_name: "", contact_email: "",
    contact_phone: "", description: "", link_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const pkg = PACKAGES.find((p) => p.id === selected)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, package: selected, amount_ngn: pkg.price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG")}`;

  if (success) {
    return (
      <div className="min-h-screen bg-cch-black">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Submission Received! 🎉</h2>
          <p className="text-cch-muted mb-6">
            Your PR/AD request for <strong className="text-white">{pkg.label}</strong> ({formatPrice(pkg.price)}) has been received.
            We'll reach out to <strong className="text-white">{form.contact_email}</strong> within 24 hours to confirm and share payment details.
          </p>
          <div className="card text-left mb-6">
            <p className="text-sm text-cch-muted mb-1">Payment to:</p>
            <p className="text-white font-bold text-lg">13FXIII</p>
            <p className="text-cch-muted text-sm">On all platforms @TheCruiseCH</p>
          </div>
          <button onClick={() => setSuccess(false)} className="btn-outline text-sm">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cch-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-cch-gold/10 border border-cch-gold/30 rounded-full px-4 py-1.5 text-cch-gold text-sm font-medium mb-4">
            <Megaphone size={14} /> PR / ADS Packages
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Promote with <span className="gradient-text">C&C Hub〽️</span>
          </h1>
          <p className="text-cch-muted max-w-xl mx-auto">
            Get your brand, music, or business in front of 15K+ engaged Africans. Real reach, real results.
          </p>
        </div>

        {/* Package Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                selected === p.id
                  ? "border-cch-gold bg-cch-gold/10 gold-glow-sm"
                  : "border-cch-border bg-cch-surface hover:border-cch-border/80"
              }`}
            >
              {p.badge && (
                <span className="absolute top-2 right-2 text-xs bg-cch-surface-2 rounded-full px-2 py-0.5">
                  {p.badge}
                </span>
              )}
              <div className="font-bold text-white text-sm mb-0.5">{p.label}</div>
              <div className="text-cch-gold font-black text-lg">{formatPrice(p.price)}</div>
              <div className="text-cch-muted text-xs mt-1">{p.desc}</div>
              {selected === p.id && (
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-cch-gold flex items-center justify-center">
                  <Check size={10} className="text-black" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Submission Form */}
        <div className="card">
          <h2 className="font-bold text-white mb-1">
            Submit Request — <span className="text-cch-gold">{pkg.label} ({formatPrice(pkg.price)})</span>
          </h2>
          <p className="text-cch-muted text-sm mb-6">Fill in your details and we'll reach out within 24 hours.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "brand_name", label: "Brand / Artist Name", placeholder: "e.g. Thrill Seeker Ent", required: true },
                { name: "contact_name", label: "Contact Name", placeholder: "Your full name", required: true },
                { name: "contact_email", label: "Email Address", placeholder: "you@example.com", type: "email", required: true },
                { name: "contact_phone", label: "WhatsApp Number", placeholder: "+234 800 000 0000", required: false },
                { name: "link_url", label: "Link to Promote", placeholder: "https://linktr.ee/yourpage", required: false },
              ].map((field) => (
                <div key={field.name} className={field.name === "contact_email" ? "" : ""}>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    {field.label} {field.required && <span className="text-cch-gold">*</span>}
                  </label>
                  <input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={(form as any)[field.name]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    className="w-full bg-cch-surface-2 border border-cch-border rounded-lg px-3 py-2.5 text-white placeholder:text-cch-muted focus:outline-none focus:border-cch-gold transition-colors text-sm"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                What to promote? <span className="text-cch-gold">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe what you want to promote — your music, brand, product, event, etc. The more detail you give, the better we can craft your campaign."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-cch-surface-2 border border-cch-border rounded-lg px-3 py-2.5 text-white placeholder:text-cch-muted focus:outline-none focus:border-cch-gold transition-colors text-sm resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Megaphone size={16} />
              {loading ? "Submitting..." : `Submit — ${pkg.label} (${formatPrice(pkg.price)})`}
            </button>

            <p className="text-center text-cch-muted text-xs">
              Payment details will be shared after review. Questions? DM{" "}
              <a href="https://x.com/TheCruiseCH" target="_blank" rel="noopener noreferrer" className="text-cch-gold hover:underline inline-flex items-center gap-0.5">
                @TheCruiseCH <ExternalLink size={10} />
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
