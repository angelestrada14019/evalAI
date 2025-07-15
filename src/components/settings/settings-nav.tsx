'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { User, Users, Building, CreditCard } from 'lucide-react'

const navItems = [
  { href: '/settings', icon: User, title: 'Profile' },
  { href: '/settings/team', icon: Users, title: 'Team' },
  { href: '/settings/workspace', icon: Building, title: 'Workspace' },
  { href: '/settings/billing', icon: CreditCard, title: 'Billing' },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-secondary hover:bg-secondary'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
