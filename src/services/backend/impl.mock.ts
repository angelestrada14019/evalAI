
'use server';
/**
 * @fileOverview Mock implementation of the BackendService for development and testing.
 */
import type { DashboardStats, Evaluation } from './types';

export async function getDashboardStats(): Promise<DashboardStats> {
    console.log('[Backend Mock] Fetching dashboard stats');
    
    return {
        totalEvaluations: { value: 1257, change: "+20.1% from last month" },
        avgScore: { value: 82.4, change: "+2.1 from last month" },
        activeForms: { value: 12, change: "+2 since last week" },
        responseRate: { value: "94%", change: "-1.2% from last month" },
    };
}

export async function getEvaluations(): Promise<Evaluation[]> {
    console.log('[Backend Mock] Fetching evaluations list');
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
        { id: 'eval_001', title: 'Q3 2024 Engineering Performance Review', status: 'Active', responses: 45, lastModified: '2024-07-15T10:00:00Z' },
        { id: 'eval_002', title: 'New Hire Onboarding Survey', status: 'Active', responses: 120, lastModified: '2024-07-12T14:30:00Z' },
        { id: 'eval_003', title: 'UX/UI Design Competency Matrix', status: 'Draft', responses: 0, lastModified: '2024-07-18T09:00:00Z' },
        { id: 'eval_004', title: 'Sales Team Q2 Skills Assessment', status: 'Archived', responses: 88, lastModified: '2024-06-28T17:00:00Z' },
        { id: 'eval_005', title: 'Annual Employee Satisfaction Poll', status: 'Active', responses: 350, lastModified: '2024-07-01T11:00:00Z' },
    ];
}
