
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useEvaluationColumns } from '@/components/evaluations/columns';
import type { Evaluation } from '@/services/backend/types';

export function EvaluationsClient({ initialEvaluations }: { initialEvaluations: Evaluation[] }) {
    const t = useTranslations();
    const tEvals = useTranslations('EvaluationsPage');
    const columns = useEvaluationColumns({ t });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{tEvals('listTitle')}</CardTitle>
                <CardDescription>{tEvals('listDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={initialEvaluations} filterColumnId="title" />
            </CardContent>
        </Card>
    );
}
