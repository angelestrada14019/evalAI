
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useEvaluationColumns } from '@/components/evaluations/columns';
import { EvaluationDistribution } from '@/components/evaluations/distribution/evaluation-distribution';
import type { Evaluation } from '@/services/backend/types';

export function EvaluationsClient({ initialEvaluations }: { initialEvaluations: Evaluation[] }) {
    const t = useTranslations();
    const tEvals = useTranslations('EvaluationsPage');
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [isDistributionOpen, setIsDistributionOpen] = useState(false);

    const handleDistribute = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setIsDistributionOpen(true);
    };

    const columns = useEvaluationColumns({ 
        t, 
        onDistribute: handleDistribute 
    });

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{tEvals('listTitle')}</CardTitle>
                    <CardDescription>{tEvals('listDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={initialEvaluations} filterColumnId="title" />
                </CardContent>
            </Card>

            {selectedEvaluation && (
                <EvaluationDistribution
                    evaluation={selectedEvaluation}
                    isOpen={isDistributionOpen}
                    onClose={() => {
                        setIsDistributionOpen(false);
                        setSelectedEvaluation(null);
                    }}
                />
            )}
        </>
    );
}
