
'use client';

import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { useReportColumns, type Report } from '@/components/reports/columns'

const reports: Report[] = [
  { id: 'REP-001', title: 'Q1 2024 Engineering Performance', date: '2024-04-05', type: 'Aggregate', status: 'Completed' },
  { id: 'REP-002', title: 'John Doe - Performance Review', date: '2024-04-03', type: 'Individual', status: 'Completed' },
  { id: 'REP-003', title: 'Sales Team Skills Assessment', date: '2024-03-28', type: 'Aggregate', status: 'Completed' },
  { id: 'REP-004', title: 'UX/UI Design Competency Report', date: '2024-03-15', type: 'Aggregate', status: 'Completed' },
  { id: 'REP-005', title: 'Jane Smith - Onboarding Evaluation', date: '2024-03-12', type: 'Individual', status: 'Completed' },
]

export default function ReportsPage() {
  const t = useTranslations('ReportsPage');
  const columns = useReportColumns();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button>
          <FileDown className="mr-2 h-4 w-4" /> {t('generateReportButton')}
        </Button>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={reports} filterColumnId='title' />
        </CardContent>
      </Card>
    </div>
  )
}
