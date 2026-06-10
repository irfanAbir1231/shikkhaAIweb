'use client';

import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { GardenHeaderBadge } from '@/components/layout/garden-header-badge';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass px-4 lg:px-6">
          <MobileSidebar />
          <div className="flex-1" />
          
          {/* Notification bell */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hidden sm:flex"
            onClick={() => toast.info('Notifications coming soon!')}
          >
            <Bell className="size-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
          </Button>
          
          <GardenHeaderBadge />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto relative z-0 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
