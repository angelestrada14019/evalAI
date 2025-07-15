'use server';
/**
 * @fileOverview Azure B2C implementation of the AuthService.
 * (This is a placeholder and is not fully implemented)
 */
import type { LoginInput, SignUpInput } from './types';

export async function login(input: LoginInput): Promise<any> {
  throw new Error('Azure B2C login not implemented.');
}

export async function signup(input: SignUpInput): Promise<any> {
  throw new Error('Azure B2C signup not implemented.');
}

export async function logout(): Promise<void> {
  throw new Error('Azure B2C logout not implemented.');
}

export async function getCurrentUser(): Promise<any> {
  throw new Error('Azure B2C getCurrentUser not implemented.');
}
