
'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { User, Users, Building, CreditCard } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SettingsNav() {
  const pathname = usePathname()
  const t = useTranslations('SettingsNav');

  const navItems = [
    { href: '/settings', icon: User, title: t('profile') },
    { href: '/settings/team', icon: Users, title: t('team') },
    { href: '/settings/workspace', icon: Building, title: t('workspace') },
    { href: '/settings/billing', icon: CreditCard, title: t('billing') },
  ]

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname.endsWith(item.href)
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
