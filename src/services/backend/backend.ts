/**
 * @fileOverview This file defines the abstract interface for the Backend service.
 * It uses the system configuration to dynamically load and export the
 * implementation specified in `systemConfig.backend.provider`.
 */
import { systemConfig } from '@/config/system';
import type { DashboardStats } from './types';

export interface BackendService {
  getDashboardStats(): Promise<DashboardStats>;
  // Add other methods here, e.g.:
  // getEvaluations(options: any): Promise<any>;
  // getEvaluationById(id: string): Promise<any>;
  // createEvaluation(data: any): Promise<any>;
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
      return {
        getDashboardStats: mockImpl.getDashboardStats,
      };
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
