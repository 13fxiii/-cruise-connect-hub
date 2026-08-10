// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, ShoppingBag, Trophy, Gift, Loader2, Check } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@appdeploy/client';

const TYPE_ICON: Record<string, any> = {
  like: { icon: Heart, color: 'text-red-400 bg-red-400/10' },
  comment: { icon: MessageCircle, color: 'text-blue-400 bg-blue-400/10' },
  follow: { icon: UserPlus, color: 'text-green-400 bg-green-400/10' },
  dm: { icon: MessageCircle, color: 'text-yellow-400 bg-yellow-400/10' },
  message: { icon: MessageCircle, color: 'text-yellow-400 bg-yellow-400/10' },
  tournament: { icon: Trophy, color: 'text-yellow-400 bg-yellow-400/10' },
  gift: { icon: Gift, color: 'text-pink-400 bg-pink-400/10' },
  marketplace_sale: { icon: ShoppingBag, color: 'text-green-400 bg-green-400/10' },
  default: { icon: Bell, color: 'text-zinc-400 bg-zinc-800' },
};

function timeAgo(iso: string | number) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setN] = useState<any[]>([]);
  const [loading, setL] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setL(true);
    try {
      const { data } = await api.get('/api/notifications');
      setN(data?.notifications || []);
    } finally {
      setL(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const markAll = async () => {
    if (!user) return;
    await api.post('/api/notifications/read', {});
    setN(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <AppHeader title="Notifications" back action={
        unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1 text-xs text-zinc-400 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
            <Check className="w-3.5 h-3.5" /> All read
          </button>
        )
      } />

      <div className="max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-white font-bold">No notifications yet</p>
            <p className="text-zinc-500 text-sm mt-1">We'll let you know when things happen</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {notifs.map(n => {
              const cfg = TYPE_ICON[n.type] || TYPE_ICON.default;
              const Icon = cfg.icon;
              return (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 ${!n.read ? 'bg-yellow-400/3' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm leading-snug">{n.text || n.message || n.type?.replace(/_/g, ' ') || 'New activity'}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{timeAgo(n.createdAt || n.created_at)}</p>
                  </div>
                  {!n.read && <div className="shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-1.5" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
