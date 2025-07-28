import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Create service role client (server-side only)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { workoutId: string } }
) {
  try {
    const { workoutId } = params;

    if (!workoutId) {
      return Response.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    // First, verify this is a public workout
    const { data: workout, error: workoutError } = await supabaseServiceRole
      .from('workouts')
      .select('id, is_public')
      .eq('id', workoutId)
      .eq('is_public', true)
      .single();

    if (workoutError || !workout) {
      return Response.json({ error: 'Workout not found or not public' }, { status: 404 });
    }

    // Fetch workout exercises for this workout
    const { data: workoutExercises, error: exercisesError } = await supabaseServiceRole
      .from('workout_exercises')
      .select(`
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
        )
      `)
      .eq('workout_id', workoutId)
      .order('order_index');

    if (exercisesError) {
      console.error('Error fetching workout exercises:', exercisesError);
      return Response.json({ error: 'Failed to fetch workout exercises' }, { status: 500 });
    }

    if (!workoutExercises || workoutExercises.length === 0) {
      return Response.json({ exercises: [] });
    }

    // Get all exercise IDs
    const exerciseIds = workoutExercises.map(ex => ex.id);

    // Fetch workout sets for these exercises using service role (bypasses RLS)
    const { data: workoutSets, error: setsError } = await supabaseServiceRole
      .from('workout_sets')
      .select('id, workout_exercise_id, reps, weight, duration, rest_time, is_personal_record')
      .in('workout_exercise_id', exerciseIds)
      .order('created_at');

    if (setsError) {
      console.error('Error fetching workout sets:', setsError);
      return Response.json({ error: 'Failed to fetch workout sets' }, { status: 500 });
    }

    // Create a map of sets by exercise ID
    const setsMap = new Map<string, any[]>();
    workoutSets?.forEach(set => {
      const exerciseId = set.workout_exercise_id;
      if (!setsMap.has(exerciseId)) {
        setsMap.set(exerciseId, []);
      }
      setsMap.get(exerciseId)!.push(set);
    });

    // Combine exercises with their sets
    const exercisesWithSets = workoutExercises.map(exercise => ({
      ...exercise,
      workout_sets: setsMap.get(exercise.id) || []
    }));

    console.log(`API: Fetched ${exercisesWithSets.length} exercises with ${workoutSets?.length || 0} total sets for workout ${workoutId}`);

    return Response.json({ 
      exercises: exercisesWithSets,
      totalSets: workoutSets?.length || 0
    });

  } catch (error) {
    console.error('Error in community workout details API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
