import { supabase } from './supabase';

// Function to add test exercise data to existing workouts
export async function addTestDataToWorkouts(userId: string) {
  try {
    // Get workouts without exercises
    const { data: workouts, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        id,
        name,
        duration,
        workout_exercises(id)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (workoutError) {
      console.error('Error fetching workouts:', workoutError);
      return;
    }

    if (!workouts || workouts.length === 0) {
      console.log('No workouts found');
      return;
    }

    // Get a sample exercise to use
    const { data: exercises, error: exerciseError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(3);

    if (exerciseError || !exercises || exercises.length === 0) {
      console.error('Error fetching exercises or no exercises found:', exerciseError);
      return;
    }

    for (const workout of workouts) {
      // Skip if workout already has exercises
      if (workout.workout_exercises && workout.workout_exercises.length > 0) {
        continue;
      }

      // Update duration if it's 0
      if (workout.duration === 0) {
        await supabase
          .from('workouts')
          .update({ duration: 1800 }) // 30 minutes
          .eq('id', workout.id);
      }

      // Add a sample exercise to this workout
      const exercise = exercises[0]; // Use first exercise
      
      const { data: workoutExercise, error: exerciseInsertError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workout.id,
          exercise_id: exercise.id,
          order_index: 0
        })
        .select()
        .single();

      if (exerciseInsertError) {
        console.error('Error adding exercise to workout:', exerciseInsertError);
        continue;
      }

      // Add sample sets
      const sets = [
        { reps: 10, weight: 20 },
        { reps: 8, weight: 25 },
        { reps: 6, weight: 30 }
      ];

      for (const set of sets) {
        await supabase
          .from('workout_sets')
          .insert({
            workout_exercise_id: workoutExercise.id,
            reps: set.reps,
            weight: set.weight,
            is_personal_record: false
          });
      }

      console.log(`Added test data to workout: ${workout.name}`);
    }

    console.log('Test data added successfully!');
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}
