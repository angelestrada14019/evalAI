'use server';
/**
 * @fileOverview This file defines the abstract interface for the Authentication service.
 * It uses the system configuration to dynamically load and export the
 * implementation specified in `systemConfig.auth.provider`.
 */
import { systemConfig } from '@/config/system';
import type { LoginInput, LoginOutput, SignUpInput, SignUpOutput, GetCurrentUserOutput } from './types';

export interface AuthService {
  login(input: LoginInput): Promise<LoginOutput>;
  signup(input: SignUpInput): Promise<SignUpOutput>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<GetCurrentUserOutput>;
}

/**
 * Dynamically loads and returns the configured auth service implementation.
 * @returns {AuthService} The auth service instance.
 */
export function auth(): AuthService {
  const provider = systemConfig.auth.provider;

  switch (provider) {
    case 'mock':
      const mockAuthService = require('./impl.mock');
      return mockAuthService;
    case 'supabase':
      const supabaseAuthService = require('./impl.supabase');
      return supabaseAuthService;
    case 'keycloak':
      const keycloakAuthService = require('./impl.keycloak');
      return keycloakAuthService;
    case 'b2c':
      const b2cAuthService = require('./impl.b2c');
      return b2cAuthService;
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }
}
