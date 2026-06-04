'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileQuestion,
  BookOpen,
  Library,
  MessageCircle,
  Calendar,
  Timer,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/exam/config', label: 'Exam', icon: FileQuestion },
  { href: '/topics', label: 'Topics', icon: BookOpen },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/study-companion', label: 'Study Companion', icon: MessageCircle },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar },
  { href: '/focus-session', label: 'Focus Session', icon: Timer },
  { href: '/spaces', label: 'Spaces', icon: FolderOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">ShikkhaAI</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>

        <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
          <LogOut className="w-5 h-5" />
          Logout
        </Button>

        {user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">Class {user.grade_level}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">ShikkhaAI</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>

          <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="w-5 h-5" />
            Logout
          </Button>

          {user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">Class {user.grade_level}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


