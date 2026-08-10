'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Radio, User } from 'lucide-react';
import { shouldHideAppChrome } from '@/lib/routeVisibility';

const TABS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/games', icon: Gamepad2, label: 'Play' },
  { href: '/music', icon: Radio, label: 'FM' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (shouldHideAppChrome(pathname)) return null;
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  return (
    <nav aria-label="BCH navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-zinc-800/70 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return <Link key={href} href={href} aria-label={label} title={label} className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-12 rounded-xl transition-all ${active ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-400 hover:text-zinc-200'}`}><Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.9} /><span className="text-xs font-semibold">{label}</span>{active && <div className="w-1 h-1 bg-yellow-400 rounded-full" />}</Link>;
        })}
      </div>
    </nav>
  );
}