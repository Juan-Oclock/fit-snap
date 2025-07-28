import { supabase } from './supabase';
import { Workout, WorkoutExercise, WorkoutSet, Exercise } from '@/types';

export interface WorkoutHistoryItem extends Workout {
  workout_exercises: Array<{
    id: string;
    exercise_id: string;
    order_index: number;
    exercise: Exercise;
    workout_sets: WorkoutSet[];
    notes?: string;
  }>;
  exercise_count: number;
  total_sets: number;
  total_weight: number;
  total_exercise_duration: number;
}

export interface HistoryFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  muscleGroup?: string;
  workoutType?: string;
}

// Fetch workout history for the current user
export const fetchWorkoutHistory = async (
  filters: HistoryFilters = {},
  limit = 20,
  offset = 0
): Promise<{ workouts: WorkoutHistoryItem[]; total: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('workouts')
      .select(`
        id,
        user_id,
        name,
        type,
        duration,
        completed_at,
        notes,
        photo_url,
        created_at,
        workout_exercises (
          id,
          exercise_id,
          order_index,
          notes,
          exercises (
            id,
            name,
            category,
            muscle_group,
            equipment
          ),
          workout_sets (
            id,
            reps,
            weight,
            duration,
            rest_time,
            is_personal_record
          )
        )
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.dateFrom) {
      query = query.gte('completed_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('completed_at', filters.dateTo);
    }

    if (filters.workoutType && filters.workoutType !== 'all') {
      query = query.eq('type', filters.workoutType);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get paginated results
    const { data, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching workout history:', error);
      throw error;
    }

    // Debug: Log the fetched data
    // console.log('DEBUG History: Raw data:', data);
    // data?.forEach((workout: any, index: number) => {
    //   console.log(`DEBUG History Workout ${index + 1}:`, workout.name);
    //   workout.workout_exercises?.forEach((exercise: any, exIndex: number) => {
    //     console.log(`DEBUG History Exercise ${exIndex + 1}:`, {
    //       id: exercise.id,
    //       exercise_name: exercise.exercises?.name,
    //       sets_count: exercise.workout_sets?.length || 0,
    //       sets_data: exercise.workout_sets
    //     });
    //   });
    // });

    // Transform data to include computed fields
    const workouts: WorkoutHistoryItem[] = (data || []).map((workout: any) => {
      const exercises = workout.workout_exercises || [];
      const allSets = exercises.flatMap((ex: any) => ex.workout_sets || []);
      
      return {
        ...workout,
        workout_exercises: exercises.map((ex: any) => ({
          id: ex.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          notes: ex.notes,
          exercise: ex.exercises,
          workout_sets: ex.workout_sets || []
        })),
        exercise_count: exercises.length,
        total_sets: allSets.length,
        total_weight: allSets.reduce((max: number, set: any) => Math.max(max, set.weight || 0), 0),
        total_exercise_duration: allSets.reduce((sum: number, set: any) => sum + (set.duration || 0), 0)
      };
    });

    // Filter by muscle group if specified (client-side since it's nested)
    let filteredWorkouts = workouts;
    if (filters.muscleGroup && filters.muscleGroup !== 'all') {
      filteredWorkouts = workouts.filter(workout =>
        workout.workout_exercises.some(ex => 
          ex.exercise.muscle_group.toLowerCase() === filters.muscleGroup?.toLowerCase()
        )
      );
    }

    return {
      workouts: filteredWorkouts,
      total: count || 0
    };
  } catch (error) {
    console.error('Error in fetchWorkoutHistory:', error);
    throw error;
  }
};

// Get unique muscle groups from user's workout history
export const getUserMuscleGroups = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workouts')
      .select(`
        workout_exercises (
          exercises (
            muscle_group
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching muscle groups:', error);
      return [];
    }

    const muscleGroups = new Set<string>();
    data?.forEach((workout: any) => {
      workout.workout_exercises?.forEach((ex: any) => {
        if (ex.exercises && ex.exercises.muscle_group) {
          muscleGroups.add(ex.exercises.muscle_group);
        }
      });
    });

    return Array.from(muscleGroups).sort();
  } catch (error) {
    console.error('Error in getUserMuscleGroups:', error);
    return [];
  }
};

// Export workout data as CSV
export const exportWorkoutHistoryCSV = async (filters: HistoryFilters = {}): Promise<string> => {
  try {
    const { workouts } = await fetchWorkoutHistory(filters, 1000, 0); // Get all matching workouts

    const csvRows: string[] = [];
    
    // CSV Headers
    csvRows.push([
      'Date',
      'Workout Name',
      'Type',
      'Duration (min)',
      'Exercise',
      'Muscle Group',
      'Set Number',
      'Reps',
      'Weight (kg)',
      'Duration (sec)',
      'Rest Time (sec)',
      'Personal Record',
      'Exercise Notes',
      'Workout Notes'
    ].join(','));

    // CSV Data
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.completed_at).toLocaleDateString();
      const workoutName = `"${workout.name || 'Untitled Workout'}"`;
      const workoutType = workout.type;
      const workoutDuration = Math.round(workout.duration / 60);
      const workoutNotes = `"${workout.notes || ''}"`;

      if (workout.workout_exercises.length === 0) {
        // Workout with no exercises
        csvRows.push([
          workoutDate,
          workoutName,
          workoutType,
          workoutDuration.toString(),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          workoutNotes
        ].join(','));
      } else {
        workout.workout_exercises.forEach(workoutExercise => {
          const exerciseName = `"${workoutExercise.exercise.name}"`;
          const muscleGroup = workoutExercise.exercise.muscle_group;
          const exerciseNotes = `"${workoutExercise.notes || ''}"`;

          if (workoutExercise.workout_sets.length === 0) {
            // Exercise with no sets
            csvRows.push([
              workoutDate,
              workoutName,
              workoutType,
              workoutDuration.toString(),
              exerciseName,
              muscleGroup,
              '',
              '',
              '',
              '',
              '',
              '',
              exerciseNotes,
              workoutNotes
            ].join(','));
          } else {
            workoutExercise.workout_sets.forEach((set, setIndex) => {
              csvRows.push([
                workoutDate,
                workoutName,
                workoutType,
                workoutDuration.toString(),
                exerciseName,
                muscleGroup,
                (setIndex + 1).toString(),
                set.reps.toString(),
                (set.weight || 0).toString(),
                (set.duration || 0).toString(),
                (set.rest_time || 0).toString(),
                set.is_personal_record ? 'Yes' : 'No',
                exerciseNotes,
                workoutNotes
              ].join(','));
            });
          }
        });
      }
    });

    return csvRows.join('\n');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string = 'workout-history.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Format duration in minutes and seconds
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
};

// Format date for display
export const formatWorkoutDate = (dateString: string): string => {
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export const formatWorkoutTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Delete a workout and all its related data
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, get all workout exercise IDs for this workout
    const { data: workoutExercises, error: fetchError } = await supabase
      .from('workout_exercises')
      .select('id')
      .eq('workout_id', workoutId);

    if (fetchError) {
      console.error('Error fetching workout exercises:', fetchError);
      throw new Error('Failed to fetch workout exercises');
    }

    // Delete all workout sets for these exercises
    if (workoutExercises && workoutExercises.length > 0) {
      const exerciseIds = workoutExercises.map(ex => ex.id);
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .in('workout_exercise_id', exerciseIds);

      if (setsError) {
        console.error('Error deleting workout sets:', setsError);
        throw new Error('Failed to delete workout sets');
      }
    }

    // Then delete workout exercises
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', workoutId);

    if (exercisesError) {
      console.error('Error deleting workout exercises:', exercisesError);
      throw new Error('Failed to delete workout exercises');
    }

    // Delete any community reactions for this workout
    const { error: reactionsError } = await supabase
      .from('community_reactions')
      .delete()
      .eq('workout_id', workoutId);

    if (reactionsError) {
      console.error('Error deleting community reactions:', reactionsError);
      // Don't throw error for reactions as they might not exist
    }

    // Delete any community comments for this workout
    const { error: commentsError } = await supabase
      .from('community_comments')
      .delete()
      .eq('workout_id', workoutId);

    if (commentsError) {
      console.error('Error deleting community comments:', commentsError);
      // Don't throw error for comments as they might not exist
    }

    // Finally, delete the workout itself
    const { error: workoutError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', user.id); // Ensure user can only delete their own workouts

    if (workoutError) {
      console.error('Error deleting workout:', workoutError);
      throw new Error('Failed to delete workout');
    }

    // console.log('Workout deleted successfully:', workoutId);
  } catch (error) {
    console.error('Error in deleteWorkout:', error);
    throw error;
  }
};
