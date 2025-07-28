'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MagicLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Magic page loaded - checking auth');
        console.log('Current URL:', window.location.href);
        
        // Check for hash fragment with tokens
        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          console.log('Hash fragment:', hash ? hash : 'none');
          
          if (hash && hash.includes('access_token=')) {
            console.log('Found access_token in hash fragment');
            // Extract hash without the # character
            const hashParams = new URLSearchParams(
              hash.substring(1) // Remove the # character
            );
            
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
              console.log('Found both access and refresh tokens');
              // Set the session manually
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                console.error('Error setting session:', sessionError.message);
                throw new Error(sessionError.message);
              }
              
              // Get the user to verify authentication worked
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              console.log('User after setting session:', user ? user.email : 'No user');
              
              if (userError || !user) {
                console.error('Error getting user:', userError?.message);
                throw new Error(userError?.message || 'Failed to get user data');
              }
              
              // Redirect to dashboard on successful auth
              console.log('Authentication successful, redirecting to dashboard');
              router.push('/dashboard');
              return;
            } else {
              console.error('Missing tokens in hash fragment');
            }
          }
          
          // Handle any codes in the URL
          const code = searchParams.get('code');
          console.log('Auth code in URL:', code ? 'present' : 'none');
          
          if (code) {
            console.log('Exchanging code for session...');
            const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (codeError) {
              console.error('Error exchanging code:', codeError.message);
              throw new Error(codeError.message);
            }
            
            console.log('Code exchange result:', data ? 'success' : 'no data');
            
            // Check if we got a session
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Session after code exchange:', session ? 'present' : 'none');
            
            if (session) {
              console.log('Authentication successful, redirecting to dashboard');
              router.push('/dashboard');
              return;
            } else {
              console.error('No session created after code exchange');
              throw new Error('No session created after code exchange');
            }
          }
          
          // Check if we already have a valid session
          console.log('Checking for existing session...');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('Already have valid session, redirecting to dashboard');
            router.push('/dashboard');
            return;
          }
          
          console.error('No authentication tokens or code found in URL');
          setError('No authentication tokens or code found in URL');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };
    
    handleAuth();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 p-4" 
           style={{ backgroundColor: '#121212', color: '#fff' }}>
        <div className="bg-dark-800 rounded-lg p-8 shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-white text-center mb-4">Authentication Error</h2>
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-md"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900" 
         style={{ backgroundColor: '#121212', color: '#fff' }}>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-bold text-white mt-4">Authenticating...</h2>
        <p className="text-gray-300 mt-2">Please wait while we log you in</p>
      </div>
    </div>
  );
}
