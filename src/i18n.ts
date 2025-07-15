
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'es'].includes(locale as any)) {
      // For this example, we'll default to 'en' if an invalid locale is provided.
      // You might want to handle this differently in a production environment.
      locale = 'en';
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
