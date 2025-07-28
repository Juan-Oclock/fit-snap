import { createClient } from '@supabase/supabase-js';
import { type AuthError, type Session, type User, type Provider } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
});

// Helper for user session
export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Helper for user ID
export const getUserId = async (): Promise<string | undefined> => {
  const session = await getSession();
  return session?.user?.id;
};

// Sign out
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  return await supabase.auth.signOut();
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { error };
};

// Sign in with OAuth provider
export const signInWithOAuth = async (provider: Provider): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Send magic link for passwordless authentication
export const sendMagicLink = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { error };
};
