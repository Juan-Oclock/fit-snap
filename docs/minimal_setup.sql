-- Minimal setup for FitSnap exercise seeding
-- Run this if you're getting conflicts with the full schema

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create muscle_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.muscle_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  muscle_group_id UUID REFERENCES public.muscle_groups(id),
  equipment TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories (ignore conflicts)
INSERT INTO public.categories (name, description) VALUES
  ('Strength', 'Resistance and weight training exercises'),
  ('Cardio', 'Cardiovascular and endurance exercises'),
  ('Flexibility', 'Stretching and mobility exercises'),
  ('Sports', 'Sport-specific training exercises')
ON CONFLICT (name) DO NOTHING;

-- Insert sample muscle groups (ignore conflicts)
INSERT INTO public.muscle_groups (name, description) VALUES
  ('Chest', 'Pectoral muscles'),
  ('Back', 'Latissimus dorsi, rhomboids, and other back muscles'),
  ('Legs', 'Quadriceps, hamstrings, glutes, and calves'),
  ('Arms', 'Biceps, triceps, and forearms'),
  ('Shoulders', 'Deltoids and rotator cuff muscles'),
  ('Core', 'Abdominals and lower back muscles')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (allow all users to read)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Create policies for muscle_groups (allow all users to read)
DROP POLICY IF EXISTS "Muscle groups are viewable by everyone" ON public.muscle_groups;
CREATE POLICY "Muscle groups are viewable by everyone" ON public.muscle_groups
  FOR SELECT USING (true);

-- Create policies for exercises (allow all users to read)
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON public.exercises;
CREATE POLICY "Exercises are viewable by everyone" ON public.exercises
  FOR SELECT USING (true);
