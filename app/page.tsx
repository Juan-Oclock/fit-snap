'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  // Add CSS class directly to body to ensure styles apply
  useEffect(() => {
    document.body.classList.add('dark:bg-dark-900');
    return () => document.body.classList.remove('dark:bg-dark-900');
  }, []);
  return (
    <div className="min-h-screen bg-dark-900 text-white" style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-yellow-500">FitSnap</h1>
          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 transition-colors">
              Sign Up
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Track Your Fitness Journey <span className="text-yellow-500">Visually</span>
              </h2>
              <p className="text-lg text-gray-300">
                FitSnap helps you track workouts, measure progress with photos, and stay motivated
                with a supportive community.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="px-4 py-3 rounded-md bg-yellow-500 text-black font-medium hover:bg-yellow-600 transition-colors text-center">
                  Get Started
                </Link>
                <button className="px-4 py-3 rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            <div className="md:w-1/2 bg-dark-800 rounded-xl p-6 aspect-[4/3]">
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-gray-500">App Screenshot Placeholder</p>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors border border-dark-700">
              <div className="text-yellow-500 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-300">
                Log workouts, track PRs, and see your improvement over time with easy-to-read charts.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors border border-dark-700">
              <div className="text-yellow-500 text-3xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Visual Tracking</h3>
              <p className="text-gray-300">
                Upload before and after photos to visually track your transformation journey.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors border border-dark-700">
              <div className="text-yellow-500 text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-300">
                Connect with others, share achievements, and stay motivated with community features.
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-24 border-t border-dark-700 pt-8 text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 FitSnap. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-yellow-500">Privacy</a>
              <a href="#" className="hover:text-yellow-500">Terms</a>
              <a href="#" className="hover:text-yellow-500">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
