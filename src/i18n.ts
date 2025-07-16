
import {getLocale, getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './navigation';
 
export default async function i18n() {
  const locale = await getLocale();
 
  if (!locales.includes(locale as any)) notFound();
 
  const messages = await getMessages({locale});
 
  return {
    locale,
    messages
  };
}
