'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
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
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Zap,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Nav data                                                           */
/* ------------------------------------------------------------------ */
const navItems = [
  { href: '/topics', label: 'Topics', icon: BookOpen },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/study-companion', label: 'Study Companion', icon: MessageCircle },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar },
  { href: '/focus-session', label: 'Focus Session', icon: Timer },
  { href: '/spaces', label: 'Spaces', icon: FolderOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

/* ------------------------------------------------------------------ */
/*  Theme toggle (compact)                                             */
/* ------------------------------------------------------------------ */
function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="h-9" aria-hidden="true" />;
  }

  const isDark = theme === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors w-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Switch to ${next} mode`}
    >
      {isDark ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
      {!collapsed && <span className="truncate">{isDark ? 'Light' : 'Dark'} Mode</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav item                                                   */
/* ------------------------------------------------------------------ */
function NavItem({
  item,
  collapsed,
}: {
  item: (typeof navItems)[number];
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  const inner = (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring relative overflow-hidden',
        isActive
          ? 'text-primary bg-primary/10 shadow-[inset_0_0_12px_-4px_rgba(139,92,246,0.2)]'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active glow background */}
      {isActive && (
        <motion.div
          layoutId="sidebarGlow"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      {/* Active left border glow */}
      {isActive && (
        <motion.div
          layoutId="sidebarBorder"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className={cn('w-[18px] h-[18px] shrink-0 relative z-10 transition-transform duration-200', isActive && 'text-primary scale-110')} />
      {!collapsed && <span className="truncate relative z-10">{item.label}</span>}
      {!collapsed && isActive && (
        <motion.div
          layoutId="sidebarActiveIndicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(139,92,246,0.8)]"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={inner} />
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

/* ------------------------------------------------------------------ */
/*  Desktop Sidebar                                                    */
/* ------------------------------------------------------------------ */
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  /* Persist collapsed state */
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border/40 bg-background/95 backdrop-blur-xl transition-[width] duration-300 ease-in-out z-40',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* ---------- Header ---------- */}
        <div className={cn('flex items-center h-16 shrink-0', collapsed ? 'justify-center px-2' : 'px-4 gap-2')}>
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 shadow-glow">
              <GraduationCap className="w-[18px] h-[18px] text-primary" />
            </div>
            {!collapsed && (
              <span className="font-display text-xl font-bold truncate tracking-tight">ShikkhaAI</span>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ---------- New action ---------- */}
        <div className={cn('shrink-0', collapsed ? 'px-2 pb-3' : 'px-3 pb-3')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/exam/config"
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-glow transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="New Exam"
                  >
                    <Plus className="w-5 h-5" />
                  </Link>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                New Exam
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/exam/config">
              <Button 
                variant="gradient" 
                className="w-full justify-start gap-2 text-sm font-medium h-10 shadow-glow hover:shadow-glow-lg transition-shadow"
              >
                <Zap className="w-4 h-4" />
                New Exam
              </Button>
            </Link>
          )}
        </div>

        {/* ---------- Nav ---------- */}
        <nav className={cn('flex-1 overflow-y-auto space-y-1 scrollbar-hide', collapsed ? 'px-2' : 'px-3')}>
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* ---------- Bottom ---------- */}
        <div className={cn('shrink-0 border-t border-border/40', collapsed ? 'px-2 py-2 space-y-1' : 'px-3 py-3 space-y-1')}>
          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring relative',
              pathname === '/settings'
                ? 'text-primary bg-primary/10 shadow-[inset_0_0_12px_-4px_rgba(139,92,246,0.2)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
          >
            {pathname === '/settings' && (
              <>
                <motion.div
                  layoutId="sidebarBorderSettings"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                />
                <motion.div
                  layoutId="sidebarGlowSettings"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                />
              </>
            )}
            <Settings className={cn('w-[18px] h-[18px] shrink-0 relative z-10', pathname === '/settings' && 'text-primary scale-110')} />
            {!collapsed && <span className="relative z-10">Settings</span>}
          </Link>

          {/* Theme */}
          <ThemeToggle collapsed={collapsed} />

          {/* Logout */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Logout"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                  </button>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <span>Logout</span>
            </button>
          )}

          {/* User profile */}
          {user && (
            <div className={cn(
              'mt-2 flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/30 backdrop-blur-sm',
              collapsed ? 'p-1.5 justify-center' : 'p-2.5'
            )}>
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold ring-1 ring-primary/20">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">Class {user.grade_level}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- Expand button (when collapsed) ---------- */}
        {collapsed && (
          <div className="flex justify-center py-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Sidebar                                                     */
/* ------------------------------------------------------------------ */
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
      <SheetContent side="left" className="w-[280px] p-0 gap-0 bg-transparent shadow-none border-0">
        <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl border-r border-border/40">
          {/* Header */}
          <div className="flex items-center h-16 px-4 gap-2">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shadow-glow">
                <GraduationCap className="w-[18px] h-[18px] text-primary" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">ShikkhaAI</span>
            </Link>
          </div>

          {/* New action */}
          <div className="px-4 pb-3">
            <Link href="/exam/config" onClick={() => setOpen(false)}>
              <Button variant="gradient" className="w-full justify-start gap-2 text-sm font-medium h-10 shadow-glow">
                <Zap className="w-4 h-4" />
                New Exam
              </Button>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring relative',
                    isActive
                      ? 'text-primary bg-primary/10 shadow-[inset_0_0_12px_-4px_rgba(139,92,246,0.2)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  )}
                  <Icon className={cn('w-[18px] h-[18px] shrink-0 relative z-10', isActive && 'text-primary scale-110')} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileSidebarActive"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(139,92,246,0.8)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-border/40 space-y-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                pathname === '/settings'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Settings className={cn('w-[18px] h-[18px] shrink-0', pathname === '/settings' && 'text-primary')} />
              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <span>Logout</span>
            </button>

            {user && (
              <div className="mt-2 flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40 bg-muted/30">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold ring-1 ring-primary/20">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">Class {user.grade_level}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
