
import { Link } from '@/navigation';
import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backend } from '@/services/backend/backend';
import { getTranslations } from 'next-intl/server';
import { EvaluationsClient } from '@/components/evaluations/evaluations-client';

// Note: This is now a Server Component that fetches fresh data on every load.
export default async function EvaluationsPage() {
  const evaluations = await backend().getEvaluations();
  const t = await getTranslations(); // We get the whole translation object

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold">{t('EvaluationsPage.title')}</h1>
            <p className="text-muted-foreground">{t('EvaluationsPage.description')}</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/evaluations/new">
                <PackagePlus className="mr-2 h-4 w-4" />
                {t('EvaluationsPage.newEvaluationButton')}
            </Link>
        </Button>
      </div>

      {/* We pass the server-fetched data to the client component */}
      <EvaluationsClient initialEvaluations={evaluations} />

    </div>
  );
}
