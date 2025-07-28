'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function MagicErrorPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    console.log('Magic error page loaded');
    console.log('URL params:', window.location.search);
    console.log('URL hash:', window.location.hash);
  }, []);
  
  // Get error details from URL
  const errorCode = searchParams.get('error_code') || '';
  const errorDescription = searchParams.get('error_description') 
    ? decodeURIComponent(searchParams.get('error_description') || '')
    : 'The magic link is invalid or has expired';
    
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 p-4" 
         style={{ backgroundColor: '#121212', color: '#fff' }}>
      <div className="bg-dark-800 rounded-lg p-8 shadow-lg max-w-md w-full">
        <div className="bg-red-500/20 text-red-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white text-center mb-4">Authentication Error</h2>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6">
          {errorCode === 'otp_expired' 
            ? 'Your magic link has expired. Please request a new one.' 
            : errorDescription}
        </div>
        <div className="flex justify-center">
          <Link 
            href="/login"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-6 rounded-md transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
