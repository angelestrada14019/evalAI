
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { backend } from '@/services/backend/backend';
import { EvaluationsClient } from '@/components/evaluations/evaluations-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { PackagePlus } from 'lucide-react';

// This is an async Server Component
async function EvaluationsContent() {
    const initialEvaluations = await backend().getEvaluations();
    // The client component receives data fetched on the server as props
    return <EvaluationsClient initialEvaluations={initialEvaluations} />;
}

// This is a synchronous Server Component that renders a loading state
async function EvaluationsSkeleton() {
    const t = await getTranslations('EvaluationsPage');
    return (
         <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6 gap-4">
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
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                     <div className="relative pt-2">
                        <Skeleton className="h-10 w-full md:w-1/3" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// The main page is a Server Component that uses Suspense to handle loading
export default function EvaluationsPage() {
  return (
    <Suspense fallback={<EvaluationsSkeleton />}>
      <EvaluationsContent />
    </Suspense>
  );
}
