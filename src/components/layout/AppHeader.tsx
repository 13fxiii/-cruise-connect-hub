// @ts-nocheck
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronLeft, Search, MoreVertical } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

type Props = {
  title?: string;
  back?: boolean;
  action?: React.ReactNode;
  showSearch?: boolean;
};

export default function AppHeader({ title, back, action, showSearch }: Props) {
  const { user } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('avatar_url').eq('id', user.id).single()
      .then(({ data }) => setAvatar(data?.avatar_url || null));
    supabase.from('notifications').select('id', { count: 'exact' })
      .eq('recipient_id', user.id).eq('is_read', false)
      .then(({ count }) => setUnread(count || 0));
  }, [user]);

  const isHome = pathname === '/feed';

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900">
      <div className="flex items-center justify-between px-4 h-14" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          {back && !isHome ? (
            <button onClick={() => router.back()} className="p-1.5 -ml-1.5 text-zinc-400 active:text-white">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : null}

          {title ? (
            <h1 className="font-black text-white text-lg truncate">{title}</h1>
          ) : (
            <Link href="/feed" className="flex items-center gap-2">
              <span className="text-2xl">🚌</span>
              <span className="font-black text-white text-base leading-tight">
                CC <span className="text-yellow-400">Hub〽️</span>
              </span>
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <Link href="/search" className="p-2 text-zinc-400 active:text-white">
              <Search className="w-5 h-5" />
            </Link>
          )}
          {action}
          <Link href="/notifications" className="relative p-2 text-zinc-400 active:text-white">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </Link>
          <Link href="/profile" className="ml-0.5">
            {avatar ? (
              <img src={avatar} alt="Me" className="w-7 h-7 rounded-full object-cover border border-zinc-700" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="text-xs text-zinc-400 font-bold">
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
