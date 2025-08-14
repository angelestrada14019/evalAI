'use client';
/**
 * @fileOverview Supabase implementation of the AuthService.
 */
import { supabase } from '@/lib/supabase/client';
import type { LoginInput, SignUpInput } from './types';

export async function login(input: LoginInput): Promise<any> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from login');
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Could not fetch user profile:', profileError.message);
    }

    return {
      user: data.user,
      session: data.session,
      profile: userProfile,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function signup(input: SignUpInput): Promise<any> {
  try {
    // First, create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    // Create user profile in our users table
    // We'll use a default tenant for now - in a real app, this would be determined by the signup flow
    const defaultTenantId = 'default-tenant';
    
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        tenant_id: defaultTenantId,
        email: input.email,
        first_name: input.name.split(' ')[0] || input.name,
        last_name: input.name.split(' ').slice(1).join(' ') || null,
        role: 'admin', // First user becomes admin
        status: 'active',
        permissions: [
          'evaluations.create',
          'evaluations.edit',
          'evaluations.delete',
          'evaluations.view',
          'evaluations.publish',
          'reports.create',
          'reports.edit',
          'reports.view',
          'reports.export',
          'contacts.create',
          'contacts.edit',
          'contacts.import',
          'contacts.export',
          'contacts.delete',
          'users.invite',
          'users.manage',
          'tenant.settings',
          'tenant.branding'
        ],
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't throw here as the auth user was created successfully
    }

    return {
      user: data.user,
      session: data.session,
      profile: userProfile,
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<any> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Could not fetch user profile:', profileError.message);
    }

    return {
      user,
      profile: userProfile,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Helper function to get the current session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Helper function to listen to auth changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
