import { supabase } from './supabaseClient';
import type { Profile, Role } from './types';

export const ADMIN_ACCESS_CODE = 'QUEUELESS-ADMIN';

export async function signUp(email: string, password: string, fullName: string, role: 'customer' | 'admin' = 'customer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function friendlyAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (message.includes('already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.toLowerCase().includes('password')) {
    return 'Password must be at least 6 characters.';
  }
  if (message.includes('valid email')) {
    return 'Please enter a valid email address.';
  }
  return message;
}

export type { Role };
