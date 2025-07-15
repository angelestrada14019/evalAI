import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, DollarSign, Users, CreditCard, Activity, PackagePlus } from 'lucide-react'
import Link from 'next/link'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentEvaluations } from '@/components/dashboard/recent-evaluations'
import { backend } from '@/services/backend/backend'
import { DashboardStats } from '@/services/backend/types'

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

export default async function DashboardPage() {
  const stats: DashboardStats = await backend().getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/evaluations/new">
              <PackagePlus className="mr-2 h-4 w-4" />
              New Evaluation
            </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Evaluations" icon={Users} value={stats.totalEvaluations.value} change={stats.totalEvaluations.change} />
        <StatsCard title="Avg. Score" icon={Activity} value={stats.avgScore.value} change={stats.avgScore.change} />
        <StatsCard title="Active Forms" icon={CreditCard} value={stats.activeForms.value} change={stats.activeForms.change} />
        <StatsCard title="Response Rate" icon={DollarSign} value={stats.responseRate.value} change={stats.responseRate.change} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>
              You had 265 evaluations this month.
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
