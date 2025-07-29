export type User = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
};

export type WorkoutType = 'push' | 'pull' | 'legs' | 'custom';

export type Workout = {
  id: string;
  user_id: string;
  name: string;
  type: WorkoutType;
  duration: number; // in seconds
  completed_at: string;
  notes?: string;
  photo_url?: string;
};

export type WorkoutWithExercises = Workout & {
  workout_exercises: {
    id: string;
    exercise_id: string;
    order_index: number;
    exercises: {
      name: string;
    };
    workout_sets: {
      reps: number;
      weight?: number;
    }[];
  }[];
};

export type Exercise = {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment?: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
};

export type MuscleGroup = {
  id: string;
  name: string;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  order: number;
  sets: WorkoutSet[];
};

export type WorkoutSet = {
  id: string;
  workout_exercise_id: string;
  reps: number;
  weight?: number; // in kg
  duration?: number; // in seconds, for timed exercises
  rest_time?: number; // in seconds
  is_personal_record: boolean;
};

export type Quote = {
  id: string;
  text: string;
  author?: string;
};

export type ProgressPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  taken_at: string;
  type: 'before' | 'after' | 'progress';
  notes?: string;
};

export type PersonalRecord = {
  id: string;
  user_id: string;
  exercise_id: string;
  weight: number; // in kg
  reps: number;
  achieved_at: string;
  exercise_name?: string; // populated via join
};

export type UserProfile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  default_rest_seconds: number;
  theme: string;
  notifications_enabled: boolean;
  community_sharing_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type UserGoals = {
  id: string;
  user_id: string;
  monthly_workout_target: number;
  created_at: string;
  updated_at: string;
};

// Community Types
export type CommunityReaction = {
  id: string;
  workout_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
};

export type CommunityComment = {
  id: string;
  workout_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
};
