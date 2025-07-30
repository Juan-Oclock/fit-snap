import { supabase } from './supabase';
import { uploadProgressPhoto } from './progress';

export interface OnboardingStatus {
  has_set_goal: boolean;
  has_uploaded_photo: boolean;
  has_completed_workout: boolean;
  onboarding_completed: boolean;
}

/**
 * Check if user needs onboarding by examining their activity
 */
export async function checkOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  try {
    // Check if user has set a goal
    const { data: goals } = await supabase
      .from('user_goals')
      .select('monthly_workout_target')
      .eq('user_id', userId)
      .single();

    // Check if user has uploaded a before photo
    const { data: photos } = await supabase
      .from('progress_photos')
      .select('id')
      .eq('user_id', userId)
      .eq('photo_type', 'before')
      .limit(1);

    // Check if user has completed any workouts
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    // Determine onboarding completion based on user activity
    // (No need to query profiles table for onboarding_completed since column doesn't exist)
    const hasSetGoal = !!goals?.monthly_workout_target;
    const hasUploadedPhoto = !!photos && photos.length > 0;
    const hasCompletedWorkout = !!workouts && workouts.length > 0;
    
    // Consider onboarding completed if user has done at least 2 of the 3 key actions
    const completedActions = [hasSetGoal, hasUploadedPhoto, hasCompletedWorkout].filter(Boolean).length;
    const onboardingCompleted = completedActions >= 2;

    const status: OnboardingStatus = {
      has_set_goal: hasSetGoal,
      has_uploaded_photo: hasUploadedPhoto,
      has_completed_workout: hasCompletedWorkout,
      onboarding_completed: onboardingCompleted
    };

    return status;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    // Return default status if there's an error
    return {
      has_set_goal: false,
      has_uploaded_photo: false,
      has_completed_workout: false,
      onboarding_completed: false
    };
  }
}

/**
 * Mark onboarding as completed for the user
 */
export async function completeOnboarding(userId: string): Promise<boolean> {
  // Since onboarding completion is now determined by user activity,
  // we don't need to update any database records.
  // Just return true to indicate the onboarding flow is complete.
  console.log('Onboarding marked as completed for user:', userId);
  return true;
}

/**
 * Determine if user should see onboarding flow
 */
export function shouldShowOnboarding(status: OnboardingStatus): boolean {
  // Show onboarding if user hasn't explicitly completed it AND
  // they haven't done at least 2 of the 3 key actions
  if (status.onboarding_completed) {
    return false;
  }

  const completedActions = [
    status.has_set_goal,
    status.has_uploaded_photo,
    status.has_completed_workout
  ].filter(Boolean).length;

  return completedActions < 2;
}
