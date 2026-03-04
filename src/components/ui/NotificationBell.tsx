"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Zap, Heart, Gamepad2, Wallet, Radio, Star, MessageCircle } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
};

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  like:         { icon: <Heart className="w-3.5 h-3.5" />, color: "text-red-400" },
  comment:      { icon: <MessageCircle className="w-3.5 h-3.5" />, color: "text-blue-400" },
  game_start:   { icon: <Gamepad2 className="w-3.5 h-3.5" />, color: "text-green-400" },
  wallet_credit:{ icon: <Wallet className="w-3.5 h-3.5" />, color: "text-yellow-400" },
  space_live:   { icon: <Radio className="w-3.5 h-3.5" />, color: "text-red-400" },
  prize_won:    { icon: <Star className="w-3.5 h-3.5" />, color: "text-yellow-400" },
  system:       { icon: <Zap className="w-3.5 h-3.5" />, color: "text-zinc-400" },
  ad_approved:  { icon: <Check className="w-3.5 h-3.5" />, color: "text-green-400" },
};

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function NotificationBell({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.is_read).length;

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications${userId ? `?user_id=${userId}` : ""}`);
      const data = await res.json();
      setNotifs(data.notifications || []);
    } catch { /* use existing */ }
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, [userId]);

  // Refresh every 30s
  useEffect(() => {
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }) });
    } catch { /**/ }
  };

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notification_id: id, user_id: userId }) });
    } catch { /**/ }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifs(); }}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center px-0.5 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white text-sm">Notifications</span>
              {unread > 0 && <span className="bg-yellow-400 text-black text-xs font-black px-1.5 py-0.5 rounded-full">{unread}</span>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifs.length === 0 && (
              <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">Loading...</div>
            )}
            {!loading && notifs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-sm gap-2">
                <Bell className="w-8 h-8 text-zinc-700" />
                <span>No notifications yet</span>
              </div>
            )}
            {notifs.map(n => {
              const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.system;
              return (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 cursor-pointer transition-colors hover:bg-zinc-900 ${!n.is_read ? "bg-yellow-400/5" : ""}`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center mt-0.5 ${typeInfo.color}`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!n.is_read ? "text-white font-medium" : "text-zinc-300"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    {n.body && <p className="text-xs text-zinc-500 mt-0.5 truncate">{n.body}</p>}
                    <p className="text-xs text-zinc-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 px-4 py-2">
            <Link href="/notifications" onClick={() => setOpen(false)}
              className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
