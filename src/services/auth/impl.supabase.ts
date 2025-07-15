'use server';
/**
 * @fileOverview Supabase implementation of the AuthService.
 * (This is a placeholder and is not fully implemented)
 */
import type { AuthService } from './auth';

async function login(input: any): Promise<any> {
  throw new Error('Supabase login not implemented.');
}

async function signup(input: any): Promise<any> {
  throw new Error('Supabase signup not implemented.');
}

async function logout(): Promise<void> {
  throw new Error('Supabase logout not implemented.');
}

async function getCurrentUser(): Promise<any> {
  throw new Error('Supabase getCurrentUser not implemented.');
}

export const supabaseAuthService: AuthService = {
    login,
    signup,
    logout,
    getCurrentUser,
};

// Default export for module resolution
module.exports = supabaseAuthService;
