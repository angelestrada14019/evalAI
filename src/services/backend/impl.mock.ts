'use server';
/**
 * @fileOverview Mock implementation of the BackendService using centralized data loader.
 * Provides multi-tenant support with JSON-based mock data.
 */
import type { 
  DashboardStats, Evaluation, FormTemplate, ChartData, RecentEvaluation, Report,
  Contact, ContactGroup, FormVariable, CustomFormula, FormulaResult,
  EvaluationResponse, ReportTemplate, PublicationSettings, TenantUser
} from './types';
import type { Tenant } from '@/types/tenant';
import type { Permission, Role } from '@/types/permissions';
import { v4 as uuidv4 } from 'uuid';

// Import data loader functions
import * as DataLoader from './mock/data-loader';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// DASHBOARD AND OVERVIEW
// ============================================================================

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  console.log(`[Backend Mock] Fetching dashboard stats for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay();
  
  const evaluations = DataLoader.getEvaluations(tenantId);
  
  return {
    totalEvaluations: { value: evaluations.length, change: "+20.1% from last month" },
    avgScore: { value: 82.4, change: "+2.1 from last month" },
    activeForms: { value: evaluations.filter(e => e.status === 'Active').length, change: "+2 since last week" },
    responseRate: { value: "94%", change: "-1.2% from last month" },
  };
}

export async function getChartData(tenantId: string): Promise<ChartData[]> {
  console.log(`[Backend Mock] Fetching chart data for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return [
    { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  ];
}

export async function getRecentEvaluations(tenantId: string): Promise<RecentEvaluation[]> {
  console.log(`[Backend Mock] Fetching recent evaluations for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return [
    { name: 'Olivia Martin', email: 'olivia.martin@email.com', score: 89.9, fallback: 'OM' },
    { name: 'Jackson Lee', email: 'jackson.lee@email.com', score: 92.5, fallback: 'JL' },
    { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', score: 78.3, fallback: 'IN' },
  ];
}

// ============================================================================
// TENANT MANAGEMENT
// ============================================================================

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  console.log(`[Backend Mock] Fetching tenant: ${tenantId}`);
  await delay(200);
  
  return DataLoader.getTenant(tenantId) || null;
}

export async function updateTenant(tenant: Partial<Tenant> & { id: string }): Promise<Tenant> {
  console.log(`[Backend Mock] Updating tenant: ${tenant.id}`);
  await delay(300);
  
  const existing = DataLoader.getTenant(tenant.id);
  if (!existing) {
    throw new Error(`Tenant not found: ${tenant.id}`);
  }
  
  DataLoader.updateTenant(tenant.id, { ...tenant, updatedAt: new Date() });
  return DataLoader.getTenant(tenant.id)!;
}

// ============================================================================
// EVALUATIONS
// ============================================================================

export async function getEvaluations(tenantId: string): Promise<Evaluation[]> {
  console.log(`[Backend Mock] Fetching evaluations for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(500);
  
  return DataLoader.getEvaluations(tenantId);
}

export async function getEvaluationById(id: string): Promise<FormTemplate | null> {
  console.log(`[Backend Mock] Fetching evaluation by ID: ${id}`);
  await delay(300);
  
  // Find evaluation across all tenants
  const tenants = DataLoader.getTenants();
  for (const tenantId in tenants) {
    const evaluation = DataLoader.getEvaluation(tenantId, id);
    if (evaluation) {
      return {
        id: evaluation.id,
        title: evaluation.title,
        description: evaluation.description || '',
        items: [
          { id: uuidv4(), variableId: 'nombre', type: 'Text Input', label: 'Nombre', required: true, readOnly: true },
          { id: uuidv4(), variableId: 'apellido', type: 'Text Input', label: 'Apellido', required: true, readOnly: true },
          { id: uuidv4(), variableId: 'email', type: 'Text Input', label: 'Correo Electrónico', required: true, readOnly: true },
          { id: uuidv4(), type: 'Rating Scale', label: 'Overall Performance', variableId: 'overall_performance', required: true, ratingConfig: { max: 5 } },
        ]
      };
    }
  }
  
  return null;
}

export async function saveEvaluation(tenantId: string, template: FormTemplate): Promise<FormTemplate> {
  console.log(`[Backend Mock] Saving evaluation: ${template.title} for tenant: ${tenantId}`);
  await delay(500);
  
  DataLoader.validateTenantAccess(tenantId);
  const isNew = !template.id || template.id.startsWith('new_');
  
  if (isNew) {
    const newId = `evaluation_${Date.now()}`;
    const newEvaluation: Evaluation = {
      id: newId,
      tenantId,
      title: template.title,
      description: template.description,
      status: 'Draft',
      responses: 0,
      lastModified: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    DataLoader.addEvaluation(tenantId, newEvaluation);
    return { ...template, id: newId };
  } else {
    DataLoader.updateEvaluation(tenantId, template.id, {
      title: template.title,
      description: template.description,
      lastModified: new Date().toISOString(),
      updatedAt: new Date(),
    });
    
    return template;
  }
}

// ============================================================================
// REPORTS
// ============================================================================

export async function getReports(tenantId: string): Promise<Report[]> {
  console.log(`[Backend Mock] Fetching reports for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getReports(tenantId);
}

// ============================================================================
// CONTACT GROUPS
// ============================================================================

export async function getContactGroups(tenantId: string): Promise<ContactGroup[]> {
  console.log(`[Backend Mock] Fetching contact groups for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getContactGroups(tenantId);
}

export async function getContactGroup(tenantId: string, groupId: string): Promise<ContactGroup | null> {
  console.log(`[Backend Mock] Fetching contact group: ${groupId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getContactGroup(tenantId, groupId) || null;
}

export async function createContactGroup(
  tenantId: string, 
  group: Omit<ContactGroup, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<ContactGroup> {
  console.log(`[Backend Mock] Creating contact group for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const newGroup: ContactGroup = {
    ...group,
    id: uuidv4(),
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  DataLoader.addContactGroup(tenantId, newGroup);
  return newGroup;
}

export async function updateContactGroup(
  tenantId: string, 
  groupId: string, 
  updates: Partial<ContactGroup>
): Promise<ContactGroup> {
  console.log(`[Backend Mock] Updating contact group: ${groupId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const success = DataLoader.updateContactGroup(tenantId, groupId, { ...updates, updatedAt: new Date() });
  if (!success) {
    throw new Error(`Contact group not found: ${groupId}`);
  }
  
  return DataLoader.getContactGroup(tenantId, groupId)!;
}

export async function deleteContactGroup(tenantId: string, groupId: string): Promise<void> {
  console.log(`[Backend Mock] Deleting contact group: ${groupId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  DataLoader.deleteContactGroup(tenantId, groupId);
}

// ============================================================================
// CONTACTS
// ============================================================================

export async function getContacts(tenantId: string, groupId?: string): Promise<Contact[]> {
  console.log(`[Backend Mock] Fetching contacts for tenant: ${tenantId}, group: ${groupId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getContacts(tenantId, groupId);
}

export async function createContact(
  tenantId: string, 
  contact: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<Contact> {
  console.log(`[Backend Mock] Creating contact for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const newContact: Contact = {
    ...contact,
    id: uuidv4(),
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  DataLoader.addContact(tenantId, newContact);
  return newContact;
}

export async function updateContact(
  tenantId: string, 
  contactId: string, 
  updates: Partial<Contact>
): Promise<Contact> {
  console.log(`[Backend Mock] Updating contact: ${contactId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const success = DataLoader.updateContact(tenantId, contactId, { ...updates, updatedAt: new Date() });
  if (!success) {
    throw new Error(`Contact not found: ${contactId}`);
  }
  
  return DataLoader.getContact(tenantId, contactId)!;
}

export async function deleteContact(tenantId: string, contactId: string): Promise<void> {
  console.log(`[Backend Mock] Deleting contact: ${contactId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  DataLoader.deleteContact(tenantId, contactId);
}

export async function importContacts(
  tenantId: string, 
  contacts: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[]
): Promise<Contact[]> {
  console.log(`[Backend Mock] Importing ${contacts.length} contacts for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(1000); // Simulate longer processing time
  
  const newContacts: Contact[] = contacts.map(contact => ({
    ...contact,
    id: uuidv4(),
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  
  DataLoader.addContacts(tenantId, newContacts);
  return newContacts;
}

// ============================================================================
// CUSTOM FORMULAS
// ============================================================================

export async function getFormVariables(tenantId: string, evaluationId: string): Promise<FormVariable[]> {
  console.log(`[Backend Mock] Fetching form variables for evaluation: ${evaluationId} in tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return [
    {
      id: 'var-1',
      variableId: 'overall_performance',
      name: 'Overall Performance',
      type: 'number',
      source: 'form_response',
      description: 'Overall performance rating from 1-5',
    },
    {
      id: 'var-2',
      variableId: 'performance_score',
      name: 'Performance Score',
      type: 'number',
      source: 'calculated',
      formula: 'overall_performance * 20',
      description: 'Calculated performance score (0-100)',
    },
  ];
}

export async function getCustomFormulas(tenantId: string, evaluationId?: string): Promise<CustomFormula[]> {
  console.log(`[Backend Mock] Fetching custom formulas for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getCustomFormulas(tenantId);
}

export async function saveCustomFormula(
  tenantId: string, 
  formula: Omit<CustomFormula, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<CustomFormula> {
  console.log(`[Backend Mock] Saving custom formula for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const newFormula: CustomFormula = {
    ...formula,
    id: uuidv4(),
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  DataLoader.addCustomFormula(tenantId, newFormula);
  return newFormula;
}

export async function deleteCustomFormula(tenantId: string, formulaId: string): Promise<void> {
  console.log(`[Backend Mock] Deleting custom formula: ${formulaId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  DataLoader.deleteCustomFormula(tenantId, formulaId);
}

export async function evaluateFormula(formula: string, variables: Record<string, any>): Promise<FormulaResult> {
  console.log(`[Backend Mock] Evaluating formula: ${formula}`);
  await delay(100);
  
  try {
    // Simple mock evaluation - in real implementation this would use a proper formula engine
    if (formula.includes('AVG')) {
      return { value: 85.5, type: 'number' };
    } else if (formula.includes('IF')) {
      return { value: 'High', type: 'string' };
    } else {
      return { value: 42, type: 'number' };
    }
  } catch (error) {
    return { 
      value: 0, 
      type: 'number', 
      error: error instanceof Error ? error.message : 'Formula evaluation failed' 
    };
  }
}

// ============================================================================
// USER AND ROLE MANAGEMENT
// ============================================================================

export async function getTenantUsers(tenantId: string): Promise<TenantUser[]> {
  console.log(`[Backend Mock] Fetching tenant users for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getUsers(tenantId);
}

export async function getTenantUser(tenantId: string, userId: string): Promise<TenantUser | null> {
  console.log(`[Backend Mock] Fetching tenant user: ${userId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getUser(tenantId, userId) || null;
}

export async function inviteUser(tenantId: string, email: string, roleIds: string[]): Promise<TenantUser> {
  console.log(`[Backend Mock] Inviting user: ${email} to tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(500);
  
  const newUser: TenantUser = {
    id: uuidv4(),
    email,
    tenantId,
    roleIds,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  DataLoader.addUser(tenantId, newUser);
  return newUser;
}

export async function updateUserRoles(tenantId: string, userId: string, roleIds: string[]): Promise<TenantUser> {
  console.log(`[Backend Mock] Updating user roles: ${userId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const success = DataLoader.updateUser(tenantId, userId, { roleIds, updatedAt: new Date() });
  if (!success) {
    throw new Error(`User not found: ${userId}`);
  }
  
  return DataLoader.getUser(tenantId, userId)!;
}

export async function removeUser(tenantId: string, userId: string): Promise<void> {
  console.log(`[Backend Mock] Removing user: ${userId} from tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  DataLoader.deleteUser(tenantId, userId);
}

export async function getRoles(tenantId: string): Promise<Role[]> {
  console.log(`[Backend Mock] Fetching roles for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getRoles(tenantId);
}

export async function getRole(tenantId: string, roleId: string): Promise<Role | null> {
  console.log(`[Backend Mock] Fetching role: ${roleId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  return DataLoader.getRole(tenantId, roleId) || null;
}

export async function createRole(
  tenantId: string, 
  role: Omit<Role, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<Role> {
  console.log(`[Backend Mock] Creating role for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const newRole: Role = {
    ...role,
    id: uuidv4(),
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  DataLoader.addRole(tenantId, newRole);
  return newRole;
}

export async function updateRole(
  tenantId: string, 
  roleId: string, 
  updates: Partial<Role>
): Promise<Role> {
  console.log(`[Backend Mock] Updating role: ${roleId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const success = DataLoader.updateRole(tenantId, roleId, { ...updates, updatedAt: new Date() });
  if (!success) {
    throw new Error(`Role not found: ${roleId}`);
  }
  
  return DataLoader.getRole(tenantId, roleId)!;
}

export async function deleteRole(tenantId: string, roleId: string): Promise<void> {
  console.log(`[Backend Mock] Deleting role: ${roleId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  DataLoader.deleteRole(tenantId, roleId);
}

export async function getUserPermissions(tenantId: string, userId: string): Promise<Permission[]> {
  console.log(`[Backend Mock] Fetching user permissions: ${userId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  
  const user = DataLoader.getUser(tenantId, userId);
  return (user?.permissions || []) as Permission[];
}

export async function checkPermission(tenantId: string, userId: string, permission: Permission): Promise<boolean> {
  console.log(`[Backend Mock] Checking permission: ${permission} for user: ${userId} in tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(100);
  
  const permissions = await getUserPermissions(tenantId, userId);
  return permissions.includes(permission);
}

// ============================================================================
// PLACEHOLDER IMPLEMENTATIONS
// ============================================================================

export async function getReportTemplates(tenantId: string, evaluationId?: string): Promise<ReportTemplate[]> {
  console.log(`[Backend Mock] Fetching report templates for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  return [];
}

export async function getReportTemplate(tenantId: string, templateId: string): Promise<ReportTemplate | null> {
  console.log(`[Backend Mock] Fetching report template: ${templateId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  return null;
}

export async function createReportTemplate(
  tenantId: string, 
  template: Omit<ReportTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<ReportTemplate> {
  console.log(`[Backend Mock] Creating report template for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  const newTemplate: ReportTemplate = {
    ...template,
    id: uuidv4(),
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return newTemplate;
}

export async function updateReportTemplate(
  tenantId: string, 
  templateId: string, 
  updates: Partial<ReportTemplate>
): Promise<ReportTemplate> {
  console.log(`[Backend Mock] Updating report template: ${templateId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
  
  throw new Error('Report template not found');
}

export async function deleteReportTemplate(tenantId: string, templateId: string): Promise<void> {
  console.log(`[Backend Mock] Deleting report template: ${templateId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(300);
}

export async function submitEvaluationResponse(
  response: Omit<EvaluationResponse, 'id' | 'calculatedScores' | 'completedAt'>
): Promise<EvaluationResponse> {
  console.log(`[Backend Mock] Submitting evaluation response`);
  await delay(500);
  
  const newResponse: EvaluationResponse = {
    ...response,
    id: uuidv4(),
    calculatedScores: { performance_score: 85 },
    completedAt: new Date(),
  };
  
  return newResponse;
}

export async function getEvaluationResponses(tenantId: string, evaluationId: string): Promise<EvaluationResponse[]> {
  console.log(`[Backend Mock] Fetching evaluation responses for tenant: ${tenantId}, evaluation: ${evaluationId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  return [];
}

export async function getEvaluationResponse(tenantId: string, responseId: string): Promise<EvaluationResponse | null> {
  console.log(`[Backend Mock] Fetching evaluation response: ${responseId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(200);
  return null;
}

export async function publishEvaluation(
  tenantId: string, 
  evaluationId: string, 
  settings: PublicationSettings
): Promise<{ publicLink?: string; success: boolean }> {
  console.log(`[Backend Mock] Publishing evaluation: ${evaluationId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(500);
  
  const tenant = DataLoader.getTenant(tenantId);
  return {
    publicLink: `https://${tenant?.subdomain}.evalai.com/public/${evaluationId}`,
    success: true,
  };
}

export async function getPublicEvaluation(slug: string): Promise<FormTemplate | null> {
  console.log(`[Backend Mock] Fetching public evaluation: ${slug}`);
  await delay(300);
  return null;
}

export async function distributeEvaluation(
  tenantId: string, 
  evaluationId: string, 
  distribution: {
    recipientType: 'contacts' | 'groups' | 'all';
    contactIds?: string[];
    groupIds?: string[];
    subject: string;
    message: string;
    includeLink: boolean;
  }
): Promise<{ sentCount: number; success: boolean }> {
  console.log(`[Backend Mock] Distributing evaluation: ${evaluationId} for tenant: ${tenantId}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(1000); // Simulate email sending time
  
  let sentCount = 0;
  
  switch (distribution.recipientType) {
    case 'all':
      const allContacts = DataLoader.getContacts(tenantId);
      sentCount = allContacts.length;
      break;
    case 'contacts':
      sentCount = distribution.contactIds?.length || 0;
      break;
    case 'groups':
      if (distribution.groupIds) {
        for (const groupId of distribution.groupIds) {
          const group = DataLoader.getContactGroup(tenantId, groupId);
          sentCount += group?.contactCount || 0;
        }
      }
      break;
  }
  
  return {
    sentCount,
    success: true,
  };
}

export async function scheduleEvaluation(
  tenantId: string, 
  evaluationId: string, 
  schedule: {
    recipientType: 'contacts' | 'groups' | 'all';
    contactIds?: string[];
    groupIds?: string[];
    subject: string;
    message: string;
    scheduledAt: Date;
    includeLink: boolean;
  }
): Promise<{ scheduledId: string; success: boolean }> {
  console.log(`[Backend Mock] Scheduling evaluation: ${evaluationId} for tenant: ${tenantId} at ${schedule.scheduledAt}`);
  DataLoader.validateTenantAccess(tenantId);
  await delay(500);
  
  const scheduledId = `schedule_${Date.now()}`;
  
  return {
    scheduledId,
    success: true,
  };
}
