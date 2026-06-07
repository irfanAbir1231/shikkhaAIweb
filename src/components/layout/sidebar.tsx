'use client';

import { useState, useSyncExternalStore } from 'react';
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
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className={cn('h-10', className)} aria-hidden="true" />;
  }

  const isDark = theme === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift transition-all duration-200 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={`Switch to ${next} mode`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span>{isDark ? 'Light' : 'Dark'} Mode</span>
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass-strong">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">ShikkhaAI</span>
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
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('w-5 h-5 relative z-10', isActive && 'text-white')} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
            pathname === '/settings'
              ? 'text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift'
          )}
          aria-current={pathname === '/settings' ? 'page' : undefined}
        >
          {pathname === '/settings' && (
            <motion.div
              layoutId="activeNav"
              className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Settings className={cn('w-5 h-5 relative z-10', pathname === '/settings' && 'text-white')} />
          <span className="relative z-10">Settings</span>
        </Link>

        <ThemeToggle />

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift transition-all duration-200 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

        {user && (
          <div className="mt-2 p-3 rounded-xl glass">
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

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-64 p-0 gap-0 bg-transparent shadow-none border-0">
        <div className="flex flex-col h-full glass-strong">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">ShikkhaAI</span>
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('w-5 h-5 relative z-10', isActive && 'text-white')} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border/50 space-y-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                pathname === '/settings'
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift'
              )}
              aria-current={pathname === '/settings' ? 'page' : undefined}
            >
              {pathname === '/settings' && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Settings className={cn('w-5 h-5 relative z-10', pathname === '/settings' && 'text-white')} />
              <span className="relative z-10">Settings</span>
            </Link>

            <ThemeToggle />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover-lift transition-all duration-200 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>

            {user && (
              <div className="mt-2 p-3 rounded-xl glass">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">Class {user.grade_level}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
