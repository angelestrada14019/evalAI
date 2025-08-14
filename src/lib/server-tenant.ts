import { headers } from 'next/headers';

/**
 * Get the current tenant ID in Server Components
 * This function reads the tenant ID from headers set by middleware
 */
export async function getCurrentTenantId(): Promise<string> {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');
  
  // Fallback to default tenant for development
  return tenantId || '550e8400-e29b-41d4-a716-446655440000';
}

/**
 * Get tenant ID from hostname (for middleware)
 */
export function getTenantIdFromHost(hostname: string): string {
  // For now, always return the default tenant UUID until multi-tenancy is fully implemented
  // This matches the tenant you have in your database
  return '550e8400-e29b-41d4-a716-446655440000';
  
  // TODO: Implement proper tenant resolution when multi-tenancy is needed
  // For development
  // if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('localhost:')) {
  //   return '550e8400-e29b-41d4-a716-446655440000';
  // }
  
  // For production - you would lookup the tenant by subdomain/domain
  // const subdomain = hostname.split('.')[0];
  // return lookupTenantBySubdomain(subdomain);
}
