
/**
 * @fileOverview This file defines the common types used by the backend service implementations.
 * Extended with multi-tenant support and new entities.
 */
import { z } from 'zod';
import { BaseTenantEntity } from '@/types/tenant';
import { Permission } from '@/types/permissions';

export const DashboardStatsSchema = z.object({
    totalEvaluations: z.object({
        value: z.number(),
        change: z.string()
    }),
    avgScore: z.object({
        value: z.number(),
        change: z.string()
    }),
    activeForms: z.object({
        value: z.number(),
        change: z.string()
    }),
    responseRate: z.object({
        value: z.string(),
        change: z.string()
    }),
});
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const ChartDataSchema = z.object({
    name: z.string(),
    total: z.number(),
});
export type ChartData = z.infer<typeof ChartDataSchema>;

export const RecentEvaluationSchema = z.object({
    name: z.string(),
    email: z.string(),
    score: z.number(),
    fallback: z.string(),
});
export type RecentEvaluation = z.infer<typeof RecentEvaluationSchema>;

export const ReportSchema = z.object({
    id: z.string(),
    tenantId: z.string().uuid(),
    evaluationId: z.string().uuid(),
    title: z.string(),
    date: z.string(),
    type: z.enum(['Individual', 'Aggregate']),
    status: z.enum(['Completed', 'In Progress', 'Pending']),
    templateId: z.string().uuid().optional(),
    responseId: z.string().uuid().optional(), // For individual reports
    pdfUrl: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Report = z.infer<typeof ReportSchema>;


export const EvaluationSchema = z.object({
    id: z.string(),
    tenantId: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(['Draft', 'Active', 'Archived']),
    responses: z.number(),
    lastModified: z.union([z.string().datetime(), z.string()]),
    publicLink: z.string().optional(),
    audienceGroups: z.array(z.string()).optional(),
    reportTemplates: z.array(z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;


// Contact and Group types for distribution
export const ContactSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    customFields: z.record(z.any()).default({}),
    groupIds: z.array(z.string().uuid()).default([]),
    status: z.enum(['active', 'bounced', 'unsubscribed']).default('active'),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const ContactGroupSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    contactCount: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type ContactGroup = z.infer<typeof ContactGroupSchema>;

// Formula and Variable types
export const FormVariableSchema = z.object({
    id: z.string(),
    variableId: z.string(), // From FormItem
    name: z.string(),
    type: z.enum(['number', 'text', 'boolean', 'date']),
    source: z.enum(['form_response', 'calculated', 'system']),
    formula: z.string().optional(),
    description: z.string(),
});
export type FormVariable = z.infer<typeof FormVariableSchema>;

export const CustomFormulaSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    name: z.string(),
    variableId: z.string(),
    formula: z.string(),
    description: z.string(),
    displayFormat: z.enum(['number', 'percentage', 'currency', 'text']).default('number'),
    category: z.enum(['score', 'rating', 'classification']).default('score'),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type CustomFormula = z.infer<typeof CustomFormulaSchema>;

export const FormulaResultSchema = z.object({
    value: z.union([z.number(), z.string(), z.boolean()]),
    type: z.enum(['number', 'string', 'boolean']),
    error: z.string().optional(),
});
export type FormulaResult = z.infer<typeof FormulaResultSchema>;

// Evaluation Response types
export const EvaluationResponseSchema = z.object({
    id: z.string().uuid(),
    evaluationId: z.string().uuid(),
    tenantId: z.string().uuid(),
    contactId: z.string().uuid().optional(), // For registered contacts
    answers: z.record(z.any()), // variableId -> value
    calculatedScores: z.record(z.number()).default({}), // formula results
    completedAt: z.date(),
    metadata: z.object({
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        completionTime: z.number(), // seconds
        source: z.enum(['public_link', 'email_campaign', 'direct_invite']).optional(),
    }),
});
export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;

// Report Template types
export const ReportTemplateSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    evaluationId: z.string().uuid(),
    name: z.string(),
    type: z.enum(['individual', 'aggregate']),
    customFormulas: z.array(CustomFormulaSchema).default([]),
    pages: z.array(z.any()), // Will be defined in detail later
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;

// Publication settings
export const PublicationSettingsSchema = z.object({
    type: z.enum(['public_link', 'audience_groups', 'both']),
    publicLink: z.object({
        enabled: z.boolean(),
        customSlug: z.string().optional(),
        expiresAt: z.date().optional(),
        requiresAuth: z.boolean().default(false),
        allowAnonymous: z.boolean().default(true),
    }).optional(),
    audienceGroups: z.object({
        groupIds: z.array(z.string().uuid()),
        sendEmail: z.boolean().default(true),
        emailTemplate: z.string().optional(),
    }).optional(),
});
export type PublicationSettings = z.infer<typeof PublicationSettingsSchema>;

// User types with tenant context
export const TenantUserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    tenantId: z.string().uuid(),
    roleIds: z.array(z.string().uuid()).default([]),
    permissions: z.array(z.string()).default([]), // Computed permissions
    lastLoginAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type TenantUser = z.infer<typeof TenantUserSchema>;

// Re-using the builder types for the full template structure
export type { FormTemplate } from '@/components/evaluations/builder/types';
