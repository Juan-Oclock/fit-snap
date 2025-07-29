import { supabase } from './supabase';
import { Exercise, Workout, WorkoutExercise, WorkoutSet } from '@/types';
import { searchExercises as searchExercisesFromLib } from './exercises';

// Re-export search function from exercises library
export const searchExercises = searchExercisesFromLib;

// Fetch all exercises for search
export const fetchExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select(`
      id,
      name,
      category,
      muscle_group,
      equipment,
      created_at
    `)
    .order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }

  return data || [];
};

// Update or create personal record
export const updatePersonalRecord = async (
  exerciseId: string,
  weight: number,
  reps: number
): Promise<{ success: boolean; isNewRecord: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, isNewRecord: false, error: 'User not authenticated' };
    }

    // Check if there's an existing PR
    const { data: existingPR, error: fetchError } = await supabase
      .from('personal_records')
      .select('weight, reps')
      .eq('user_id', user.id)
      .eq('exercise_id', exerciseId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching existing PR:', fetchError);
      
      // Handle 406 errors (RLS policy issues) by treating as no existing record
      if (fetchError.message?.includes('406') || fetchError.code === '42501') {
        console.warn('RLS policy issue detected, treating as no existing record');
        // Continue as if no existing record found
      } else {
        return { success: false, isNewRecord: false, error: 'Failed to check existing record' };
      }
    }

    let isNewRecord = false;

    if (!existingPR) {
      // No existing record, create new one
      const { error: insertError } = await supabase
        .from('personal_records')
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
          weight,
          reps,
          achieved_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating new PR:', insertError);
        return { success: false, isNewRecord: false, error: 'Failed to create record' };
      }

      isNewRecord = true;
    } else {
      // Check if new weight is better (higher weight with same or more reps, or same weight with more reps)
      const isBetterRecord = weight > existingPR.weight || 
                            (weight === existingPR.weight && reps > existingPR.reps);

      if (isBetterRecord) {
        const { error: updateError } = await supabase
          .from('personal_records')
          .update({
            weight,
            reps,
            achieved_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId);

        if (updateError) {
          console.error('Error updating PR:', updateError);
          return { success: false, isNewRecord: false, error: 'Failed to update record' };
        }

        isNewRecord = true;
      }
    }

    return { success: true, isNewRecord };
  } catch (error) {
    console.error('Error updating personal record:', error);
    return { success: false, isNewRecord: false, error: 'Failed to update record' };
  }
};

// Save workout with exercises and sets
export const saveWorkout = async (
  workoutData: {
    name: string;
    notes?: string;
    photo_url?: string;
    duration?: number;
    is_public?: boolean;
  },
  exercises: Array<{
    exercise_id: string;
    sets: Array<{
      reps: number;
      weight?: number;
      duration?: number;
      rest_time?: number;
    }>;
    notes?: string;
  }>
): Promise<{ success: boolean; workoutId?: string; error?: string }> => {
  console.log('=== SAVE WORKOUT FUNCTION CALLED ===');
  console.log('Workout data received:', workoutData);
  console.log('Exercises received:', exercises);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User in saveWorkout:', user);
    
    if (!user) {
      console.log('No user found in saveWorkout');
      return { success: false, error: 'User not authenticated' };
    }

    // Start transaction by creating workout
    const workoutInsertData: any = {
      user_id: user.id,
      name: workoutData.name,
      notes: workoutData.notes,
      photo_url: workoutData.photo_url,
      completed_at: new Date().toISOString(),
      is_public: workoutData.is_public ?? false
      // type: 'custom' // Temporarily removed due to schema issue
    };
    
    // Include duration if provided, default to 0 if not provided
    workoutInsertData.duration = workoutData.duration || 0;
    
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert(workoutInsertData)
      .select()
      .single();

    if (workoutError || !workout) {
      console.error('Error creating workout:', workoutError);
      return { success: false, error: 'Failed to create workout' };
    }

    // Add exercises to workout
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      
      // Create workout exercise
      const { data: workoutExercise, error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workout.id,
          exercise_id: exercise.exercise_id,
          order_index: i,
          notes: exercise.notes || null
        })
        .select()
        .single();

      if (exerciseError || !workoutExercise) {
        console.error('Error adding exercise to workout:', exerciseError);
        continue;
      }

      // Filter out empty sets (reps = 0)
      const validSets = exercise.sets.filter(set => set.reps > 0);

      if (validSets.length === 0) continue;

      // Add sets for this exercise
      const setsToInsert = validSets.map(set => ({
        workout_exercise_id: workoutExercise.id,
        reps: set.reps,
        weight: set.weight || 0,
        duration: set.duration,
        rest_time: set.rest_time,
        is_personal_record: false // Will be updated after checking PRs
      }));

      const { data: insertedSets, error: setsError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert)
        .select();

      if (setsError) {
        console.error('Error adding sets:', setsError);
        continue;
      }

      // Check and update personal records for each set
      if (insertedSets) {
        for (const set of insertedSets) {
          if (set.weight && set.weight > 0) {
            const { isNewRecord } = await updatePersonalRecord(
              exercise.exercise_id,
              set.weight,
              set.reps
            );

            // Update the set to mark it as a PR if it is one
            if (isNewRecord) {
              await supabase
                .from('workout_sets')
                .update({ is_personal_record: true })
                .eq('id', set.id);
            }
          }
        }
      }
    }

    return { success: true, workoutId: workout.id };
  } catch (error) {
    console.error('Error saving workout:', error);
    return { success: false, error: 'Failed to save workout' };
  }
};

// Upload workout photo to Supabase Storage
export const uploadWorkoutPhoto = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    let fileToUpload = file;
    let fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
    
    // Try to compress the image, but fallback to original if it fails
    try {
      // Only compress on client side (check for window object)
      if (typeof window !== 'undefined') {
        const { compressWorkoutPhoto, getCompressionStats } = await import('@/lib/image-compression');
        
        // Compress the image before upload
        const compressedFile = await compressWorkoutPhoto(file);
        
        // Log compression stats for optimization tracking
        const stats = getCompressionStats(file, compressedFile);
        console.log('Workout photo compression:', stats);
        
        fileToUpload = compressedFile;
        fileName = `${user.id}/${Date.now()}.jpg`; // Always use jpg after compression
      }
    } catch (compressionError) {
      console.warn('Image compression failed, using original file:', compressionError);
      // fileToUpload remains as the original file
    }

    const { data, error } = await supabase.storage
      .from('workout-photos')
      .upload(fileName, fileToUpload);

    if (error) {
      console.error('Error uploading photo:', error);
      return { success: false, error: 'Failed to upload photo' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('workout-photos')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { success: false, error: 'Failed to upload photo' };
  }
};

// Get user's rest time preference (default 60 seconds)
export const getUserRestTime = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 60;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('default_rest_seconds')
      .eq('user_id', user.id)
      .single();

    if (error || !settings) {
      // If no settings found, create default settings
      if (error?.code === 'PGRST116') { // No rows returned
        await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            default_rest_seconds: 60
          });
      }
      return 60;
    }

    return settings.default_rest_seconds || 60;
  } catch (error) {
    console.error('Error getting user rest time:', error);
    return 60;
  }
};
