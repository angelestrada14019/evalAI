'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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

  const mainContent = (
    <main className="flex-1 overflow-x-hidden bg-secondary/50 p-4 sm:p-6">
      {children}
    </main>
  );

  if (isMobile) {
    return (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <div className="flex min-h-screen w-full flex-col bg-background">
            <AppHeader onToggleSidebar={toggleSidebar} />
            <main className="flex-1 p-4 sm:p-6">
              {children}
            </main>
          </div>
          <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
    );
  }

  return (
      <div className="min-h-screen w-full">
        <div className={cn(
            "hidden md:block fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 ease-in-out",
            isSidebarCollapsed && "w-20"
        )}>
          <SidebarContent />
        </div>
        <div className={cn(
            "flex flex-col transition-all duration-300 ease-in-out",
            "md:pl-64",
            isSidebarCollapsed && "md:pl-20"
          )}>
          <AppHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
          <main className="flex-1 overflow-x-hidden bg-secondary/50 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
  );
}
