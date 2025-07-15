import createMiddleware from 'next-intl/middleware';
import {locales, localePrefix} from './navigation';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  localePrefix,
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a locale page
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(es|en)/:path*',

    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};