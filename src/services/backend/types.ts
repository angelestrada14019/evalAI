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
