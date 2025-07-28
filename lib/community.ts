import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export interface CommunityWorkout {
  id: string;
  name: string;
  type: string;
  completed_at: string;
  notes?: string;
  photo_url?: string;
  is_public: boolean;
  user_id: string;
  // Profile data
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  // Exercise summary
  workout_exercises: Array<{
    id: string;
    exercise_id: string;
    order_index: number;
    notes?: string;
    exercises: {
      id: string;
      name: string;
      category: string;
      muscle_group: string;
      equipment: string;
    } | null;
    workout_sets: Array<{
      id: string;
      reps: number;
      weight: number;
      duration?: number;
      rest_time?: number;
      is_personal_record?: boolean;
    }>;
  }>;
  // Reaction data
  community_reactions: Array<{
    id: string;
    user_id: string;
    reaction_type: string;
  }>;
  _count?: {
    community_reactions: number;
    community_comments: number;
  };
}

export interface CommunityReaction {
  id: string;
  workout_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  workout_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username?: string;
    avatar_url?: string;
  };
}

/**
 * Fetch public workouts for the community feed
 */
export async function getCommunityWorkouts(limit: number = 20, offset: number = 0): Promise<CommunityWorkout[]> {
  try {
    // First, get the basic workout data
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        id,
        name,
        type,
        completed_at,
        notes,
        photo_url,
        is_public,
        user_id
      `)
      .eq('is_public', true)
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
      throw workoutsError;
    }

    if (!workouts || workouts.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = Array.from(new Set(workouts.map(w => w.user_id)));

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Don't throw error, just continue without profiles
    }

    // Fetch workout exercises for these workouts
    const workoutIds = workouts.map(w => w.id);
    const { data: workoutExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        workout_id,
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
      `)
      .in('workout_id', workoutIds)
      .order('order_index', { ascending: true });

    if (exercisesError) {
      console.error('Error fetching workout exercises:', exercisesError);
    }



    // Fetch community reactions for these workouts
    const { data: reactions, error: reactionsError } = await supabase
      .from('community_reactions')
      .select('id, workout_id, user_id, reaction_type')
      .in('workout_id', workoutIds);

    if (reactionsError) {
      console.error('Error fetching reactions:', reactionsError);
    }

    // Fetch comment counts for these workouts
    const { data: commentCounts, error: commentCountsError } = await supabase
      .from('community_comments')
      .select('workout_id')
      .in('workout_id', workoutIds);

    if (commentCountsError) {
      console.error('Error fetching comment counts:', commentCountsError);
    }

    // Create maps for easy lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    const exerciseMap = new Map();
    if (workoutExercises) {
      workoutExercises.forEach(we => {
        if (!exerciseMap.has(we.workout_id)) {
          exerciseMap.set(we.workout_id, []);
        }
        exerciseMap.get(we.workout_id).push(we);
      });
    }

    const reactionMap = new Map();
    if (reactions) {
      reactions.forEach(reaction => {
        if (!reactionMap.has(reaction.workout_id)) {
          reactionMap.set(reaction.workout_id, []);
        }
        reactionMap.get(reaction.workout_id).push(reaction);
      });
    }

    // Create comment count map
    const commentCountMap = new Map();
    if (commentCounts) {
      commentCounts.forEach(comment => {
        const workoutId = comment.workout_id;
        commentCountMap.set(workoutId, (commentCountMap.get(workoutId) || 0) + 1);
      });
    }

    // Transform the data to match our interface
    const transformedData = workouts.map((workout: any) => ({
      ...workout,
      profiles: profileMap.get(workout.user_id) || { username: 'Anonymous User', full_name: null, avatar_url: null },
      workout_exercises: exerciseMap.get(workout.id) || [],
      community_reactions: reactionMap.get(workout.id) || [],
      _count: {
        community_reactions: (reactionMap.get(workout.id) || []).length,
        community_comments: commentCountMap.get(workout.id) || 0
      }
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in getCommunityWorkouts:', error);
    throw error;
  }
}

/**
 * Toggle workout visibility (public/private)
 */
export async function toggleWorkoutVisibility(workoutId: string, isPublic: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workouts')
      .update({ is_public: isPublic })
      .eq('id', workoutId);

    if (error) {
      console.error('Error toggling workout visibility:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in toggleWorkoutVisibility:', error);
    throw error;
  }
}

/**
 * Add a reaction to a workout
 */
export async function addReaction(workoutId: string, userId: string, reactionType: string = 'like'): Promise<CommunityReaction> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api/community-reactions/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ workoutId, reactionType, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add reaction');
    }

    const { reaction } = await response.json();
    return reaction;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
}

/**
 * Remove a reaction from a workout
 */
export async function removeReaction(workoutId: string, userId: string): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api/community-reactions/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ workoutId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove reaction');
    }

    return true;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
}

/**
 * Get reactions for a specific workout
 */
export async function getWorkoutReactions(workoutId: string): Promise<CommunityReaction[]> {
  try {
    const { data, error } = await supabase
      .from('community_reactions')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workout reactions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkoutReactions:', error);
    throw error;
  }
}

/**
 * Add a comment to a workout
 */
export async function addComment(workoutId: string, userId: string, content: string): Promise<CommunityComment> {
  try {
    if (!userId || !content?.trim()) {
      throw new Error('User ID and content are required');
    }

    const response = await fetch('/api/community-comments/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ workoutId, content, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add comment');
    }

    const { comment } = await response.json();
    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get comments for a specific workout
 */
export async function getWorkoutComments(workoutId: string): Promise<CommunityComment[]> {
  try {
    const response = await fetch(`/api/community-comments/${workoutId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch comments');
    }

    const { comments } = await response.json();
    return comments || [];
  } catch (error) {
    console.error('Error fetching workout comments:', error);
    throw error;
  }
}

/**
 * Get online users count (mock for now - would need real-time presence)
 */
export async function getOnlineUsersCount(): Promise<number> {
  // This is a mock implementation
  // In a real app, you'd use Supabase Realtime presence or similar
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Format relative time for community posts
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Generate exercise summary for community post
 */
export function generateExerciseSummary(workoutExercises: CommunityWorkout['workout_exercises']): string {
  if (!workoutExercises || workoutExercises.length === 0) {
    return 'No exercises logged';
  }

  const exerciseNames = workoutExercises.map(we => we.exercises?.name).filter(Boolean);
  
  if (exerciseNames.length === 0) {
    return 'Workout completed';
  }

  if (exerciseNames.length <= 2) {
    return exerciseNames.join(', ');
  }

  return `${exerciseNames.slice(0, 2).join(', ')} and ${exerciseNames.length - 2} more`;
}

/**
 * Calculate total volume for a workout
 */
export function calculateWorkoutVolume(workoutExercises: CommunityWorkout['workout_exercises']): number {
  if (!workoutExercises) return 0;

  return workoutExercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.workout_sets?.reduce((setTotal, set) => {
      return setTotal + (set.reps * set.weight);
    }, 0) || 0;
    return total + exerciseVolume;
  }, 0);
}
