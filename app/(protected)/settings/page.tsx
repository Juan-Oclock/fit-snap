'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, UserSettings, UserGoals } from '@/types';
import { getUserProfile, getUserSettings, getUserGoals, createUserProfile } from '@/lib/settings';
import ProfileForm from '@/components/ui/ProfileForm';
import UserSettingsForm from '@/components/ui/UserSettingsForm';
import DeleteAccountButton from '@/components/ui/DeleteAccountButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: userLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !userLoading) {
      loadUserData();
    }
  }, [user, userLoading]);

  const loadUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load profile, settings, and goals in parallel
      const [profileData, settingsData, goalsData] = await Promise.all([
        getUserProfile(user.id),
        getUserSettings(user.id),
        getUserGoals(user.id)
      ]);

      // If no profile exists, create one
      if (!profileData) {
        const created = await createUserProfile(user.id, {
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User'
        });
        if (created) {
          const newProfile = await getUserProfile(user.id);
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
      }

      setSettings(settingsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleSettingsUpdate = (updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
  };

  const handleGoalsUpdate = (updatedGoals: UserGoals) => {
    setGoals(updatedGoals);
  };

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="bg-primary hover:bg-primary-dark text-dark-900 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
      </div>
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <ProfileForm
          user={user}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
        
        {/* Workout Preferences */}
        <UserSettingsForm
          user={user}
          settings={settings}
          goals={goals}
          onSettingsUpdate={handleSettingsUpdate}
          onGoalsUpdate={handleGoalsUpdate}
        />
        
        {/* Account Actions */}
        <DeleteAccountButton user={user} />
      </div>
    </div>
  );
}
