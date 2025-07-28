'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Hook to handle magic link authentication directly in any client component
 */
export function useMagicLinkHandler() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    // Don't run if we're already on the dashboard
    if (window.location.pathname === '/dashboard') return;

    // Set a timeout to detect if auth is taking too long
    const authTimeout = setTimeout(() => {
      console.log('Authentication timed out after 8 seconds');
      setAuthError('Authentication timed out. Please try again.');
      setIsLoading(false);
    }, 8000);

    // Function to handle the authentication
    const handleMagicLinkAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Checking for authentication tokens...');
        
        // First check the hash for tokens (magic link format)
        const hash = window.location.hash;
        console.log('Current URL:', window.location.href);
        console.log('Hash fragment:', hash || 'none');
        
        if (hash && hash.includes('access_token=')) {
          console.log('Magic link tokens found in URL hash');
          
          // Parse the hash (remove the # character)
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('Setting session from tokens');
            // Set the session manually with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Error setting session:', error.message);
              setAuthError(`Error setting session: ${error.message}`);
              setIsLoading(false);
              clearTimeout(authTimeout);
              return;
            }
            
            if (data?.session) {
              console.log('Session established, redirecting to dashboard');
              // Replace URL to remove the hash
              window.history.replaceState(null, '', window.location.pathname);
              
              // Force hard navigation to dashboard to ensure fresh state
              clearTimeout(authTimeout);
              window.location.href = '/dashboard';
              return;
            } else {
              console.error('No session data returned after setting session');
              setAuthError('Authentication failed: No session created');
              setIsLoading(false);
              clearTimeout(authTimeout);
              return;
            }
          } else {
            console.error('Missing required tokens in hash');
            setAuthError('Authentication failed: Missing required tokens');
            setIsLoading(false);
            clearTimeout(authTimeout);
            return;
          }
        }
        
        // If we didn't find tokens in hash, check if we already have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Valid session found, redirecting to dashboard');
          clearTimeout(authTimeout);
          window.location.href = '/dashboard';
          return;
        }
        
        // If we get here, no auth tokens found and no session exists
        console.log('No authentication tokens or session found');
        setIsLoading(false);
        clearTimeout(authTimeout);
      } catch (err) {
        console.error('Error handling magic link auth:', err);
        setAuthError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
        clearTimeout(authTimeout);
      }
    };
    
    handleMagicLinkAuth();
    
    return () => {
      clearTimeout(authTimeout);
    };
  }, [router]);
  
  return { authError, isLoading };
}

/**
 * Component that can be added to pages to handle magic link authentication
 */
export default function MagicLinkHandler() {
  const { authError, isLoading } = useMagicLinkHandler();
  
  // Only render something if actively processing auth or if there's an error
  if (!isLoading && !authError) return null;
  
  return (
    <div className="fixed inset-0 bg-dark-900 bg-opacity-90 flex flex-col items-center justify-center z-50 p-4" 
         style={{ backgroundColor: 'rgba(18, 18, 18, 0.95)' }}>
      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Authenticating...</h2>
          <p className="text-gray-300">Please wait while we log you in</p>
        </div>
      ) : authError ? (
        <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Authentication Error</h2>
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6">
            {authError}
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
            >
              Back to Login
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
