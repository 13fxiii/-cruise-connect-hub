'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { shouldHideAppChrome } from '@/lib/routeVisibility';
import { Rss, Radio, Gamepad2, MessageCircle, Plus } from 'lucide-react';

const TABS = [
  { href: '/feed', icon: Rss, label: 'Feed' },
  { href: '/spaces', icon: Radio, label: 'Live' },
  { href: '/games', icon: Gamepad2, label: 'Play' },
  { href: '/messages', icon: MessageCircle, label: 'DMs' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadDMs, setUnreadDMs] = useState(0);
  const shouldHide = shouldHideAppChrome(pathname);

  useEffect(() => {
    if (!user || shouldHide) return;
    const fetch_ = () => {
      fetch('/api/messages').then(r => r.json()).then(d => {
        const total = (d.conversations || []).reduce((a: number, c: any) => a + (c.unread || 0), 0);
        setUnreadDMs(total);
      }).catch(() => {});
    };
    fetch_();
    const t = setInterval(fetch_, 30000);
    return () => clearInterval(t);
  }, [user, shouldHide]);

  if (shouldHide) return null;

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav aria-label="BCH navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-zinc-800/70 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 py-1">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          const badge = href === '/messages' ? unreadDMs : 0;
          return (
            <Link key={href} href={href} aria-label={label} title={label}
              className={`flex items-center justify-center w-11 h-10 rounded-xl transition-all relative ${active ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <div className="relative">
                <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 1.8} />
                {badge > 0 && <div className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">{badge > 9 ? '9+' : badge}</div>}
              </div>
              {active && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />}
            </Link>
          );
        })}
        <Link href="/feed?compose=1" aria-label="Create post" title="Create post" className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </Link>
      </div>
    </nav>
  );
}
