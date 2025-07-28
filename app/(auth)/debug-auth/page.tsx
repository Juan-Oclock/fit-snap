'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [urlInfo, setUrlInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Get URL info
      const urlData = {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        searchParams: Object.fromEntries(new URLSearchParams(window.location.search)),
        hashParams: window.location.hash ? Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))) : {}
      };
      
      setAuthInfo({ session: !!session, error, user: session?.user });
      setUrlInfo(urlData);
    };
    
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 p-4" style={{ backgroundColor: '#121212', color: '#fff' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <pre className="text-sm bg-dark-700 p-4 rounded overflow-auto">
              {JSON.stringify(authInfo, null, 2)}
            </pre>
          </div>
          
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">URL Information</h2>
            <pre className="text-sm bg-dark-700 p-4 rounded overflow-auto">
              {JSON.stringify(urlInfo, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <Link 
            href="/login" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
          >
            Back to Login
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Dashboard
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
