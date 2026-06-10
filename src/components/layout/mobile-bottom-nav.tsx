'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  FileQuestion,
  MessageCircle,
  Timer,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/exam/config', label: 'Exam', icon: FileQuestion },
  { href: '/study-companion', label: 'AI', icon: MessageCircle },
  { href: '/focus-session', label: 'Focus', icon: Timer },
  { href: '/spaces', label: 'Spaces', icon: FolderOpen },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on exam session pages
  if (pathname.startsWith('/exam/session')) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong border-t border-border/40 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn('size-5 transition-transform', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
