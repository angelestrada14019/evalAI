import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { BackendService } from './backend';
import type { 
  DashboardStats, 
  Evaluation, 
  Contact, 
  ContactGroup, 
  EvaluationResponse, 
  ReportTemplate, 
  FormVariable,
  CustomFormula,
  ChartData,
  RecentEvaluation,
  Report,
  FormulaResult,
  PublicationSettings,
  TenantUser
} from './types';
import type { Tenant } from '@/types/tenant';
import type { FormTemplate } from '@/components/evaluations/builder/types';
import type { Permission, Role } from '@/types/permissions';

type SupabaseClient = typeof supabase;

export class SupabaseBackendService implements BackendService {
  private client: SupabaseClient;

  constructor() {
    this.client = supabase;
  }

  // Dashboard methods
  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    const [evaluationsResult, contactsResult, responsesResult] = await Promise.all([
      this.client.from('evaluations').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      this.client.from('contacts').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      this.client.from('evaluation_responses').select('id', { count: 'exact' }).eq('tenant_id', tenantId)
    ]);

    return {
      totalEvaluations: {
        value: evaluationsResult.count || 0,
        change: '+0%'
      },
      avgScore: {
        value: 0,
        change: '+0%'
      },
      activeForms: {
        value: 0,
        change: '+0%'
      },
      responseRate: {
        value: '0%',
        change: '+0%'
      }
    };
  }

  async getChartData(tenantId: string): Promise<ChartData[]> {
    return [];
  }

  async getRecentEvaluations(tenantId: string): Promise<RecentEvaluation[]> {
    return [];
  }

  // Evaluation methods
  async getEvaluations(tenantId: string): Promise<Evaluation[]> {
    const { data, error } = await this.client
      .from('evaluations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get evaluations: ${error.message}`);

    return data.map(this.mapEvaluationFromDB);
  }

  async getEvaluationById(id: string): Promise<FormTemplate | null> {
    const { data, error } = await this.client
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return data.form_config as unknown as FormTemplate;
  }

  async saveEvaluation(tenantId: string, template: FormTemplate): Promise<FormTemplate> {
    const { data, error } = await this.client
      .from('evaluations')
      .upsert({
        id: template.id,
        tenant_id: tenantId,
        title: template.title,
        description: template.description,
        form_config: template as any,
        status: 'draft',
        created_by: 'system', // TODO: Get from auth context
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save evaluation: ${error.message}`);

    return data.form_config as unknown as FormTemplate;
  }

  async getReports(tenantId: string): Promise<Report[]> {
    return [];
  }

  // Tenant methods
  async getTenant(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !data) return null;

    return this.mapTenantFromDB(data);
  }

  async updateTenant(tenant: Partial<Tenant> & { id: string }): Promise<Tenant> {
    const { data, error } = await this.client
      .from('tenants')
      .update({
        name: tenant.name,
        logo_url: tenant.branding?.logo,
        primary_color: tenant.branding?.primaryColor,
        secondary_color: tenant.branding?.secondaryColor,
        font_family: tenant.branding?.fontFamily,
        custom_css: tenant.branding?.customCSS,
        settings: tenant.settings as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenant.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update tenant: ${error.message}`);

    return this.mapTenantFromDB(data);
  }

  // Contact Group methods
  async getContactGroups(tenantId: string): Promise<ContactGroup[]> {
    const { data, error } = await this.client
      .from('contact_groups')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get contact groups: ${error.message}`);

    return data.map(this.mapContactGroupFromDB);
  }

  async getContactGroup(tenantId: string, groupId: string): Promise<ContactGroup | null> {
    const { data, error } = await this.client
      .from('contact_groups')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', groupId)
      .single();

    if (error || !data) return null;

    return this.mapContactGroupFromDB(data);
  }

  async createContactGroup(tenantId: string, group: Omit<ContactGroup, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ContactGroup> {
    const { data, error } = await this.client
      .from('contact_groups')
      .insert({
        tenant_id: tenantId,
        name: group.name,
        description: group.description,
        tags: group.tags,
        contact_count: group.contactCount
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create contact group: ${error.message}`);

    return this.mapContactGroupFromDB(data);
  }

  async updateContactGroup(tenantId: string, groupId: string, updates: Partial<ContactGroup>): Promise<ContactGroup> {
    const { data, error } = await this.client
      .from('contact_groups')
      .update({
        name: updates.name,
        description: updates.description,
        tags: updates.tags,
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update contact group: ${error.message}`);

    return this.mapContactGroupFromDB(data);
  }

  async deleteContactGroup(tenantId: string, groupId: string): Promise<void> {
    const { error } = await this.client
      .from('contact_groups')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', groupId);

    if (error) throw new Error(`Failed to delete contact group: ${error.message}`);
  }

  // Contact methods
  async getContacts(tenantId: string, groupId?: string): Promise<Contact[]> {
    let query = this.client
      .from('contacts')
      .select('*')
      .eq('tenant_id', tenantId);

    if (groupId) {
      // Join with contact_group_members to filter by group
      query = this.client
        .from('contacts')
        .select(`
          *,
          contact_group_members!inner(group_id)
        `)
        .eq('tenant_id', tenantId)
        .eq('contact_group_members.group_id', groupId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get contacts: ${error.message}`);

    return data.map(this.mapContactFromDB);
  }

  async createContact(tenantId: string, contact: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const { data, error } = await this.client
      .from('contacts')
      .insert({
        tenant_id: tenantId,
        email: contact.email,
        first_name: contact.firstName,
        last_name: contact.lastName,
        custom_fields: contact.customFields as any,
        status: contact.status === 'unsubscribed' ? 'inactive' : contact.status
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create contact: ${error.message}`);

    const newContact = this.mapContactFromDB(data);

    // Add to groups if specified
    if (contact.groupIds.length > 0) {
      const groupInserts = contact.groupIds.map(groupId => ({
        contact_id: newContact.id,
        group_id: groupId
      }));

      await this.client
        .from('contact_group_members')
        .insert(groupInserts);
    }

    return { ...newContact, groupIds: contact.groupIds };
  }

  async updateContact(tenantId: string, contactId: string, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await this.client
      .from('contacts')
      .update({
        email: updates.email,
        first_name: updates.firstName,
        last_name: updates.lastName,
        custom_fields: updates.customFields as any,
        status: updates.status === 'unsubscribed' ? 'inactive' : updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update contact: ${error.message}`);

    return this.mapContactFromDB(data);
  }

  async deleteContact(tenantId: string, contactId: string): Promise<void> {
    const { error } = await this.client
      .from('contacts')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', contactId);

    if (error) throw new Error(`Failed to delete contact: ${error.message}`);
  }

  async importContacts(tenantId: string, contacts: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[]): Promise<Contact[]> {
    const contactInserts = contacts.map(contact => ({
      tenant_id: tenantId,
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      custom_fields: contact.customFields as any,
      status: (contact.status === 'unsubscribed' ? 'inactive' : contact.status) as 'active' | 'inactive' | 'bounced'
    }));

    const { data, error } = await this.client
      .from('contacts')
      .insert(contactInserts)
      .select();

    if (error) throw new Error(`Failed to import contacts: ${error.message}`);

    return data.map(this.mapContactFromDB);
  }

  // Placeholder implementations for remaining methods
  async getReportTemplates(tenantId: string, evaluationId?: string): Promise<ReportTemplate[]> {
    return [];
  }

  async getReportTemplate(tenantId: string, templateId: string): Promise<ReportTemplate | null> {
    return null;
  }

  async createReportTemplate(tenantId: string, template: Omit<ReportTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    throw new Error('Not implemented');
  }

  async updateReportTemplate(tenantId: string, templateId: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    throw new Error('Not implemented');
  }

  async deleteReportTemplate(tenantId: string, templateId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getFormVariables(tenantId: string, evaluationId: string): Promise<FormVariable[]> {
    return [];
  }

  async getCustomFormulas(tenantId: string, evaluationId?: string): Promise<CustomFormula[]> {
    return [];
  }

  async saveCustomFormula(tenantId: string, formula: Omit<CustomFormula, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<CustomFormula> {
    throw new Error('Not implemented');
  }

  async deleteCustomFormula(tenantId: string, formulaId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async evaluateFormula(formula: string, variables: Record<string, any>): Promise<FormulaResult> {
    throw new Error('Not implemented');
  }

  async submitEvaluationResponse(response: Omit<EvaluationResponse, 'id' | 'calculatedScores' | 'completedAt'>): Promise<EvaluationResponse> {
    throw new Error('Not implemented');
  }

  async getEvaluationResponses(tenantId: string, evaluationId: string): Promise<EvaluationResponse[]> {
    return [];
  }

  async getEvaluationResponse(tenantId: string, responseId: string): Promise<EvaluationResponse | null> {
    return null;
  }

  async publishEvaluation(tenantId: string, evaluationId: string, settings: PublicationSettings): Promise<{ publicLink?: string; success: boolean }> {
    return { success: false };
  }

  async getPublicEvaluation(slug: string): Promise<FormTemplate | null> {
    return null;
  }

  async distributeEvaluation(tenantId: string, evaluationId: string, distribution: any): Promise<{ sentCount: number; success: boolean }> {
    return { sentCount: 0, success: false };
  }

  async scheduleEvaluation(tenantId: string, evaluationId: string, schedule: any): Promise<{ scheduledId: string; success: boolean }> {
    return { scheduledId: '', success: false };
  }

  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    return [];
  }

  async getTenantUser(tenantId: string, userId: string): Promise<TenantUser | null> {
    return null;
  }

  async inviteUser(tenantId: string, email: string, roleIds: string[]): Promise<TenantUser> {
    throw new Error('Not implemented');
  }

  async updateUserRoles(tenantId: string, userId: string, roleIds: string[]): Promise<TenantUser> {
    throw new Error('Not implemented');
  }

  async removeUser(tenantId: string, userId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getRoles(tenantId: string): Promise<Role[]> {
    return [];
  }

  async getRole(tenantId: string, roleId: string): Promise<Role | null> {
    return null;
  }

  async createRole(tenantId: string, role: Omit<Role, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    throw new Error('Not implemented');
  }

  async updateRole(tenantId: string, roleId: string, updates: Partial<Role>): Promise<Role> {
    throw new Error('Not implemented');
  }

  async deleteRole(tenantId: string, roleId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getUserPermissions(tenantId: string, userId: string): Promise<Permission[]> {
    return [];
  }

  async checkPermission(tenantId: string, userId: string, permission: Permission): Promise<boolean> {
    return false;
  }

  // Mapping functions
  private mapTenantFromDB(data: Database['public']['Tables']['tenants']['Row']): Tenant {
    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      customDomain: data.domain,
      status: data.status === 'inactive' ? 'suspended' : data.status as any,
      branding: {
        logo: data.logo_url,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        fontFamily: data.font_family,
        customCSS: data.custom_css
      },
      settings: data.settings as any,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapEvaluationFromDB(data: Database['public']['Tables']['evaluations']['Row']): Evaluation {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      title: data.title,
      description: data.description,
      status: data.status === 'draft' ? 'Draft' : data.status === 'published' ? 'Active' : 'Archived',
      responses: 0, // TODO: Calculate from responses table
      lastModified: data.updated_at,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapContactFromDB(data: Database['public']['Tables']['contacts']['Row']): Contact {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      customFields: data.custom_fields as any,
      status: data.status === 'inactive' ? 'unsubscribed' : data.status as any,
      groupIds: [], // Will be populated separately if needed
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapContactGroupFromDB(data: Database['public']['Tables']['contact_groups']['Row']): ContactGroup {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      description: data.description,
      tags: data.tags,
      contactCount: data.contact_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

// Export the service instance
const supabaseBackendService = new SupabaseBackendService();

// Export both as default and as named export for compatibility
export default supabaseBackendService;
export { supabaseBackendService };
