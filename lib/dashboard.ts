import { supabase } from './supabase';
import { Workout, Quote, WorkoutSet } from '@/types';
import { getRemainingDaysInMonth } from './date-utils';

// Get user's monthly workout goal (default to 12 if not set)
// Automatically caps the goal to remaining days in the current month
export async function getUserGoal(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('monthly_workout_target')
    .eq('user_id', userId)
    .single();
  
  const remainingDays = getRemainingDaysInMonth();
  const storedGoal = data?.monthly_workout_target || 12;
  
  // Cap the goal to remaining days in the month
  return Math.min(storedGoal, remainingDays);
}

// Get current month's workout count for user
export async function getMonthlyWorkoutCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { data, error } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .gte('completed_at', startOfMonth.toISOString())
    .lte('completed_at', endOfMonth.toISOString());
  
  if (error) {
    console.error('Error fetching monthly workout count:', error);
    return 0;
  }
  
  return data?.length || 0;
}

// Get workout days for current month (for calendar highlighting)
export async function getWorkoutDays(userId: string): Promise<number[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { data, error } = await supabase
    .from('workouts')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', startOfMonth.toISOString())
    .lte('completed_at', endOfMonth.toISOString());
  
  if (error) {
    console.error('Error fetching workout days:', error);
    return [];
  }
  
  return data?.map(workout => new Date(workout.completed_at).getDate()) || [];
}

// Get top 3 personal records for user calculated from workout history
export async function getPersonalRecords(userId: string): Promise<Array<{exercise_name: string, weight: number, reps: number}>> {
  // console.log('🏆 Dashboard getPersonalRecords called for userId:', userId);
  
  try {
    // Get all workout sets with weights for this user
    const { data, error } = await supabase
      .from('workout_sets')
      .select(`
        id,
        reps,
        weight,
        created_at,
        workout_exercises!inner(
          exercises!inner(name),
          workouts!inner(
            user_id,
            completed_at
          )
        )
      `)
      .eq('workout_exercises.workouts.user_id', userId)
      .not('weight', 'is', null)
      .gt('weight', 0)
      .order('weight', { ascending: false });

    // console.log('📊 Dashboard PR query result:', { dataLength: data?.length, error });

    if (error) {
      console.error('❌ Error fetching workout-based personal records:', error);
      return [];
    }

    if (!data || data.length === 0) {
      // console.log('❌ No workout data found, returning empty array');
      return [];
    }

    // Group by exercise and find the best set for each
    const exerciseRecords = new Map<string, any>();
    
    data.forEach((set: any) => {
      const exerciseName = set.workout_exercises?.exercises?.name;
      
      if (!exerciseName || !set.weight) return;
      
      const currentBest = exerciseRecords.get(exerciseName);
      
      // Compare by weight first, then by reps if weight is equal
      if (!currentBest || 
          set.weight > currentBest.weight || 
          (set.weight === currentBest.weight && set.reps > currentBest.reps)) {
        exerciseRecords.set(exerciseName, {
          exercise_name: exerciseName,
          weight: parseFloat(set.weight) || 0,
          reps: set.reps || 0
        });
      }
    });

    // Convert to array and sort by weight descending, limit to top 3
    const personalRecords = Array.from(exerciseRecords.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    // console.log('✅ Dashboard personal records found:', personalRecords);
    
    return personalRecords;
    
  } catch (error) {
    console.error('❌ Error calculating personal records from workouts:', error);
    return [];
  }
}

// Get recent workouts (last 3)
export async function getRecentWorkouts(userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('Error fetching recent workouts:', error);
    return [];
  }
  
  return data || [];
}

// Get a random daily quote
export async function getDailyQuote(): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('random()')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching daily quote:', error);
    return null;
  }
  
  return data;
}

// Check if user has set a goal
export async function hasUserSetGoal(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  return !error && !!data;
}

// Format duration from seconds to readable format
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
