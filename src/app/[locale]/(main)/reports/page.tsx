import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backend } from '@/services/backend/backend';
import { ReportsClient } from '@/components/reports/reports-client';
import {getTranslations} from 'next-intl/server';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default async function ReportsPage() {
    const t = await getTranslations('ReportsPage');
    const tB = await getTranslations('Breadcrumbs');
    const reports = await backend().getReports();

    const breadcrumbItems = [
      { label: tB('home'), href: '/dashboard' },
      { label: tB('reports') },
    ];

  return (
    <div className="flex flex-col gap-6">
       <Breadcrumb items={breadcrumbItems} />
      <div className="flex items-center justify-between">
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
