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
    <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <h2 className="text-xl font-semibold text-white mb-6">Account Actions</h2>
      
      <div className="space-y-4">
        {/* Sign Out Button */}
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}>
          <div>
            <h3 className="text-sm font-medium text-white">Sign Out</h3>
            <p className="text-xs" style={{ color: '#979797' }}>Sign out of your account on this device</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="font-medium py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            style={{ backgroundColor: isSigningOut ? '#5E5E5E' : '#404040', color: '#FFFFFF', borderRadius: '8px' }}
            onMouseEnter={(e) => !isSigningOut && (e.currentTarget.style.backgroundColor = '#5E5E5E')}
            onMouseLeave={(e) => !isSigningOut && (e.currentTarget.style.backgroundColor = '#404040')}
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
        <div className="p-4" style={{ backgroundColor: '#1B1B1B', border: '1px solid #ef4444', borderRadius: '8px' }}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
            <div className="flex-1">
              <h3 className="text-sm font-medium" style={{ color: '#ef4444' }}>Danger Zone</h3>
              <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>
                Once you delete your account, there is no going back. This will permanently delete your profile, workouts, and all associated data.
              </p>
              
              {!showConfirmation ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="mt-3 font-medium py-2 px-4 transition-colors flex items-center text-sm"
                  style={{ backgroundColor: '#ef4444', color: '#FFFFFF', borderRadius: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="confirm-delete" className="block text-xs font-medium mb-1" style={{ color: '#ef4444' }}>
                      Type "DELETE" to confirm:
                    </label>
                    <input
                      id="confirm-delete"
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-3 py-2 text-white text-sm focus:outline-none"
                      style={{ backgroundColor: '#232323', border: '1px solid #ef4444', borderRadius: '8px' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#dc2626'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#ef4444'}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || confirmationText !== 'DELETE'}
                      className="font-medium py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                      style={{ backgroundColor: (isDeleting || confirmationText !== 'DELETE') ? '#5E5E5E' : '#ef4444', color: '#FFFFFF', borderRadius: '8px' }}
                      onMouseEnter={(e) => !(isDeleting || confirmationText !== 'DELETE') && (e.currentTarget.style.backgroundColor = '#dc2626')}
                      onMouseLeave={(e) => !(isDeleting || confirmationText !== 'DELETE') && (e.currentTarget.style.backgroundColor = '#ef4444')}
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
                      className="font-medium py-2 px-4 transition-colors text-sm"
                      style={{ backgroundColor: isDeleting ? '#5E5E5E' : '#404040', color: '#FFFFFF', borderRadius: '8px' }}
                      onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#5E5E5E')}
                      onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#404040')}
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
          <div className="p-3 text-sm" style={{
            backgroundColor: '#1B1B1B',
            border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
            borderRadius: '8px',
            color: message.type === 'success' ? '#22c55e' : '#ef4444'
          }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
