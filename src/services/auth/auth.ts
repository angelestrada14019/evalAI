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
      const mockImpl = require('./impl.mock');
      return {
        login: mockImpl.login,
        signup: mockImpl.signup,
        logout: mockImpl.logout,
        getCurrentUser: mockImpl.getCurrentUser,
      };
    case 'supabase':
      const supabaseImpl = require('./impl.supabase');
      return supabaseImpl; // Assuming it will be structured similarly
    case 'keycloak':
      const keycloakImpl = require('./impl.keycloak');
      return keycloakImpl;
    case 'b2c':
       const b2cImpl = require('./impl.b2c');
       return b2cImpl;
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }
}
