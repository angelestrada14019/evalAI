/**
 * @fileOverview This file defines the common types used by the auth service implementations.
 */
import { z } from 'zod';

// Base User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
});
export type User = z.infer<typeof UserSchema>;

// Login Types
export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const LoginOutputSchema = z.object({
  user: UserSchema,
  token: z.string(),
});
export type LoginOutput = z.infer<typeof LoginOutputSchema>;

// SignUp Types
export const SignUpInputSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});
export type SignUpInput = z.infer<typeof SignUpInputSchema>;

export const SignUpOutputSchema = z.object({
    user: UserSchema,
    token: z.string(),
});
export type SignUpOutput = z.infer<typeof SignUpOutputSchema>;

// GetCurrentUser Types
export const GetCurrentUserOutputSchema = z.object({
    user: UserSchema.nullable(),
});
export type GetCurrentUserOutput = z.infer<typeof GetCurrentUserOutputSchema>;
