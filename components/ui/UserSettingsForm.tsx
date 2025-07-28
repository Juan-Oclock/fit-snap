'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserSettings, UserGoals } from '@/types';
import { updateUserSettings, updateUserGoals } from '@/lib/settings';
import { getRemainingDaysInMonth, getRemainingDaysMessage } from '@/lib/date-utils';
import Toggle from './Toggle';
import Slider from './Slider';
import LoadingSpinner from './LoadingSpinner';

interface UserSettingsFormProps {
  user: User;
  settings: UserSettings | null;
  goals: UserGoals | null;
  onSettingsUpdate: (settings: UserSettings) => void;
  onGoalsUpdate: (goals: UserGoals) => void;
}

export default function UserSettingsForm({ 
  user, 
  settings, 
  goals, 
  onSettingsUpdate, 
  onGoalsUpdate 
}: UserSettingsFormProps) {
  const remainingDays = getRemainingDaysInMonth();
  const remainingDaysMessage = getRemainingDaysMessage();
  
  const [formData, setFormData] = useState({
    default_rest_seconds: settings?.default_rest_seconds || 60,
    notifications_enabled: settings?.notifications_enabled ?? true,
    community_sharing_enabled: settings?.community_sharing_enabled ?? false,
    monthly_workout_target: Math.min(goals?.monthly_workout_target || 12, remainingDays)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRestTimeChange = (value: number) => {
    setFormData(prev => ({ ...prev, default_rest_seconds: value }));
  };

  const handleNotificationsChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, notifications_enabled: checked }));
  };

  const handleCommunityChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, community_sharing_enabled: checked }));
  };

  const handleGoalChange = (value: number) => {
    // Ensure the value doesn't exceed remaining days
    const adjustedValue = Math.min(value, remainingDays);
    setFormData(prev => ({ ...prev, monthly_workout_target: adjustedValue }));
  };

  const formatRestTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
  };

  const formatGoal = (count: number) => {
    return `${count} workout${count !== 1 ? 's' : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Update settings
      const settingsSuccess = await updateUserSettings(user.id, {
        default_rest_seconds: formData.default_rest_seconds,
        notifications_enabled: formData.notifications_enabled,
        community_sharing_enabled: formData.community_sharing_enabled
      });

      // Update goals
      const goalsSuccess = await updateUserGoals(user.id, {
        monthly_workout_target: formData.monthly_workout_target
      });

      if (settingsSuccess && goalsSuccess) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        
        // Update parent components
        onSettingsUpdate({
          id: settings?.id || '',
          user_id: user.id,
          default_rest_seconds: formData.default_rest_seconds,
          theme: settings?.theme || 'dark',
          notifications_enabled: formData.notifications_enabled,
          community_sharing_enabled: formData.community_sharing_enabled,
          created_at: settings?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        onGoalsUpdate({
          id: goals?.id || '',
          user_id: user.id,
          monthly_workout_target: formData.monthly_workout_target,
          created_at: goals?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings' });
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
    <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Workout Preferences</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rest Timer Setting */}
        <div>
          <Slider
            id="rest-timer"
            label="Default Rest Timer"
            description="How long to rest between sets by default"
            value={formData.default_rest_seconds}
            onChange={handleRestTimeChange}
            min={15}
            max={300}
            step={15}
            formatValue={formatRestTime}
          />
        </div>

        {/* Monthly Goal Setting */}
        <div>
          <Slider
            id="monthly-goal"
            label="Monthly Workout Goal"
            description={`${remainingDaysMessage} - Set your goal for the remaining days`}
            value={formData.monthly_workout_target}
            onChange={handleGoalChange}
            min={1}
            max={remainingDays}
            step={1}
            formatValue={formatGoal}
          />
          {remainingDays <= 7 && (
            <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ Limited time left! You can set a maximum of {remainingDays} workout{remainingDays !== 1 ? 's' : ''} for the remaining days.
              </p>
            </div>
          )}
        </div>

        {/* Notifications Toggle */}
        <div>
          <Toggle
            id="notifications"
            label="Workout Reminders"
            description="Get notified to stay on track with your fitness goals"
            checked={formData.notifications_enabled}
            onChange={handleNotificationsChange}
          />
        </div>

        {/* Community Sharing Toggle */}
        <div>
          <Toggle
            id="community-sharing"
            label="Community Sharing"
            description="Allow others to see your workouts and progress"
            checked={formData.community_sharing_enabled}
            onChange={handleCommunityChange}
          />
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-dark-900 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </form>
    </div>
  );
}
