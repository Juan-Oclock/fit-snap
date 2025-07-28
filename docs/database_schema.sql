-- FitSnap Database Schema
-- This file contains the SQL schema for all tables needed by the FitSnap app

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  monthly_workout_target INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Categories table (for exercise categorization)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Muscle groups table
CREATE TABLE IF NOT EXISTS public.muscle_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  muscle_group_id UUID REFERENCES public.muscle_groups(id),
  equipment TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('push', 'pull', 'legs', 'custom')) DEFAULT 'custom',
  duration INTEGER DEFAULT 0, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises (junction table)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sets
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_exercise_id UUID REFERENCES public.workout_exercises(id) ON DELETE CASCADE NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL(5,2), -- in kg
  duration INTEGER, -- in seconds, for timed exercises
  rest_time INTEGER, -- in seconds
  is_personal_record BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal records table
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  weight DECIMAL(5,2) NOT NULL, -- in kg
  reps INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  default_rest_seconds INTEGER DEFAULT 60,
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  community_sharing_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT CHECK (type IN ('before', 'after', 'progress')) DEFAULT 'progress',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table (for sharing workouts)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  content TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals" ON public.user_goals FOR ALL USING (auth.uid() = user_id);

-- Workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);

-- Workout exercises
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workout exercises" ON public.workout_exercises FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.workouts WHERE id = workout_id)
);

-- Workout sets
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workout sets" ON public.workout_sets FOR ALL USING (
  auth.uid() = (
    SELECT w.user_id 
    FROM public.workouts w 
    JOIN public.workout_exercises we ON w.id = we.workout_id 
    WHERE we.id = workout_exercise_id
  )
);

-- Personal records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own personal records" ON public.personal_records FOR ALL USING (auth.uid() = user_id);

-- User settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Progress photos
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress photos" ON public.progress_photos FOR ALL USING (auth.uid() = user_id);

-- Community posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public posts" ON public.community_posts FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can manage own posts" ON public.community_posts FOR ALL USING (auth.uid() = user_id);

-- Public read access for reference tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (TRUE);

ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read muscle groups" ON public.muscle_groups FOR SELECT USING (TRUE);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read exercises" ON public.exercises FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can manage exercises" ON public.exercises FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quotes" ON public.quotes FOR SELECT USING (TRUE);

-- Insert some sample data
INSERT INTO public.categories (name, description) VALUES
  ('Strength', 'Weight training and resistance exercises'),
  ('Cardio', 'Cardiovascular and endurance exercises'),
  ('Flexibility', 'Stretching and mobility exercises'),
  ('Functional', 'Functional movement patterns')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.muscle_groups (name, description) VALUES
  ('Chest', 'Pectoral muscles'),
  ('Back', 'Latissimus dorsi, rhomboids, traps'),
  ('Shoulders', 'Deltoids'),
  ('Arms', 'Biceps, triceps, forearms'),
  ('Legs', 'Quadriceps, hamstrings, calves'),
  ('Glutes', 'Gluteal muscles'),
  ('Core', 'Abdominals, obliques'),
  ('Full Body', 'Compound movements')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.quotes (text, author) VALUES
  ('The only person you should try to be better than is the person you were yesterday.', 'Anonymous'),
  ('Success is the sum of small efforts repeated day in and day out.', 'Robert Collier'),
  ('Don''t put off tomorrow what you can do today.', 'Benjamin Franklin'),
  ('The groundwork for all happiness is good health.', 'Leigh Hunt'),
  ('Take care of your body. It''s the only place you have to live.', 'Jim Rohn'),
  ('A healthy outside starts from the inside.', 'Robert Urich'),
  ('Your body can do it. It''s your mind that you have to convince.', 'Anonymous'),
  ('Fitness is not about being better than someone else. It''s about being better than you used to be.', 'Khloe Kardashian')
ON CONFLICT DO NOTHING;

-- Sample exercises (updated with requested ones)
INSERT INTO public.exercises (name, description, category_id, muscle_group_id, equipment, instructions) VALUES
  ('Bench Press', 'Classic barbell chest exercise', 
   (SELECT id FROM public.categories WHERE name = 'Strength'), 
   (SELECT id FROM public.muscle_groups WHERE name = 'Chest'),
   'Barbell', 'Lie on bench, lower barbell to chest, press back up'),
  ('Goblet Squat', 'Squat variation holding weight at chest',
   (SELECT id FROM public.categories WHERE name = 'Strength'),
   (SELECT id FROM public.muscle_groups WHERE name = 'Legs'),
   'Dumbbell', 'Hold dumbbell at chest, squat down keeping chest up'),
  ('Barbell Row', 'Bent-over rowing exercise',
   (SELECT id FROM public.categories WHERE name = 'Strength'),
   (SELECT id FROM public.muscle_groups WHERE name = 'Back'),
   'Barbell', 'Bend over, pull barbell to lower chest, squeeze shoulder blades'),
  ('Pull-Up', 'Upper body pulling exercise',
   (SELECT id FROM public.categories WHERE name = 'Strength'),
   (SELECT id FROM public.muscle_groups WHERE name = 'Back'),
   'Bodyweight', 'Hang from bar, pull body up until chin clears bar'),
  ('Dumbbell Curl', 'Bicep isolation exercise',
   (SELECT id FROM public.categories WHERE name = 'Strength'),
   (SELECT id FROM public.muscle_groups WHERE name = 'Arms'),
   'Dumbbell', 'Hold dumbbells at sides, curl up to shoulders'),
  ('Plank', 'Core stability exercise',
   (SELECT id FROM public.categories WHERE name = 'Strength'),
   (SELECT id FROM public.muscle_groups WHERE name = 'Core'),
   'Bodyweight', 'Hold push-up position, keep body straight and core tight')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  muscle_group_id = EXCLUDED.muscle_group_id,
  equipment = EXCLUDED.equipment,
  instructions = EXCLUDED.instructions;
