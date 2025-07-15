
'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import {
  Bell,
  ChevronsUpDown,
  PanelLeft,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/services/auth/auth';
import type { User } from '@/services/auth/types';
import { Skeleton } from '../ui/skeleton';
import { AppLogo } from '../icons';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
}

export function AppHeader({ onToggleSidebar, isSidebarCollapsed }: AppHeaderProps) {
  const t = useTranslations('AppHeader');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: currentUser } = await auth().getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await auth().logout();
    router.push('/login');
  };
  
  const getFallback = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const WorkspaceSwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-52 justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://placehold.co/32x32.png" alt="Tenant logo" data-ai-hint="logo" />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <span className="font-semibold truncate">Acme Inc.</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 md:w-full">
        <DropdownMenuLabel>{t('workspaces')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Avatar className="mr-2 h-5 w-5">
            <AvatarImage src="https://placehold.co/32x32.png" alt="Tenant logo" data-ai-hint="logo" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          Acme Inc.
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Avatar className="mr-2 h-5 w-5">
            <AvatarImage src="https://placehold.co/32x32.png" alt="Tenant logo" data-ai-hint="logo" />
            <AvatarFallback>MO</AvatarFallback>
          </Avatar>
          Monolith Corp.
        </DropdownMenuItem>
        <DropdownMenuItem>{t('createWorkspace')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
       <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          {!isSidebarCollapsed && !isMobile && <WorkspaceSwitcher />}
        </div>
      
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {isMobile && <WorkspaceSwitcher />}
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                {isLoading ? (
                    <Skeleton className="h-9 w-9 rounded-full" />
                ) : (
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name || ''} data-ai-hint="person" />
                    <AvatarFallback>{getFallback(user?.name)}</AvatarFallback>
                    </Avatar>
                )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name || t('myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/settings">{t('settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>{t('support')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                {t('logout')}
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
