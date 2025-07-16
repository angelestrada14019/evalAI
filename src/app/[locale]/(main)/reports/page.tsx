import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backend } from '@/services/backend/backend';
import { ReportsClient } from '@/components/reports/reports-client';
import {getTranslations} from 'next-intl/server';

const reports = [
  { id: 'REP-001', title: 'Q1 2024 Engineering Performance', date: '2024-04-05', type: 'Aggregate' as const, status: 'Completed' as const },
  { id: 'REP-002', title: 'John Doe - Performance Review', date: '2024-04-03', type: 'Individual' as const, status: 'Completed' as const },
  { id: 'REP-003', title: 'Sales Team Skills Assessment', date: '2024-03-28', type: 'Aggregate' as const, status: 'Completed' as const },
  { id: 'REP-004', title: 'UX/UI Design Competency Report', date: '2024-03-15', type: 'Aggregate' as const, status: 'Completed' as const },
  { id: 'REP-005', title: 'Jane Smith - Onboarding Evaluation', date: '2024-03-12', type: 'Individual' as const, status: 'Completed' as const },
]

export default async function ReportsPage() {
    const t = await getTranslations('ReportsPage');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button>
          <FileDown className="mr-2 h-4 w-4" /> {t('generateReportButton')}
        </Button>
      </div>
      <ReportsClient initialReports={reports} />
    </div>
  )
}
