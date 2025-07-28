# FitSnap Database Setup Guide

This guide will help you set up the FitSnap database with all required tables and seed data.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the following environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Database Access**: Ensure you have access to your Supabase SQL Editor or can run SQL commands.

## Step 1: Create Database Schema

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the entire contents of `/docs/database_schema.sql`
4. Run the SQL script

This will create all necessary tables:
- `profiles` - User profiles
- `user_goals` - Monthly workout goals
- `user_settings` - User preferences (rest time, theme, etc.)
- `categories` - Exercise categories
- `muscle_groups` - Muscle group definitions
- `exercises` - Exercise library
- `workouts` - User workout sessions
- `workout_exercises` - Exercises in each workout
- `workout_sets` - Individual sets with reps/weight
- `personal_records` - User PRs for each exercise
- `quotes` - Motivational quotes
- `progress_photos` - Before/after photos
- `community_posts` - Shared workout posts

## Step 2: Seed Sample Exercises

### Option A: Using the Seeding Script (Recommended)

1. Install required dependencies:
   ```bash
   npm install -g tsx
   npm install dotenv
   ```

2. Ensure your `.env.local` file has the required variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run the seeding script:
   ```bash
   npm run seed:exercises
   ```

This will automatically insert the following sample exercises:
- **Bench Press** (Chest, Barbell)
- **Goblet Squat** (Legs, Dumbbell)
- **Barbell Row** (Back, Barbell)
- **Pull-Up** (Back, Bodyweight)
- **Dumbbell Curl** (Arms, Dumbbell)
- **Plank** (Core, Bodyweight)

### Option B: Manual SQL Insert

If you prefer to insert manually, run this SQL in your Supabase SQL Editor:

```sql
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
```

## Step 3: Set Up Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `workout-photos`
3. Set the bucket to **Public** (for photo URLs to work)
4. Configure RLS policies if needed

## Step 4: Verify Setup

1. Check that all tables are created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. Verify exercises were inserted:
   ```sql
   SELECT name, equipment FROM exercises ORDER BY name;
   ```

3. Test the workout page:
   - Navigate to `/workout` in your app
   - Try searching for exercises (should show the seeded ones)
   - Create a test workout to ensure database integration works

## Features Now Available

After completing the setup, your FitSnap app will have:

✅ **Exercise Search** - Real-time search from the exercises table  
✅ **Workout Logging** - Save workouts with exercises and sets  
✅ **Personal Records** - Automatic PR tracking and updates  
✅ **Rest Timer** - Uses user's preferred rest time from settings  
✅ **Photo Upload** - Workout photos saved to Supabase Storage  
✅ **Data Persistence** - All workout data saved with proper relationships  

## Troubleshooting

### Common Issues

1. **"Categories or muscle groups not found"**
   - Ensure you ran the full database schema first
   - Check that the sample data was inserted correctly

2. **"Permission denied" errors**
   - Verify your RLS policies are set up correctly
   - Check that you're using the service role key for seeding

3. **Exercise search not working**
   - Confirm exercises table has data
   - Check your Supabase connection in the app

4. **Photo upload failing**
   - Ensure the `workout-photos` bucket exists and is public
   - Verify storage permissions in Supabase

5. **Environment variable issues**
   - Ensure you have installed dotenv and created a `.env.local` file
   - Verify that your environment variables are correctly set in the `.env.local` file

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Review the Supabase logs in your dashboard
3. Verify your environment variables are correct
4. Ensure all database tables and relationships are properly created

## Next Steps

With the database connected, you can now:
- Create and log workouts with real exercise data
- Track personal records automatically
- Upload workout photos
- Set custom rest timer preferences
- View workout history and progress

The app is now fully connected to the database and ready for use! 🎉
