/**
 * @fileOverview Data loader utilities for mock backend implementation.
 * Provides centralized access to JSON mock data with type safety.
 */
import type { 
  Contact, ContactGroup, Evaluation, CustomFormula, Report, TenantUser
} from '../types';
import type { Tenant } from '@/types/tenant';
import type { Role } from '@/types/permissions';

// Import JSON data
import tenantsData from './data/tenants.json';
import rolesUsersData from './data/roles-users.json';
import contactsData from './data/contacts.json';
import evaluationsData from './data/evaluations.json';

// ============================================================================
// TYPE DEFINITIONS FOR JSON DATA
// ============================================================================

interface TenantsData {
  [tenantId: string]: Tenant;
}

interface RolesUsersData {
  roles: { [tenantId: string]: Role[] };
  users: { [tenantId: string]: TenantUser[] };
}

interface ContactsData {
  contactGroups: { [tenantId: string]: ContactGroup[] };
  contacts: { [tenantId: string]: Contact[] };
}

interface EvaluationsData {
  evaluations: { [tenantId: string]: Evaluation[] };
  customFormulas: { [tenantId: string]: CustomFormula[] };
  reports: { [tenantId: string]: Report[] };
}

// ============================================================================
// DATA STORAGE WITH MUTATIONS
// ============================================================================

// Create mutable copies of the JSON data for runtime modifications
let MOCK_TENANTS: TenantsData = {};
let MOCK_ROLES: { [tenantId: string]: Role[] } = {};
let MOCK_USERS: { [tenantId: string]: TenantUser[] } = {};
let MOCK_CONTACT_GROUPS: { [tenantId: string]: ContactGroup[] } = {};
let MOCK_CONTACTS: { [tenantId: string]: Contact[] } = {};
let MOCK_EVALUATIONS: { [tenantId: string]: Evaluation[] } = {};
let MOCK_CUSTOM_FORMULAS: { [tenantId: string]: CustomFormula[] } = {};
let MOCK_REPORTS: { [tenantId: string]: Report[] } = {};

// Initialize data from JSON files
function initializeData() {
  // Initialize tenants with date conversion
  const tenants = tenantsData as any;
  MOCK_TENANTS = {};
  Object.keys(tenants).forEach(tenantId => {
    const tenant = tenants[tenantId];
    MOCK_TENANTS[tenantId] = {
      ...tenant,
      createdAt: new Date(tenant.createdAt),
      updatedAt: new Date(tenant.updatedAt),
    };
  });

  // Deep clone roles and users data
  const rolesUsers = rolesUsersData as any;
  MOCK_ROLES = {};
  MOCK_USERS = {};
  
  Object.keys(rolesUsers.roles).forEach(tenantId => {
    MOCK_ROLES[tenantId] = rolesUsers.roles[tenantId].map((role: any) => ({
      ...role,
      createdAt: new Date(role.createdAt),
      updatedAt: new Date(role.updatedAt),
    }));
  });
  
  Object.keys(rolesUsers.users).forEach(tenantId => {
    MOCK_USERS[tenantId] = rolesUsers.users[tenantId].map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
  });

  // Deep clone contacts data
  const contacts = contactsData as any;
  MOCK_CONTACT_GROUPS = {};
  MOCK_CONTACTS = {};
  
  Object.keys(contacts.contactGroups).forEach(tenantId => {
    MOCK_CONTACT_GROUPS[tenantId] = contacts.contactGroups[tenantId].map((group: any) => ({
      ...group,
      createdAt: new Date(group.createdAt),
      updatedAt: new Date(group.updatedAt),
    }));
  });
  
  Object.keys(contacts.contacts).forEach(tenantId => {
    MOCK_CONTACTS[tenantId] = contacts.contacts[tenantId].map((contact: any) => ({
      ...contact,
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
    }));
  });

  // Deep clone evaluations data
  const evaluations = evaluationsData as any;
  MOCK_EVALUATIONS = {};
  MOCK_CUSTOM_FORMULAS = {};
  MOCK_REPORTS = {};
  
  Object.keys(evaluations.evaluations).forEach(tenantId => {
    MOCK_EVALUATIONS[tenantId] = evaluations.evaluations[tenantId].map((evaluation: any) => ({
      ...evaluation,
      createdAt: new Date(evaluation.createdAt),
      updatedAt: new Date(evaluation.updatedAt),
    }));
  });
  
  Object.keys(evaluations.customFormulas).forEach(tenantId => {
    MOCK_CUSTOM_FORMULAS[tenantId] = evaluations.customFormulas[tenantId].map((formula: any) => ({
      ...formula,
      createdAt: new Date(formula.createdAt),
      updatedAt: new Date(formula.updatedAt),
    }));
  });
  
  Object.keys(evaluations.reports).forEach(tenantId => {
    MOCK_REPORTS[tenantId] = evaluations.reports[tenantId].map((report: any) => ({
      ...report,
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt),
    }));
  });
}

// Initialize data on module load
initializeData();

// ============================================================================
// DATA ACCESS FUNCTIONS
// ============================================================================

// Tenants
export function getTenants(): TenantsData {
  return MOCK_TENANTS;
}

export function getTenant(tenantId: string): Tenant | undefined {
  return MOCK_TENANTS[tenantId];
}

export function updateTenant(tenantId: string, updates: Partial<Tenant>): void {
  if (MOCK_TENANTS[tenantId]) {
    MOCK_TENANTS[tenantId] = { ...MOCK_TENANTS[tenantId], ...updates };
  }
}

// Roles
export function getRoles(tenantId: string): Role[] {
  return MOCK_ROLES[tenantId] || [];
}

export function getRole(tenantId: string, roleId: string): Role | undefined {
  const roles = MOCK_ROLES[tenantId] || [];
  return roles.find(r => r.id === roleId);
}

export function addRole(tenantId: string, role: Role): void {
  if (!MOCK_ROLES[tenantId]) {
    MOCK_ROLES[tenantId] = [];
  }
  MOCK_ROLES[tenantId].push(role);
}

export function updateRole(tenantId: string, roleId: string, updates: Partial<Role>): boolean {
  const roles = MOCK_ROLES[tenantId] || [];
  const index = roles.findIndex(r => r.id === roleId);
  if (index >= 0) {
    roles[index] = { ...roles[index], ...updates };
    return true;
  }
  return false;
}

export function deleteRole(tenantId: string, roleId: string): boolean {
  const roles = MOCK_ROLES[tenantId] || [];
  const index = roles.findIndex(r => r.id === roleId);
  if (index >= 0) {
    roles.splice(index, 1);
    return true;
  }
  return false;
}

// Users
export function getUsers(tenantId: string): TenantUser[] {
  return MOCK_USERS[tenantId] || [];
}

export function getUser(tenantId: string, userId: string): TenantUser | undefined {
  const users = MOCK_USERS[tenantId] || [];
  return users.find(u => u.id === userId);
}

export function addUser(tenantId: string, user: TenantUser): void {
  if (!MOCK_USERS[tenantId]) {
    MOCK_USERS[tenantId] = [];
  }
  MOCK_USERS[tenantId].push(user);
}

export function updateUser(tenantId: string, userId: string, updates: Partial<TenantUser>): boolean {
  const users = MOCK_USERS[tenantId] || [];
  const index = users.findIndex(u => u.id === userId);
  if (index >= 0) {
    users[index] = { ...users[index], ...updates };
    return true;
  }
  return false;
}

export function deleteUser(tenantId: string, userId: string): boolean {
  const users = MOCK_USERS[tenantId] || [];
  const index = users.findIndex(u => u.id === userId);
  if (index >= 0) {
    users.splice(index, 1);
    return true;
  }
  return false;
}

// Contact Groups
export function getContactGroups(tenantId: string): ContactGroup[] {
  return MOCK_CONTACT_GROUPS[tenantId] || [];
}

export function getContactGroup(tenantId: string, groupId: string): ContactGroup | undefined {
  const groups = MOCK_CONTACT_GROUPS[tenantId] || [];
  return groups.find(g => g.id === groupId);
}

export function addContactGroup(tenantId: string, group: ContactGroup): void {
  if (!MOCK_CONTACT_GROUPS[tenantId]) {
    MOCK_CONTACT_GROUPS[tenantId] = [];
  }
  MOCK_CONTACT_GROUPS[tenantId].push(group);
}

export function updateContactGroup(tenantId: string, groupId: string, updates: Partial<ContactGroup>): boolean {
  const groups = MOCK_CONTACT_GROUPS[tenantId] || [];
  const index = groups.findIndex(g => g.id === groupId);
  if (index >= 0) {
    groups[index] = { ...groups[index], ...updates };
    return true;
  }
  return false;
}

export function deleteContactGroup(tenantId: string, groupId: string): boolean {
  const groups = MOCK_CONTACT_GROUPS[tenantId] || [];
  const index = groups.findIndex(g => g.id === groupId);
  if (index >= 0) {
    groups.splice(index, 1);
    return true;
  }
  return false;
}

// Contacts
export function getContacts(tenantId: string, groupId?: string): Contact[] {
  const contacts = MOCK_CONTACTS[tenantId] || [];
  if (groupId) {
    return contacts.filter(c => c.groupIds.includes(groupId));
  }
  return contacts;
}

export function getContact(tenantId: string, contactId: string): Contact | undefined {
  const contacts = MOCK_CONTACTS[tenantId] || [];
  return contacts.find(c => c.id === contactId);
}

export function addContact(tenantId: string, contact: Contact): void {
  if (!MOCK_CONTACTS[tenantId]) {
    MOCK_CONTACTS[tenantId] = [];
  }
  MOCK_CONTACTS[tenantId].push(contact);
}

export function addContacts(tenantId: string, contacts: Contact[]): void {
  if (!MOCK_CONTACTS[tenantId]) {
    MOCK_CONTACTS[tenantId] = [];
  }
  MOCK_CONTACTS[tenantId].push(...contacts);
}

export function updateContact(tenantId: string, contactId: string, updates: Partial<Contact>): boolean {
  const contacts = MOCK_CONTACTS[tenantId] || [];
  const index = contacts.findIndex(c => c.id === contactId);
  if (index >= 0) {
    contacts[index] = { ...contacts[index], ...updates };
    return true;
  }
  return false;
}

export function deleteContact(tenantId: string, contactId: string): boolean {
  const contacts = MOCK_CONTACTS[tenantId] || [];
  const index = contacts.findIndex(c => c.id === contactId);
  if (index >= 0) {
    contacts.splice(index, 1);
    return true;
  }
  return false;
}

// Evaluations
export function getEvaluations(tenantId: string): Evaluation[] {
  return MOCK_EVALUATIONS[tenantId] || [];
}

export function getEvaluation(tenantId: string, evaluationId: string): Evaluation | undefined {
  const evaluations = MOCK_EVALUATIONS[tenantId] || [];
  return evaluations.find(e => e.id === evaluationId);
}

export function addEvaluation(tenantId: string, evaluation: Evaluation): void {
  if (!MOCK_EVALUATIONS[tenantId]) {
    MOCK_EVALUATIONS[tenantId] = [];
  }
  MOCK_EVALUATIONS[tenantId].unshift(evaluation); // Add to beginning for recent first
}

export function updateEvaluation(tenantId: string, evaluationId: string, updates: Partial<Evaluation>): boolean {
  const evaluations = MOCK_EVALUATIONS[tenantId] || [];
  const index = evaluations.findIndex(e => e.id === evaluationId);
  if (index >= 0) {
    evaluations[index] = { ...evaluations[index], ...updates };
    return true;
  }
  return false;
}

export function deleteEvaluation(tenantId: string, evaluationId: string): boolean {
  const evaluations = MOCK_EVALUATIONS[tenantId] || [];
  const index = evaluations.findIndex(e => e.id === evaluationId);
  if (index >= 0) {
    evaluations.splice(index, 1);
    return true;
  }
  return false;
}

// Custom Formulas
export function getCustomFormulas(tenantId: string): CustomFormula[] {
  return MOCK_CUSTOM_FORMULAS[tenantId] || [];
}

export function getCustomFormula(tenantId: string, formulaId: string): CustomFormula | undefined {
  const formulas = MOCK_CUSTOM_FORMULAS[tenantId] || [];
  return formulas.find(f => f.id === formulaId);
}

export function addCustomFormula(tenantId: string, formula: CustomFormula): void {
  if (!MOCK_CUSTOM_FORMULAS[tenantId]) {
    MOCK_CUSTOM_FORMULAS[tenantId] = [];
  }
  MOCK_CUSTOM_FORMULAS[tenantId].push(formula);
}

export function updateCustomFormula(tenantId: string, formulaId: string, updates: Partial<CustomFormula>): boolean {
  const formulas = MOCK_CUSTOM_FORMULAS[tenantId] || [];
  const index = formulas.findIndex(f => f.id === formulaId);
  if (index >= 0) {
    formulas[index] = { ...formulas[index], ...updates };
    return true;
  }
  return false;
}

export function deleteCustomFormula(tenantId: string, formulaId: string): boolean {
  const formulas = MOCK_CUSTOM_FORMULAS[tenantId] || [];
  const index = formulas.findIndex(f => f.id === formulaId);
  if (index >= 0) {
    formulas.splice(index, 1);
    return true;
  }
  return false;
}

// Reports
export function getReports(tenantId: string): Report[] {
  return MOCK_REPORTS[tenantId] || [];
}

export function getReport(tenantId: string, reportId: string): Report | undefined {
  const reports = MOCK_REPORTS[tenantId] || [];
  return reports.find(r => r.id === reportId);
}

export function addReport(tenantId: string, report: Report): void {
  if (!MOCK_REPORTS[tenantId]) {
    MOCK_REPORTS[tenantId] = [];
  }
  MOCK_REPORTS[tenantId].unshift(report); // Add to beginning for recent first
}

export function updateReport(tenantId: string, reportId: string, updates: Partial<Report>): boolean {
  const reports = MOCK_REPORTS[tenantId] || [];
  const index = reports.findIndex(r => r.id === reportId);
  if (index >= 0) {
    reports[index] = { ...reports[index], ...updates };
    return true;
  }
  return false;
}

export function deleteReport(tenantId: string, reportId: string): boolean {
  const reports = MOCK_REPORTS[tenantId] || [];
  const index = reports.findIndex(r => r.id === reportId);
  if (index >= 0) {
    reports.splice(index, 1);
    return true;
  }
  return false;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function validateTenantAccess(tenantId: string): void {
  if (!MOCK_TENANTS[tenantId]) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }
}

export function resetData(): void {
  initializeData();
}

// For debugging and development
export function getAllData() {
  return {
    tenants: MOCK_TENANTS,
    roles: MOCK_ROLES,
    users: MOCK_USERS,
    contactGroups: MOCK_CONTACT_GROUPS,
    contacts: MOCK_CONTACTS,
    evaluations: MOCK_EVALUATIONS,
    customFormulas: MOCK_CUSTOM_FORMULAS,
    reports: MOCK_REPORTS,
  };
}
