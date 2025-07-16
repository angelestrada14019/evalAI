
// Since the root layout `src/app/layout.tsx` is now handling
// i18n and the main html structure, this file is redundant.
// We pass children through to avoid breaking the route structure.
export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
