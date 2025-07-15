'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, BarChart2, Settings, LifeBuoy, PackagePlus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/evaluations', icon: FileText, label: 'Evaluations' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
]

const bottomNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isNavItemActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <AppLogo className="h-7 w-7 text-primary" />
          <span>EvalAI</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-y-4 py-4">
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary',
                isNavItemActive(item.href) && 'bg-secondary text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="px-4">
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/evaluations/new">
              <PackagePlus className="mr-2 h-4 w-4" />
              New Evaluation
            </Link>
          </Button>
        </div>

        <div className="mt-auto flex flex-col gap-y-1 px-4">
          {bottomNavItems.map((item) => (
             <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary',
                isNavItemActive(item.href) && 'bg-secondary text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
