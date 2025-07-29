'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import { updateUserProfile } from '@/lib/settings';
import { UserIcon } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';

interface ProfileFormProps {
  user: User;
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export default function ProfileForm({ user, profile, onProfileUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const success = await updateUserProfile(user.id, {
        username: formData.username.trim() || undefined,
        full_name: formData.full_name.trim() || undefined
      });

      if (success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update the profile in parent component
        onProfileUpdate({
          id: user.id,
          username: formData.username.trim() || undefined,
          full_name: formData.full_name.trim() || undefined,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide messages after 3 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <UserAvatar 
            name={formData.full_name || undefined}
            username={formData.username || undefined}
            size="xl"
          />
          
          <div>
            <p className="text-sm font-medium text-white">Profile Picture</p>
            <p className="text-xs" style={{ color: '#979797' }}>Auto-generated from your name</p>
            <p className="text-xs" style={{ color: '#5E5E5E' }}>Consistent gray styling for all users</p>
          </div>
        </div>

        {/* Full Name Field - Hidden per user request */}
        {/* <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-200 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Used for your avatar initials and display name</p>
        </div> */}

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            className="w-full px-3 py-2 text-white focus:outline-none" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#FFFC74'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#404040'}
          />
          <p className="text-xs mt-1" style={{ color: '#979797' }}>This will be displayed to other users</p>
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email || ''}
            readOnly
            className="w-full px-3 py-2 cursor-not-allowed" style={{ backgroundColor: '#5E5E5E', border: '1px solid #404040', borderRadius: '8px', color: '#979797' }}
          />
          <p className="text-xs mt-1" style={{ color: '#979797' }}>Email cannot be changed</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="p-3 text-sm" style={{
            backgroundColor: message.type === 'success' ? '#1B1B1B' : '#1B1B1B',
            border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
            borderRadius: '8px',
            color: message.type === 'success' ? '#22c55e' : '#ef4444'
          }}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-medium py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{ backgroundColor: isLoading ? '#5E5E5E' : '#FFFC74', color: '#000000', borderRadius: '8px' }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#fef9c3')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#FFFC74')}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}
