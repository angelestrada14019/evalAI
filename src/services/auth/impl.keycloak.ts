'use server';
/**
 * @fileOverview Keycloak implementation of the AuthService.
 * (This is a placeholder and is not fully implemented)
 */
import type { LoginInput, SignUpInput } from './types';


export async function login(input: LoginInput): Promise<any> {
  throw new Error('Keycloak login not implemented.');
}

export async function signup(input: SignUpInput): Promise<any> {
  throw new Error('Keycloak signup not implemented.');
}

export async function logout(): Promise<void> {
  throw new Error('Keycloak logout not implemented.');
}

export async function getCurrentUser(): Promise<any> {
  throw new Error('Keycloak getCurrentUser not implemented.');
}
