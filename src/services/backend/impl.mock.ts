'use server';
/**
 * @fileOverview Mock implementation of the BackendService for development and testing.
 */
import type { DashboardStats } from './types';

export async function getDashboardStats(): Promise<DashboardStats> {
    console.log('[Backend Mock] Fetching dashboard stats');
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        totalEvaluations: { value: 1257, change: "+20.1% from last month" },
        avgScore: { value: 82.4, change: "+2.1 from last month" },
        activeForms: { value: 12, change: "+2 since last week" },
        responseRate: { value: "94%", change: "-1.2% from last month" },
    };
}
