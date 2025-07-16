
import { FormBuilderProvider } from '@/context/form-builder-context';

export default function BuilderLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string, id: string };
}) {
    // This layout provides the FormBuilder context and passes params down safely
    // It's a server component by default
    return (
        <FormBuilderProvider>
            {children}
        </FormBuilderProvider>
    );
}
