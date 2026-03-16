"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Bell, Heart, MessageCircle, UserPlus, ShoppingBag, Vote, Music, Megaphone, Trophy, Gift, Loader2, Check } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  like:                  { icon: Heart,        color: "text-pink-400",   bg: "bg-pink-400/10"   },
  comment:               { icon: MessageCircle,color: "text-blue-400",   bg: "bg-blue-400/10"   },
  follow:                { icon: UserPlus,     color: "text-green-400",  bg: "bg-green-400/10"  },
  dm:                    { icon: MessageCircle,color: "text-yellow-400", bg: "bg-yellow-400/10" },
  marketplace_sale:      { icon: ShoppingBag,  color: "text-green-400",  bg: "bg-green-400/10"  },
  dao_vote:              { icon: Vote,         color: "text-purple-400", bg: "bg-purple-400/10" },
  artist_submission:     { icon: Music,        color: "text-pink-400",   bg: "bg-pink-400/10"   },
  sponsorship_application:{ icon: Megaphone,   color: "text-orange-400", bg: "bg-orange-400/10" },
  tournament:            { icon: Trophy,       color: "text-yellow-400", bg: "bg-yellow-400/10" },
  gift:                  { icon: Gift,         color: "text-red-400",    bg: "bg-red-400/10"    },
  default:               { icon: Bell,         color: "text-zinc-400",   bg: "bg-zinc-800"      },
};

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000)   return "just now";
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`;
  if (d < 86400000)return `${Math.floor(d/3600000)}h ago`;
  return `${Math.floor(d/86400000)}d ago`;
}

export default function NotificationsPage() {
  const { user }                    = useAuth();
  const [notifs, setNotifs]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter]         = useState("all");
  const supabase                    = createClient();

  const fetchNotifs = async () => {
    const res = await fetch("/api/notifications?limit=50");
    const data = await res.json();
    setNotifs(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifs();

    // Realtime subscription
    const ch = supabase.channel("notifs-realtime")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        setNotifs(n => [payload.new as any, ...n]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications?mark_all=1", { method: "PATCH" });
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const filtered = filter === "all" ? notifs : filter === "unread" ? notifs.filter(n => !n.is_read) : notifs.filter(n => n.type === filter);

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a]"><Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Bell className="w-12 h-12 text-zinc-700" />
        <p className="text-zinc-400">Sign in to see notifications</p>
        <Link href="/auth/login" className="bg-yellow-400 text-black font-black px-6 py-2.5 rounded-full">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" /> Notifications
              {unreadCount > 0 && (
                <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h1>
            <p className="text-zinc-600 text-xs mt-0.5">{notifs.length} total</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full transition-colors">
              {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
          {[
            { id:"all",       label:"All"         },
            { id:"unread",    label:"Unread"       },
            { id:"like",      label:"❤️ Likes"    },
            { id:"comment",   label:"💬 Comments" },
            { id:"follow",    label:"👥 Follows"  },
            { id:"dm",        label:"📩 DMs"      },
            { id:"gift",      label:"🎁 Gifts"    },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                filter === f.id ? "bg-yellow-400 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No notifications yet</p>
            <p className="text-zinc-700 text-xs mt-1">Engage with the community to start receiving notifications</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              const Icon = cfg.icon;
              return (
                <div key={n.id}
                  onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                  className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
                    n.is_read ? "bg-zinc-950/50 border border-zinc-900" : "bg-zinc-950 border border-zinc-800 hover:border-zinc-700"
                  }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold leading-snug ${n.is_read ? "text-zinc-400" : "text-white"}`}>
                      {n.title || n.message}
                    </div>
                    {n.body && n.body !== n.title && (
                      <div className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{n.body}</div>
                    )}
                    <div className="text-zinc-700 text-[10px] mt-1">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
