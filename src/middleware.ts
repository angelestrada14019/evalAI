
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getTenantIdFromHost } from './lib/server-tenant';

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Get tenant ID from hostname
  const hostname = request.headers.get('host') || 'localhost';
  const tenantId = getTenantIdFromHost(hostname);
  
  // Run the intl middleware first
  const response = intlMiddleware(request);
  
  // Add tenant ID to headers for Server Components
  if (response instanceof NextResponse) {
    response.headers.set('x-tenant-id', tenantId);
  } else {
    // If intlMiddleware returns a Response, create a new NextResponse
    const newResponse = NextResponse.next();
    newResponse.headers.set('x-tenant-id', tenantId);
    return newResponse;
  }
  
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
