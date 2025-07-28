import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase, getSession } from '@/lib/supabase';

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // In a real app, we'd check a specific role or field in the user data
  // For now, we'll just use a placeholder implementation
  const isAdmin = Boolean(user?.app_metadata?.is_admin || user?.email?.endsWith('@fitsnap.com'));

  useEffect(() => {
    async function loadUser() {
      try {
        const session = await getSession();
        setUser(session?.user || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load user'));
      } finally {
        setLoading(false);
      }
    }

    // Load the user on mount
    loadUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error, isAdmin };
}
