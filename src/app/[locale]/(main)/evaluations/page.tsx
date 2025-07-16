import { Link } from '@/navigation';
import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backend } from '@/services/backend/backend';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useEvaluationColumns } from '@/components/evaluations/columns';

// Note: This is now a Server Component that fetches fresh data on every load.
export default async function EvaluationsPage() {
  const evaluations = await backend().getEvaluations();
  const t = await getTranslations('EvaluationsPage');
  
  // The columns hook can be used in a Server Component if it doesn't have client-side logic.
  // Let's adjust useEvaluationColumns to ensure it's compatible.
  const tDataTable = await getTranslations('DataTable');
  const columns = useEvaluationColumns({ t, tDataTable });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-6">
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
              <CardTitle>{t('listTitle')}</CardTitle>
              <CardDescription>{t('listDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
              <DataTable columns={columns} data={evaluations} filterColumnId="title" />
          </CardContent>
      </Card>
    </div>
  );
}
