"use client";
import { useState } from "react";
import { Send, ImageIcon, Hash, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const charLimit = 2000;

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-4 mb-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
            placeholder="What's the vibe today? Share with the Hub 🚌"
            rows={3}
            className="w-full bg-transparent text-white placeholder:text-gray-500 resize-none outline-none text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-yellow-500/10">
            <div className="flex items-center gap-3 text-gray-500">
              <button className="hover:text-white transition-colors" title="Add image"><ImageIcon size={16} /></button>
              <button className="hover:text-white transition-colors" title="Add tag"><Hash size={16} /></button>
              <span className={`text-xs ${content.length > charLimit * 0.9 ? "text-yellow-400" : ""}`}>
                {charLimit - content.length}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="bg-yellow-400 text-black text-sm px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 disabled:opacity-40 hover:bg-yellow-300 transition-colors"
            >
              <Send size={13} />
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
