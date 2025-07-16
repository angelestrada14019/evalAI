
export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout simply passes children through. 
    // The FormBuilderProvider has been moved to the parent layout (`/src/app/[locale]/(main)/layout.tsx`)
    // to ensure its state is available across all main routes, including the "new evaluation" page.
    return <>{children}</>;
}
