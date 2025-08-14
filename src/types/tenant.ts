/**
 * @fileOverview Core multi-tenant types and interfaces
 * These types are designed to be compatible with Supabase RLS and GraphQL
 */
import { z } from 'zod';

// Base entity that all tenant-scoped entities should extend
export const BaseTenantEntitySchema = z.object({
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BaseTenantEntity = z.infer<typeof BaseTenantEntitySchema>;

// Tenant branding configuration
export const TenantBrandingSchema = z.object({
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i), // Hex color
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  fontFamily: z.string().default('Inter'),
  customCSS: z.string().optional(),
});
export type TenantBranding = z.infer<typeof TenantBrandingSchema>;

// Tenant settings
export const TenantSettingsSchema = z.object({
  allowPublicForms: z.boolean().default(true),
  maxEvaluationsPerMonth: z.number().optional(),
  maxResponsesPerEvaluation: z.number().optional(),
  emailSendingEnabled: z.boolean().default(true),
  customDomainEnabled: z.boolean().default(false),
  apiAccessEnabled: z.boolean().default(false),
  webhooksEnabled: z.boolean().default(false),
});
export type TenantSettings = z.infer<typeof TenantSettingsSchema>;

// Main tenant entity
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  customDomain: z.string().optional(),
  branding: TenantBrandingSchema,
  settings: TenantSettingsSchema,
  status: z.enum(['active', 'suspended', 'trial']).default('trial'),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Tenant = z.infer<typeof TenantSchema>;

// Default branding for new tenants
export const DEFAULT_TENANT_BRANDING: TenantBranding = {
  primaryColor: '#3399FF',
  secondaryColor: '#F0F8FF', 
  accentColor: '#FF66B2',
  fontFamily: 'Inter',
};

// Default settings for new tenants
export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  allowPublicForms: true,
  emailSendingEnabled: true,
  customDomainEnabled: false,
  apiAccessEnabled: false,
  webhooksEnabled: false,
};
