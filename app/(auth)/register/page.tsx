'use client';

import { useState } from 'react';
import { sendMagicLink } from '@/lib/supabase';
import Link from 'next/link';
import { FiMail } from 'react-icons/fi';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // For Supabase magic links, the registration and login flow are the same
      // The first time a user signs in, they are registered
      const { error: authError } = await sendMagicLink(email);
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 px-4">
      <div className="flex items-center mb-8">
        <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-2">F</div>
        <h1 className="text-2xl font-bold text-white">FitSnap</h1>
      </div>
      
      <div className="w-full max-w-md">
        {success ? (
          <div className="bg-dark-800 rounded-lg p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="bg-yellow-500 text-dark-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail size={32} />
              </div>
              <h2 className="text-xl font-bold text-white">Check your inbox</h2>
              <p className="text-gray-300 mt-2">
                We've sent a magic link to <strong>{email}</strong>
              </p>
            </div>
            <p className="text-gray-400 text-sm text-center mt-6">
              Didn't receive an email? Check your spam folder or{' '}
              <button 
                onClick={() => setSuccess(false)} 
                className="text-yellow-500 hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold text-white text-center mb-6">Create your account</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleRegister} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-md transition ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <FiMail />
                {isLoading ? 'Sending...' : 'Sign up with email'}
              </button>
            </form>
            
            <p className="text-gray-300 text-sm mb-6">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-yellow-500 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-yellow-500 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            
            <p className="text-gray-400 text-sm text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
