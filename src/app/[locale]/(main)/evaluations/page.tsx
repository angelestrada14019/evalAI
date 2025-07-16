import { Link } from '@/navigation';
import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backend } from '@/services/backend/backend';
import { EvaluationsClient } from '@/components/evaluations/evaluations-client';
import { getTranslations } from 'next-intl/server';


export default async function EvaluationsPage() {
  const evaluations = await backend().getEvaluations();
  const t = await getTranslations('EvaluationsPage');

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

      <EvaluationsClient initialEvaluations={evaluations} />
    </div>
  );
}
