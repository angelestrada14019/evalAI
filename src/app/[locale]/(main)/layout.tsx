
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

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

  const SidebarContent = () => (
    <AppSidebar 
      isCollapsed={isSidebarCollapsed} 
      closeSidebar={() => setIsSidebarOpen(false)} 
    />
  );

  if (isMobile) {
    return (
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <div className="flex min-h-screen w-full flex-col">
          <AppHeader onToggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </div>
      </Sheet>
    );
  }

  return (
    <div className={`flex min-h-screen w-full ${isSidebarCollapsed ? 'md:grid-cols-[80px_1fr]' : 'md:grid-cols-[256px_1fr]'} transition-all duration-300`}>
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
        <SidebarContent />
      </div>
      <div className="flex flex-1 flex-col">
        <AppHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
