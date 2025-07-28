'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/lib/settings';
import { Trash2, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useRouter } from 'next/navigation';

interface DeleteAccountButtonProps {
  user: User;
}

export default function DeleteAccountButton({ user }: DeleteAccountButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setMessage(null);

    try {
      const success = await signOut();
      if (success) {
        router.push('/login');
      } else {
        setMessage({ type: 'error', text: 'Failed to sign out' });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage({ type: 'error', text: 'Failed to sign out' });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type "DELETE" to confirm' });
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      // Note: Account deletion via Supabase client is limited
      // In a real app, this would typically be handled via a server-side function
      // For now, we'll show a message about contacting support
      setMessage({ 
        type: 'error', 
        text: 'Account deletion must be handled by support. Please contact us to delete your account.' 
      });
      
      // Alternative: Sign out the user as a temporary measure
      // await signOut();
      // router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationText('');
    setMessage(null);
  };

  // Auto-hide messages after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Account Actions</h2>
      
      <div className="space-y-4">
        {/* Sign Out Button */}
        <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg border border-dark-600">
          <div>
            <h3 className="text-sm font-medium text-gray-200">Sign Out</h3>
            <p className="text-xs text-gray-400">Sign out of your account on this device</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="bg-gray-600 hover:bg-gray-700 text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSigningOut ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Signing Out...</span>
              </>
            ) : (
              'Sign Out'
            )}
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-700">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-200">Danger Zone</h3>
              <p className="text-xs text-red-300 mt-1">
                Once you delete your account, there is no going back. This will permanently delete your profile, workouts, and all associated data.
              </p>
              
              {!showConfirmation ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="confirm-delete" className="block text-xs font-medium text-red-200 mb-1">
                      Type "DELETE" to confirm:
                    </label>
                    <input
                      id="confirm-delete"
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-3 py-2 bg-dark-700 border border-red-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || confirmationText !== 'DELETE'}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                      {isDeleting ? (
                        <>
                          <LoadingSpinner />
                          <span className="ml-2">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Forever
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={resetConfirmation}
                      disabled={isDeleting}
                      className="bg-gray-600 hover:bg-gray-700 text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-900 border border-green-700 text-green-200' 
              : 'bg-red-900 border border-red-700 text-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
