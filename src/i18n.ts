
import {getRequestConfig, unstable_setRequestLocale} from 'next-intl/server';
import {locales} from './navigation';
import {notFound} from 'next/navigation';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  // Enable static rendering
  unstable_setRequestLocale(locale);
 
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
