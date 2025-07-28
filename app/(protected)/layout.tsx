'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { NavigationGuardProvider } from '@/contexts/NavigationGuardContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen bg-dark-900 items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-yellow-500/20 h-10 w-10 rounded-full mb-4"></div>
          <div className="h-4 bg-dark-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Don't render the protected content if there's no user
  if (!user) {
    return null;
  }

  return (
    <NavigationGuardProvider>
      <div className="flex h-screen bg-dark-900">
        <Sidebar />
        <main className="flex-1 p-6 md:pl-6 md:ml-64 pb-20 md:pb-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto pt-16 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </NavigationGuardProvider>
  );
}
