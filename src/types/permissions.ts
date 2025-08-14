/**
 * @fileOverview Permission and role system types
 * Implements the hierarchy: FUNCTIONALITY → PERMISSION → ROLE → USER
 */
import { z } from 'zod';

// All available permissions in the system
export const PERMISSIONS = {
  // Evaluations
  EVALUATIONS_CREATE: 'evaluations.create',
  EVALUATIONS_EDIT: 'evaluations.edit',
  EVALUATIONS_DELETE: 'evaluations.delete',
  EVALUATIONS_VIEW: 'evaluations.view',
  EVALUATIONS_PUBLISH: 'evaluations.publish',
  
  // Reports
  REPORTS_CREATE: 'reports.create',
  REPORTS_EDIT: 'reports.edit',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_SCHEDULE: 'reports.schedule',
  
  // Templates
  TEMPLATES_CREATE: 'templates.create',
  TEMPLATES_EDIT: 'templates.edit',
  TEMPLATES_DELETE: 'templates.delete',
  TEMPLATES_SHARE: 'templates.share',
  
  // Contacts
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_EDIT: 'contacts.edit',
  CONTACTS_IMPORT: 'contacts.import',
  CONTACTS_EXPORT: 'contacts.export',
  CONTACTS_DELETE: 'contacts.delete',
  
  // Users
  USERS_INVITE: 'users.invite',
  USERS_MANAGE: 'users.manage',
  USERS_REMOVE: 'users.remove',
  USERS_ROLES: 'users.roles',
  
  // Tenant
  TENANT_SETTINGS: 'tenant.settings',
  TENANT_BRANDING: 'tenant.branding',
  TENANT_BILLING: 'tenant.billing',
  TENANT_ANALYTICS: 'tenant.analytics',
  
  // Formulas
  FORMULAS_CREATE: 'formulas.create',
  FORMULAS_EDIT: 'formulas.edit',
  FORMULAS_DELETE: 'formulas.delete',
  FORMULAS_ADVANCED: 'formulas.advanced',
  
  // Publishing
  PUBLISH_PUBLIC: 'publish.public',
  PUBLISH_GROUPS: 'publish.groups',
  PUBLISH_EMAIL: 'publish.email',
  PUBLISH_EMBED: 'publish.embed',
  
  // Integrations
  INTEGRATIONS_WEBHOOKS: 'integrations.webhooks',
  INTEGRATIONS_API: 'integrations.api',
  INTEGRATIONS_EXPORT: 'integrations.export',
} as const;

// Type for all permission values
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Permission schema
export const PermissionSchema = z.enum([
  'evaluations.create', 'evaluations.edit', 'evaluations.delete', 'evaluations.view', 'evaluations.publish',
  'reports.create', 'reports.edit', 'reports.view', 'reports.export', 'reports.schedule',
  'templates.create', 'templates.edit', 'templates.delete', 'templates.share',
  'contacts.create', 'contacts.edit', 'contacts.import', 'contacts.export', 'contacts.delete',
  'users.invite', 'users.manage', 'users.remove', 'users.roles',
  'tenant.settings', 'tenant.branding', 'tenant.billing', 'tenant.analytics',
  'formulas.create', 'formulas.edit', 'formulas.delete', 'formulas.advanced',
  'publish.public', 'publish.groups', 'publish.email', 'publish.embed',
  'integrations.webhooks', 'integrations.api', 'integrations.export',
]);

// Role definition
export const RoleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  permissions: z.array(PermissionSchema),
  isSystem: z.boolean().default(false), // System roles cannot be deleted
  isCustom: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Role = z.infer<typeof RoleSchema>;

// User role assignment
export const UserRoleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  tenantId: z.string().uuid(),
  assignedAt: z.date(),
  assignedBy: z.string().uuid(),
  expiresAt: z.date().optional(), // For temporary roles
});
export type UserRole = z.infer<typeof UserRoleSchema>;

// Predefined system roles with their permissions
export const SYSTEM_ROLES = {
  GLOBAL_ADMIN: {
    name: 'Global Admin',
    description: 'Full access to all system features across all tenants',
    permissions: Object.values(PERMISSIONS),
  },
  TENANT_ADMIN: {
    name: 'Tenant Admin',
    description: 'Full access to all features within the tenant',
    permissions: [
      PERMISSIONS.EVALUATIONS_CREATE, PERMISSIONS.EVALUATIONS_EDIT, PERMISSIONS.EVALUATIONS_DELETE, 
      PERMISSIONS.EVALUATIONS_VIEW, PERMISSIONS.EVALUATIONS_PUBLISH,
      PERMISSIONS.REPORTS_CREATE, PERMISSIONS.REPORTS_EDIT, PERMISSIONS.REPORTS_VIEW, 
      PERMISSIONS.REPORTS_EXPORT, PERMISSIONS.REPORTS_SCHEDULE,
      PERMISSIONS.TEMPLATES_CREATE, PERMISSIONS.TEMPLATES_EDIT, PERMISSIONS.TEMPLATES_DELETE, 
      PERMISSIONS.TEMPLATES_SHARE,
      PERMISSIONS.CONTACTS_CREATE, PERMISSIONS.CONTACTS_EDIT, PERMISSIONS.CONTACTS_IMPORT, 
      PERMISSIONS.CONTACTS_EXPORT, PERMISSIONS.CONTACTS_DELETE,
      PERMISSIONS.USERS_INVITE, PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_REMOVE, PERMISSIONS.USERS_ROLES,
      PERMISSIONS.TENANT_SETTINGS, PERMISSIONS.TENANT_BRANDING, PERMISSIONS.TENANT_ANALYTICS,
      PERMISSIONS.FORMULAS_CREATE, PERMISSIONS.FORMULAS_EDIT, PERMISSIONS.FORMULAS_DELETE, 
      PERMISSIONS.FORMULAS_ADVANCED,
      PERMISSIONS.PUBLISH_PUBLIC, PERMISSIONS.PUBLISH_GROUPS, PERMISSIONS.PUBLISH_EMAIL, 
      PERMISSIONS.PUBLISH_EMBED,
      PERMISSIONS.INTEGRATIONS_WEBHOOKS, PERMISSIONS.INTEGRATIONS_API, PERMISSIONS.INTEGRATIONS_EXPORT,
    ],
  },
  EDITOR: {
    name: 'Editor',
    description: 'Can create and edit evaluations, reports, and templates',
    permissions: [
      PERMISSIONS.EVALUATIONS_CREATE, PERMISSIONS.EVALUATIONS_EDIT, PERMISSIONS.EVALUATIONS_VIEW, 
      PERMISSIONS.EVALUATIONS_PUBLISH,
      PERMISSIONS.REPORTS_CREATE, PERMISSIONS.REPORTS_EDIT, PERMISSIONS.REPORTS_VIEW, 
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.TEMPLATES_CREATE, PERMISSIONS.TEMPLATES_EDIT, PERMISSIONS.TEMPLATES_SHARE,
      PERMISSIONS.CONTACTS_CREATE, PERMISSIONS.CONTACTS_EDIT, PERMISSIONS.CONTACTS_IMPORT,
      PERMISSIONS.FORMULAS_CREATE, PERMISSIONS.FORMULAS_EDIT,
      PERMISSIONS.PUBLISH_PUBLIC, PERMISSIONS.PUBLISH_GROUPS, PERMISSIONS.PUBLISH_EMAIL,
    ],
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Can view evaluations and reports but cannot edit',
    permissions: [
      PERMISSIONS.EVALUATIONS_VIEW,
      PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.CONTACTS_EXPORT,
    ],
  },
  PARTICIPANT: {
    name: 'Participant',
    description: 'Can only respond to evaluations',
    permissions: [
      // Participants typically don't need explicit permissions as they access via public links
    ],
  },
} as const;

// Helper type for checking permissions
export interface PermissionCheck {
  hasPermission(permission: Permission): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  hasAllPermissions(permissions: Permission[]): boolean;
}

// User with roles and computed permissions
export interface UserWithPermissions {
  id: string;
  tenantId: string;
  roles: Role[];
  permissions: Permission[];
  permissionCheck: PermissionCheck;
}
