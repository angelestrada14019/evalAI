
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { backend } from '@/services/backend/backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { PackagePlus } from 'lucide-react';
import { EvaluationsClient } from '@/components/evaluations/evaluations-client';
import type { Evaluation } from '@/services/backend/types';

function EvaluationsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <div className="border rounded-md">
                        <div className="h-12 w-full" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 w-full border-t" />
                        ))}
                    </div>
                     <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

async function EvaluationsContent() {
    const evaluations = await backend().getEvaluations();
    return <EvaluationsClient initialEvaluations={evaluations} />;
}


export default function EvaluationsPage({params: {locale}}: {params: {locale: string}}) {
    unstable_setRequestLocale(locale);
    const t = useTranslations('EvaluationsPage');

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/evaluations/new">
                        <PackagePlus className="mr-2 h-4 w-4" />
                        {t('newEvaluationButton')}
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<EvaluationsSkeleton />}>
                <EvaluationsContent />
            </Suspense>
        </div>
    );
}
