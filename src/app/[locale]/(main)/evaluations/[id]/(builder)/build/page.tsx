// This file is now a SERVER component. It fetches params and passes them to the client component.

import { FormBuilderContent } from '@/components/evaluations/builder/form-builder-content';

export default function FormBuilderPage({ params: { id } }: { params: { id: string } }) {
    // Here, we are in a Server Component. We can access params directly.
    // We then pass the 'id' as a simple string prop to our Client Component.
    return (
        <FormBuilderContent evaluationId={id} />
    );
}
