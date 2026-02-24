'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Megaphone, Bell, User, Plus } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/pr-ads', icon: Megaphone, label: 'PR/ADS' },
    { href: '/pr-ads/submit', icon: Plus, label: '', isAction: true },
    { href: '/notifications', icon: Bell, label: 'Alerts' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-brand-border lg:hidden z-20">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, icon: Icon, label, isAction }) => {
          const isActive = pathname === href;
          if (isAction) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center w-12 h-12 bg-brand-gold rounded-full -mt-4 shadow-lg shadow-brand-gold/30"
              >
                <Icon className="w-5 h-5 text-black" />
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-brand-gold' : 'text-brand-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
