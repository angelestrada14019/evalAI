
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useReportColumns } from '@/components/reports/columns';
import type { Report } from '@/services/backend/types';

export function ReportsClient({ initialReports }: { initialReports: Report[] }) {
    const t = useTranslations('ReportsPage');
    const columns = useReportColumns();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('tableTitle')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={initialReports} filterColumnId="title" />
            </CardContent>
        </Card>
    );
}
