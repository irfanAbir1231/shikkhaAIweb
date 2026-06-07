'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ChevronRight,
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
        'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-muted/70 text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive && 'text-primary')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && (
        <motion.div
          layoutId="sidebarActiveIndicator"
          className="ml-auto w-1 h-4 rounded-full bg-primary"
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
          'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border/40 bg-background/95 backdrop-blur-sm transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
      >
        {/* ---------- Header ---------- */}
        <div className={cn('flex items-center h-14 shrink-0', collapsed ? 'justify-center px-2' : 'px-3 gap-2')}>
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow shrink-0">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-gradient truncate">ShikkhaAI</span>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ---------- New action ---------- */}
        <div className={cn('shrink-0', collapsed ? 'px-2 pb-2' : 'px-3 pb-3')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/exam/config"
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-primary/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="New Exam"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                New Exam
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/exam/config">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm font-medium h-9">
                <Plus className="w-4 h-4" />
                New Exam
              </Button>
            </Link>
          )}
        </div>

        {/* ---------- Nav ---------- */}
        <nav className={cn('flex-1 overflow-y-auto space-y-0.5 scrollbar-hide', collapsed ? 'px-2' : 'px-3')}>
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
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              pathname === '/settings'
                ? 'bg-muted/70 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Settings className={cn('w-[18px] h-[18px] shrink-0', pathname === '/settings' && 'text-primary')} />
            {!collapsed && <span>Settings</span>}
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
              'mt-2 flex items-center gap-2.5 rounded-lg border border-border/40 bg-muted/30',
              collapsed ? 'p-1.5 justify-center' : 'p-2'
            )}>
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
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
        <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm border-r border-border/40">
          {/* Header */}
          <div className="flex items-center h-14 px-4 gap-2">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <GraduationCap className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">ShikkhaAI</span>
            </Link>
          </div>

          {/* New action */}
          <div className="px-4 pb-3">
            <Link href="/exam/config" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm font-medium h-9">
                <Plus className="w-4 h-4" />
                New Exam
              </Button>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-muted/70 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive && 'text-primary')} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileSidebarActive"
                      className="ml-auto w-1 h-4 rounded-full bg-primary"
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                pathname === '/settings'
                  ? 'bg-muted/70 text-foreground'
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
              <div className="mt-2 flex items-center gap-2.5 p-2 rounded-lg border border-border/40 bg-muted/30">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
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
