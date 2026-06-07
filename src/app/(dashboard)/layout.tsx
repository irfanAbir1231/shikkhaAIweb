import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { GardenHeaderBadge } from '@/components/layout/garden-header-badge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 glass px-4 lg:px-6">
          <MobileSidebar />
          <div className="flex-1" />
          <GardenHeaderBadge />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
