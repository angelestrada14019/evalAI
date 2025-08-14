
/**
 * @fileOverview This file defines the abstract interface for the Backend service.
 * It uses the system configuration to dynamically load and export the
 * implementation specified in `systemConfig.backend.provider`.
 */
import { systemConfig } from '@/config/system';
import type { 
  DashboardStats, Evaluation, FormTemplate, ChartData, RecentEvaluation, Report,
  Contact, ContactGroup, FormVariable, CustomFormula, FormulaResult,
  EvaluationResponse, ReportTemplate, PublicationSettings, TenantUser
} from './types';
import type { Tenant } from '@/types/tenant';
import type { Permission, Role, UserRole } from '@/types/permissions';

export interface BackendService {
  // Existing methods (now with tenant context)
  getDashboardStats(tenantId: string): Promise<DashboardStats>;
  getChartData(tenantId: string): Promise<ChartData[]>;
  getRecentEvaluations(tenantId: string): Promise<RecentEvaluation[]>;
  getEvaluations(tenantId: string): Promise<Evaluation[]>;
  getEvaluationById(id: string): Promise<FormTemplate | null>;
  saveEvaluation(tenantId: string, template: FormTemplate): Promise<FormTemplate>;
  getReports(tenantId: string): Promise<Report[]>;

  // Tenant management
  getTenant(tenantId: string): Promise<Tenant | null>;
  updateTenant(tenant: Partial<Tenant> & { id: string }): Promise<Tenant>;

  // Contact and Group management
  getContactGroups(tenantId: string): Promise<ContactGroup[]>;
  getContactGroup(tenantId: string, groupId: string): Promise<ContactGroup | null>;
  createContactGroup(tenantId: string, group: Omit<ContactGroup, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ContactGroup>;
  updateContactGroup(tenantId: string, groupId: string, updates: Partial<ContactGroup>): Promise<ContactGroup>;
  deleteContactGroup(tenantId: string, groupId: string): Promise<void>;
  
  getContacts(tenantId: string, groupId?: string): Promise<Contact[]>;
  createContact(tenantId: string, contact: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Contact>;
  updateContact(tenantId: string, contactId: string, updates: Partial<Contact>): Promise<Contact>;
  deleteContact(tenantId: string, contactId: string): Promise<void>;
  importContacts(tenantId: string, contacts: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[]): Promise<Contact[]>;

  // Report Templates
  getReportTemplates(tenantId: string, evaluationId?: string): Promise<ReportTemplate[]>;
  getReportTemplate(tenantId: string, templateId: string): Promise<ReportTemplate | null>;
  createReportTemplate(tenantId: string, template: Omit<ReportTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate>;
  updateReportTemplate(tenantId: string, templateId: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate>;
  deleteReportTemplate(tenantId: string, templateId: string): Promise<void>;

  // Formula and Variable management
  getFormVariables(tenantId: string, evaluationId: string): Promise<FormVariable[]>;
  getCustomFormulas(tenantId: string, evaluationId?: string): Promise<CustomFormula[]>;
  saveCustomFormula(tenantId: string, formula: Omit<CustomFormula, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<CustomFormula>;
  deleteCustomFormula(tenantId: string, formulaId: string): Promise<void>;
  evaluateFormula(formula: string, variables: Record<string, any>): Promise<FormulaResult>;

  // Evaluation Responses
  submitEvaluationResponse(response: Omit<EvaluationResponse, 'id' | 'calculatedScores' | 'completedAt'>): Promise<EvaluationResponse>;
  getEvaluationResponses(tenantId: string, evaluationId: string): Promise<EvaluationResponse[]>;
  getEvaluationResponse(tenantId: string, responseId: string): Promise<EvaluationResponse | null>;

  // Publication and Distribution
  publishEvaluation(tenantId: string, evaluationId: string, settings: PublicationSettings): Promise<{ publicLink?: string; success: boolean }>;
  getPublicEvaluation(slug: string): Promise<FormTemplate | null>;
  distributeEvaluation(tenantId: string, evaluationId: string, distribution: {
    recipientType: 'contacts' | 'groups' | 'all';
    contactIds?: string[];
    groupIds?: string[];
    subject: string;
    message: string;
    includeLink: boolean;
  }): Promise<{ sentCount: number; success: boolean }>;
  scheduleEvaluation(tenantId: string, evaluationId: string, schedule: {
    recipientType: 'contacts' | 'groups' | 'all';
    contactIds?: string[];
    groupIds?: string[];
    subject: string;
    message: string;
    scheduledAt: Date;
    includeLink: boolean;
  }): Promise<{ scheduledId: string; success: boolean }>;

  // User and Role management
  getTenantUsers(tenantId: string): Promise<TenantUser[]>;
  getTenantUser(tenantId: string, userId: string): Promise<TenantUser | null>;
  inviteUser(tenantId: string, email: string, roleIds: string[]): Promise<TenantUser>;
  updateUserRoles(tenantId: string, userId: string, roleIds: string[]): Promise<TenantUser>;
  removeUser(tenantId: string, userId: string): Promise<void>;

  // Role and Permission management
  getRoles(tenantId: string): Promise<Role[]>;
  getRole(tenantId: string, roleId: string): Promise<Role | null>;
  createRole(tenantId: string, role: Omit<Role, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Role>;
  updateRole(tenantId: string, roleId: string, updates: Partial<Role>): Promise<Role>;
  deleteRole(tenantId: string, roleId: string): Promise<void>;
  getUserPermissions(tenantId: string, userId: string): Promise<Permission[]>;
  checkPermission(tenantId: string, userId: string, permission: Permission): Promise<boolean>;
}

/**
 * Dynamically loads and returns the configured backend service implementation.
 * @returns {BackendService} The backend service instance.
 */
export function backend(): BackendService {
  const provider = systemConfig.backend.provider;

  switch (provider) {
    case 'mock':
      const mockImpl = require('./impl.mock');
      return mockImpl;
    case 'supabase':
      const supabaseBackendService = require('./impl.supabase');
      return supabaseBackendService;
    case 'rest':
      const restBackendService = require('./impl.rest');
      return restBackendService;
    default:
      throw new Error(`Unknown backend provider: ${provider}`);
  }
}
