
import {unstable_setRequestLocale} from 'next-intl/server';

// Since the root layout `src/app/layout.tsx` is now handling
// i18n and the main html structure, this file is only needed
// to pass children through for the locale segment.
export default function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  unstable_setRequestLocale(locale);
  return <>{children}</>;
}
