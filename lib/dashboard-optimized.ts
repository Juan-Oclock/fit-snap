import { supabase } from './supabase';
import { Workout, WorkoutWithExercises, Quote, WorkoutSet } from '@/types';
import { getRemainingDaysInMonth } from './date-utils';
import { apiCache } from './performance';

// Optimized dashboard data fetching with caching and batching
export async function getDashboardData(userId: string) {
  const cacheKey = `dashboard-${userId}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Batch all dashboard queries into a single optimized call
    const [
      goalData,
      workoutStats,
      personalRecords,
      recentWorkouts,
      profileData
    ] = await Promise.all([
      getUserGoalOptimized(userId),
      getWorkoutStatsOptimized(userId),
      getPersonalRecordsOptimized(userId),
      getRecentWorkoutsOptimized(userId),
      getUserProfileOptimized(userId)
    ]);

    const dashboardData = {
      goal: goalData.goal,
      hasGoal: goalData.hasGoal,
      monthlyWorkouts: workoutStats.monthlyCount,
      workoutDays: workoutStats.workoutDays,
      personalRecords,
      recentWorkouts,
      userProfile: profileData
    };

    // Cache for 2 minutes
    apiCache.set(cacheKey, dashboardData, 2);
    
    return dashboardData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// Optimized goal fetching
async function getUserGoalOptimized(userId: string) {
  const { data, error } = await supabase
    .from('user_goals')
    .select('monthly_workout_target')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid errors

  const remainingDays = getRemainingDaysInMonth();
  const storedGoal = data?.monthly_workout_target || 12;
  const goal = Math.min(storedGoal, remainingDays);

  return {
    goal,
    hasGoal: !!data
  };
}

// Optimized workout stats (combines monthly count and workout days)
async function getWorkoutStatsOptimized(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from('workouts')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', startOfMonth.toISOString())
    .lte('completed_at', endOfMonth.toISOString())
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching workout stats:', error);
    return { monthlyCount: 0, workoutDays: [] };
  }

  const workoutDays = (data || []).map(workout => {
    const date = new Date(workout.completed_at);
    return date.getDate();
  });

  // Remove duplicates for workout days
  const uniqueWorkoutDays = [...new Set(workoutDays)];

  return {
    monthlyCount: data?.length || 0,
    workoutDays: uniqueWorkoutDays
  };
}

// Type for personal records query result
type PersonalRecordSet = {
  weight: number;
  reps: number;
  workout_exercises: {
    exercises: {
      name: string;
    }[];
  }[];
  workouts: {
    user_id: string;
  }[];
};

// Optimized personal records with better query
async function getPersonalRecordsOptimized(userId: string) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select(`
      weight,
      reps,
      workout_exercises!inner(
        exercises!inner(name)
      ),
      workouts!inner(user_id)
    `)
    .eq('workouts.user_id', userId)
    .not('weight', 'is', null)
    .order('weight', { ascending: false })
    .limit(50); // Limit to reduce data transfer

  if (error) {
    console.error('Error fetching personal records:', error);
    return [];
  }

  // Process data to get top records per exercise
  const exerciseRecords = new Map();
  
  (data as PersonalRecordSet[] || []).forEach(set => {
    const exerciseName = set.workout_exercises?.[0]?.exercises?.[0]?.name;
    if (!exerciseName) return;

    const key = exerciseName;
    const currentRecord = exerciseRecords.get(key);
    
    if (!currentRecord || set.weight > currentRecord.weight) {
      exerciseRecords.set(key, {
        exercise_name: exerciseName,
        weight: set.weight,
        reps: set.reps
      });
    }
  });

  return Array.from(exerciseRecords.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

// Optimized recent workouts with selective data loading
async function getRecentWorkoutsOptimized(userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      id,
      completed_at,
      duration,
      photo_url,
      workout_exercises(
        exercises(name),
        workout_sets(reps, weight)
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching recent workouts:', error);
    return [];
  }

  return (data || []).map(workout => ({
    ...workout,
    workout_exercises: workout.workout_exercises || []
  }));
}

// Optimized user profile fetching
async function getUserProfileOptimized(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('username, avatar_url')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Cache invalidation functions
export function invalidateDashboardCache(userId: string) {
  apiCache.delete(`dashboard-${userId}`);
}

export function invalidateAllUserCache(userId: string) {
  // Clear all cache entries for this user
  const keys = [`dashboard-${userId}`, `progress-${userId}`, `workouts-${userId}`];
  keys.forEach(key => apiCache.delete(key));
}

// Legacy functions for backward compatibility (now optimized)
export async function getUserGoal(userId: string): Promise<number> {
  const data = await getDashboardData(userId);
  return data.goal;
}

export async function getMonthlyWorkoutCount(userId: string): Promise<number> {
  const data = await getDashboardData(userId);
  return data.monthlyWorkouts;
}

export async function getWorkoutDays(userId: string): Promise<number[]> {
  const data = await getDashboardData(userId);
  return data.workoutDays;
}

export async function getPersonalRecords(userId: string) {
  const data = await getDashboardData(userId);
  return data.personalRecords;
}

export async function getRecentWorkouts(userId: string): Promise<WorkoutWithExercises[]> {
  const data = await getDashboardData(userId);
  return data.recentWorkouts;
}

export async function hasUserSetGoal(userId: string): Promise<boolean> {
  const data = await getDashboardData(userId);
  return data.hasGoal;
}

// Keep other utility functions unchanged
export async function getDailyQuote(): Promise<Quote | null> {
  const cacheKey = 'daily-quote';
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .limit(1)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching daily quote:', error);
    return null;
  }

  const quote = data?.[0] || null;
  
  // Cache quotes for 1 hour
  apiCache.set(cacheKey, quote, 60);
  
  return quote;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
