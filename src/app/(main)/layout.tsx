// This file is obsolete.
// The layout is now handled by /src/app/[locale]/(main)/layout.tsx
// It can be deleted, but we'll keep it empty for now to avoid breaking references.
export default function ObsoleteMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
