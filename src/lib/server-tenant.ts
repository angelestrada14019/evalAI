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
  // For development
  if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('localhost:')) {
    // For localhost, we'll use a default tenant for testing
    return 'localhost-tenant';
  }
  
  // For production - extract subdomain
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0]; // subdomain becomes tenant ID
  }
  
  // Fallback to default
  return 'default-tenant';
}
