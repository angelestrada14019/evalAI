import { FileDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { backend } from '@/services/backend/backend';
import { ReportsClient } from '@/components/reports/reports-client';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { getCurrentTenantId } from '@/lib/server-tenant';

export default async function ReportsPage() {
    const t = await getTranslations('ReportsPage');
    const tB = await getTranslations('Breadcrumbs');
    const tenantId = await getCurrentTenantId();
    const reports = await backend().getReports(tenantId);

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
        <div className="flex gap-2">
          <Link href="/reports/templates">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> {t('reportTemplatesButton')}
            </Button>
          </Link>
          <Button>
            <FileDown className="mr-2 h-4 w-4" /> {t('generateReportButton')}
          </Button>
        </div>
      </div>
      <ReportsClient initialReports={reports} />
    </div>
  )
}
