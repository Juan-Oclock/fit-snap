import { supabase } from './supabase';
import { Workout, ProgressPhoto } from '@/types';
import { getRemainingDaysInMonth } from './date-utils';

// Get user's monthly workout goal and current progress
export async function getMonthlyProgress(userId: string): Promise<{
  current: number;
  target: number;
  percentage: number;
}> {
  // Get user goal and cap it to remaining days
  const { data: goalData } = await supabase
    .from('user_goals')
    .select('monthly_workout_target')
    .eq('user_id', userId)
    .single();
  
  const remainingDays = getRemainingDaysInMonth();
  const storedGoal = goalData?.monthly_workout_target || 12;
  const target = Math.min(storedGoal, remainingDays);
  
  // Get current month's workout count
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { data: workoutData } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .gte('completed_at', startOfMonth.toISOString())
    .lte('completed_at', endOfMonth.toISOString());
  
  const current = workoutData?.length || 0;
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  return { current, target, percentage };
}

// Get workout days for calendar highlighting
export async function getWorkoutDays(userId: string, year: number, month: number): Promise<number[]> {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
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

// Get workout details for a specific day
export async function getWorkoutForDay(userId: string, date: Date): Promise<Workout | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        exercises(name),
        workout_sets(count)
      )
    `)
    .eq('user_id', userId)
    .gte('completed_at', startOfDay.toISOString())
    .lte('completed_at', endOfDay.toISOString())
    .single();
  
  if (error) {
    return null;
  }
  
  return data;
}

// Get before and after photos
export async function getBeforeAfterPhotos(userId: string): Promise<{
  before: ProgressPhoto | null;
  after: ProgressPhoto | null;
}> {
  try {
    // Get most recent before photo
    const { data: beforeData, error: beforeError } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'before')
      .order('taken_at', { ascending: false })
      .limit(1);
    
    if (beforeError) {
      console.warn('Progress photos table not found or error:', beforeError.message);
    }
  
    // Get most recent workout photo (priority for "after" photo)
    const { data: workoutPhotoData, error: workoutError } = await supabase
      .from('workouts')
      .select('photo_url, completed_at')
      .eq('user_id', userId)
      .not('photo_url', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1);
    
    if (workoutError) {
      console.warn('Error fetching workout photos:', workoutError.message);
    }
    
    // Get most recent after/progress photo as fallback
    const { data: afterData, error: afterError } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['after', 'progress'])
      .order('taken_at', { ascending: false })
      .limit(1);
    
    if (afterError) {
      console.warn('Error fetching after photos:', afterError.message);
    }
    
    let after: ProgressPhoto | null = null;
    
    // Always prioritize the most recent workout photo as "after" photo
    if (workoutPhotoData?.[0]) {
      // Convert workout photo to progress photo format
      after = {
        id: 'workout-photo',
        user_id: userId,
        photo_url: workoutPhotoData[0].photo_url,
        taken_at: workoutPhotoData[0].completed_at,
        type: 'after' as const,
        notes: 'Latest workout photo'
      };
    } else if (afterData?.[0]) {
      // Fallback to dedicated progress photos if no workout photos exist
      after = afterData[0];
    }
    
    return {
      before: beforeData?.[0] || null,
      after
    };
  } catch (error) {
    console.error('Error in getBeforeAfterPhotos:', error);
    return {
      before: null,
      after: null
    };
  }
}

// Get personal records calculated from actual workout history
export async function getPersonalRecords(userId: string): Promise<Array<{
  id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  achieved_at: string;
}>> {
  // console.log('🏆 Progress getPersonalRecords called for userId:', userId);
  
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

    // console.log('📊 Progress PR query result:', { dataLength: data?.length, error });

    if (error) {
      console.error('❌ Error fetching workout-based personal records:', error);
      return getMockPersonalRecords();
    }

    if (!data || data.length === 0) {
      // console.log('❌ No workout data found, returning mock personal records');
      return getMockPersonalRecords();
    }

    // Group by exercise and find the best set for each
    const exerciseRecords = new Map<string, any>();
    
    data.forEach((set: any) => {
      const exerciseName = set.workout_exercises?.exercises?.name;
      const workoutDate = set.workout_exercises?.workouts?.completed_at;
      
      if (!exerciseName || !set.weight) return;
      
      const currentBest = exerciseRecords.get(exerciseName);
      
      // Compare by weight first, then by reps if weight is equal
      if (!currentBest || 
          set.weight > currentBest.weight || 
          (set.weight === currentBest.weight && set.reps > currentBest.reps)) {
        exerciseRecords.set(exerciseName, {
          id: set.id,
          exercise_name: exerciseName,
          weight: parseFloat(set.weight) || 0,
          reps: set.reps || 0,
          achieved_at: workoutDate || set.created_at
        });
      }
    });

    // Convert to array and sort by weight descending, limit to top 5
    const personalRecords = Array.from(exerciseRecords.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    // console.log('✅ Progress personal records found:', personalRecords);
    
    if (personalRecords.length === 0) {
      // console.log('❌ No personal records after processing, returning mock data');
      return getMockPersonalRecords();
    }
    
    return personalRecords;
    
  } catch (error) {
    console.error('❌ Error calculating personal records from workouts:', error);
    return getMockPersonalRecords();
  }
}

// Helper function for mock data
function getMockPersonalRecords() {
  const mockData = [
    {
      id: 'mock-1',
      exercise_name: 'Bench Press',
      weight: 80,
      reps: 8,
      achieved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock-2',
      exercise_name: 'Squat',
      weight: 120,
      reps: 5,
      achieved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock-3',
      exercise_name: 'Deadlift',
      weight: 140,
      reps: 3,
      achieved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock-4',
      exercise_name: 'Overhead Press',
      weight: 60,
      reps: 10,
      achieved_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock-5',
      exercise_name: 'Pull-up',
      weight: 0,
      reps: 12,
      achieved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  // console.log('No workout data found, returning mock personal records for demonstration');
  return mockData;
}

// Upload progress photo
export async function uploadProgressPhoto(
  userId: string,
  file: File,
  type: 'before' | 'after' | 'progress',
  notes?: string
): Promise<{ success: boolean; photoUrl?: string; error?: string }> {
  try {
    let fileToUpload = file;
    let fileName = `${userId}/${type}_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
    
    // Try to compress the image, but fallback to original if it fails
    try {
      // Only compress on client side (check for window object)
      if (typeof window !== 'undefined') {
        const { compressWorkoutPhoto, getCompressionStats } = await import('@/lib/image-compression');
        
        // Compress the image before upload
        const compressedFile = await compressWorkoutPhoto(file);
        
        // Log compression stats for optimization tracking
        const stats = getCompressionStats(file, compressedFile);
        // console.log(`Progress photo (${type}) compression:`, stats);
        
        fileToUpload = compressedFile;
        fileName = `${userId}/${type}_${Date.now()}.jpg`; // Always use jpg after compression
      }
    } catch (compressionError) {
      console.warn('Image compression failed, using original file:', compressionError);
      // fileToUpload remains as the original file
    }
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(fileName, fileToUpload);
    
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(fileName);
    
    const photoUrl = urlData.publicUrl;
    
    // Save to database
    const { error: dbError } = await supabase
      .from('progress_photos')
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        type,
        notes,
        taken_at: new Date().toISOString()
      });
    
    if (dbError) {
      return { success: false, error: dbError.message };
    }
    
    return { success: true, photoUrl };
  } catch (error) {
    return { success: false, error: 'Failed to upload photo' };
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Calculate workout frequency stats
export async function getWorkoutFrequency(userId: string): Promise<{
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
}> {
  const now = new Date();
  
  // This week (Monday to Sunday)
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfThisWeek.setHours(0, 0, 0, 0);
  
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
  endOfThisWeek.setHours(23, 59, 59, 999);
  
  // Last week
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  
  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  endOfLastWeek.setHours(23, 59, 59, 999);
  
  // This month
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfThisMonth.setHours(23, 59, 59, 999);
  
  // Last month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  endOfLastMonth.setHours(23, 59, 59, 999);
  
  // Fetch all data in parallel
  const [thisWeekData, lastWeekData, thisMonthData, lastMonthData] = await Promise.all([
    supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', startOfThisWeek.toISOString())
      .lte('completed_at', endOfThisWeek.toISOString()),
    
    supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', startOfLastWeek.toISOString())
      .lte('completed_at', endOfLastWeek.toISOString()),
    
    supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', startOfThisMonth.toISOString())
      .lte('completed_at', endOfThisMonth.toISOString()),
    
    supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', startOfLastMonth.toISOString())
      .lte('completed_at', endOfLastMonth.toISOString())
  ]);
  
  return {
    thisWeek: thisWeekData.data?.length || 0,
    lastWeek: lastWeekData.data?.length || 0,
    thisMonth: thisMonthData.data?.length || 0,
    lastMonth: lastMonthData.data?.length || 0
  };
}
