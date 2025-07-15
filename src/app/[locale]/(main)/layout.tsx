
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };
  
  // Close sidebar on mobile when switching from mobile to desktop view
  React.useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isSidebarOpen]);

  const SidebarContent = () => (
    <AppSidebar 
      isCollapsed={isSidebarCollapsed && !isMobile}
      closeSidebar={() => setIsSidebarOpen(false)} 
    />
  );

  if (isMobile) {
    return (
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <AppHeader onToggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
        <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        'grid min-h-screen w-full md:grid-cols-[256px_1fr]',
        isSidebarCollapsed && 'md:grid-cols-[80px_1fr]',
        'transition-all duration-300 ease-in-out'
      )}
    >
      <div className="hidden md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col">
        <AppHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary/50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
