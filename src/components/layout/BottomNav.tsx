'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { shouldHideAppChrome } from '@/lib/routeVisibility';
import { Home, Gamepad2, Radio, UserRound } from 'lucide-react';

const TABS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/games', icon: Gamepad2, label: 'Play' },
  { href: '/music', icon: Radio, label: 'FM' },
  { href: '/profile', icon: UserRound, label: 'Profile' },
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
    <nav aria-label="BCH navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-yellow-400/20 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 items-stretch px-2 py-1.5 gap-1 max-w-xl mx-auto">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          const badge = href === '/profile' ? unreadDMs : 0;
          return (
            <Link key={href} href={href} aria-label={label} title={label}
              className={`relative min-h-[58px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${active ? 'text-yellow-400 bg-yellow-400/12' : 'text-zinc-400 hover:text-zinc-100'}`}>
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={active ? 2.6 : 2} />
                {badge > 0 && <div className="absolute -top-2 -right-3 min-w-5 h-5 px-1 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">{badge > 9 ? '9+' : badge}</div>}
              </div>
              <span className={`text-xs font-semibold tracking-wide ${active ? 'text-yellow-400' : 'text-zinc-400'}`}>{label}</span>
              {active && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-yellow-400 rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
