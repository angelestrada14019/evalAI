// This file is now a SERVER component. It fetches params and passes them to the client component.

import { FormBuilderContent } from '@/components/evaluations/builder/form-builder-content';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { backend } from '@/services/backend/backend';
import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';

async function BuilderBreadcrumb({ evaluationId }: { evaluationId: string }) {
    const tB = await getTranslations('Breadcrumbs');
    
    let title: string | React.ReactNode = <Skeleton className="h-5 w-32" />;

    if (evaluationId.startsWith('new_')) {
        title = tB('new');
    } else {
        const evaluation = await backend().getEvaluationById(evaluationId);
        if (evaluation) {
            title = evaluation.title;
        } else {
            title = '...';
        }
    }

    const breadcrumbItems = [
      { label: tB('home'), href: '/dashboard' },
      { label: tB('evaluations'), href: '/evaluations' },
      { label: title },
    ];
    
    return <Breadcrumb items={breadcrumbItems} />;
}


export default function FormBuilderPage({ params }: { params: { id: string } }) {
    // Here, we are in a Server Component. We can access params directly.
    // We then pass the 'id' as a simple string prop to our Client Component.
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-background border-b">
                 <BuilderBreadcrumb evaluationId={params.id} />
            </div>
            <div className="flex-1 overflow-hidden">
                <FormBuilderContent evaluationId={params.id} />
            </div>
        </div>
    );
}
