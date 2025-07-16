
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, DollarSign, Users, CreditCard, Activity, PackagePlus } from 'lucide-react'
import Link from 'next/link'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentEvaluations } from '@/components/dashboard/recent-evaluations'
import { backend } from '@/services/backend/backend'
import { DashboardStats } from '@/services/backend/types'
import { useTranslations } from 'next-intl'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'

async function StatsCard({ title, icon: Icon, value, change }: { title: string, icon: React.ElementType, value: string | number, change: string }) {
  return (
     <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{change}</p>
        </CardContent>
      </Card>
  )
}

export default async function DashboardPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const stats: DashboardStats = await backend().getDashboardStats();
  const t = await getTranslations('DashboardPage');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">{t('title')}</h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/evaluations/new">
              <PackagePlus className="mr-2 h-4 w-4" />
              {t('newEvaluationButton')}
            </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title={t('totalEvaluations')} icon={Users} value={stats.totalEvaluations.value} change={stats.totalEvaluations.change} />
        <StatsCard title={t('avgScore')} icon={Activity} value={stats.avgScore.value} change={stats.avgScore.change} />
        <StatsCard title={t('activeForms')} icon={CreditCard} value={stats.activeForms.value} change={stats.activeForms.change} />
        <StatsCard title={t('responseRate')} icon={DollarSign} value={stats.responseRate.value} change={stats.responseRate.change} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('overview')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('recentEvaluations')}</CardTitle>
            <CardDescription>
              {t('recentEvaluationsDescription', { count: 265 })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEvaluations />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
