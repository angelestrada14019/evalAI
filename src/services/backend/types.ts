
/**
 * @fileOverview This file defines the common types used by the backend service implementations.
 */
import { z } from 'zod';

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


export const EvaluationSchema = z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['Draft', 'Active', 'Archived']),
    responses: z.number(),
    lastModified: z.union([z.string().datetime(), z.string()]),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;


// Re-using the builder types for the full template structure
export type { FormTemplate } from '@/components/evaluations/builder/types';
