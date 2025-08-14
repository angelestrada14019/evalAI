'use client'

import { Link, usePathname } from '@/i18n/navigation';
import { Home, FileText, BarChart2, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslations } from 'next-intl'

interface AppSidebarProps {
  isCollapsed: boolean;
  closeSidebar?: () => void;
}

export function AppSidebar({ isCollapsed, closeSidebar }: AppSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const t = useTranslations('Sidebar');

  const handleLinkClick = () => {
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('dashboard') },
    { href: '/evaluations', icon: FileText, label: t('evaluations') },
    { href: '/contacts', icon: Users, label: t('contacts') },
    { href: '/reports', icon: BarChart2, label: t('reports') },
  ];

  const bottomNavItems = [
    { href: '/settings', icon: Settings, label: t('settings') },
  ];

  const isNavItemActive = (href: string) => {
    // Exact match for dashboard, startsWith for others to catch sub-pages
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  };

  const SidebarLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = isNavItemActive(item.href);
    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary hover:bg-secondary',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={handleLinkClick}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary',
          isActive && 'bg-primary/10 text-primary font-semibold'
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="flex h-full flex-col border-r bg-card">
      <div className={cn("flex h-16 shrink-0 items-center border-b px-4 lg:px-6", isCollapsed ? "justify-center" : "justify-start")}>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold" onClick={handleLinkClick}>
          <AppLogo className="h-7 w-7 text-primary" />
          <span className={cn(isCollapsed && "sr-only")}>EvalAI</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className={cn("flex flex-col gap-1 px-2 lg:px-4", isCollapsed && "items-center")}>
          {navItems.map((item) => <SidebarLink key={item.href} item={item} />)}
        </nav>
      </div>
      
      <div className="mt-auto shrink-0 border-t">
        <nav className={cn("flex flex-col gap-1 p-2 lg:p-4", isCollapsed && "items-center")}>
            {bottomNavItems.map((item) => <SidebarLink key={item.href} item={item} />)}
        </nav>
      </div>
    </aside>
  );
}
