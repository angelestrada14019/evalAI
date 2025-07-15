'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronsUpDown,
  Home,
  LineChart,
  Package,
  Search,
  Settings,
  Users,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { auth } from '@/services/auth/auth';
import type { User } from '@/services/auth/types';
import { Skeleton } from '../ui/skeleton';

export function AppHeader() {
  const t = useTranslations('AppHeader');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-52 justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://placehold.co/32x32.png" alt="Tenant logo" data-ai-hint="logo" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <span className="font-semibold">Acme Inc.</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
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
            <DropdownMenuItem>Create Workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="w-full appearance-none bg-background pl-8 md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
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
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} data-ai-hint="person" />
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
    </header>
  )
}
