import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExerciseData {
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
}

const comprehensiveExercises: ExerciseData[] = [
  // CHEST EXERCISES
  { name: "Barbell Bench Press", category: "Strength", muscle_group: "Chest", equipment: "Barbell" },
  { name: "Incline Barbell Bench Press", category: "Strength", muscle_group: "Chest", equipment: "Barbell" },
  { name: "Decline Barbell Bench Press", category: "Strength", muscle_group: "Chest", equipment: "Barbell" },
  { name: "Dumbbell Bench Press", category: "Strength", muscle_group: "Chest", equipment: "Dumbbell" },
  { name: "Incline Dumbbell Press", category: "Strength", muscle_group: "Chest", equipment: "Dumbbell" },
  { name: "Decline Dumbbell Press", category: "Strength", muscle_group: "Chest", equipment: "Dumbbell" },
  { name: "Dumbbell Flyes", category: "Strength", muscle_group: "Chest", equipment: "Dumbbell" },
  { name: "Incline Dumbbell Flyes", category: "Strength", muscle_group: "Chest", equipment: "Dumbbell" },
  { name: "Cable Crossover", category: "Strength", muscle_group: "Chest", equipment: "Cable" },
  { name: "Chest Dips", category: "Strength", muscle_group: "Chest", equipment: "Bodyweight" },
  { name: "Push-Ups", category: "Strength", muscle_group: "Chest", equipment: "Bodyweight" },
  { name: "Diamond Push-Ups", category: "Strength", muscle_group: "Chest", equipment: "Bodyweight" },
  { name: "Wide Grip Push-Ups", category: "Strength", muscle_group: "Chest", equipment: "Bodyweight" },
  { name: "Pec Deck Machine", category: "Strength", muscle_group: "Chest", equipment: "Machine" },
  { name: "Chest Press Machine", category: "Strength", muscle_group: "Chest", equipment: "Machine" },

  // BACK EXERCISES
  { name: "Deadlift", category: "Strength", muscle_group: "Back", equipment: "Barbell" },
  { name: "Sumo Deadlift", category: "Strength", muscle_group: "Back", equipment: "Barbell" },
  { name: "Romanian Deadlift", category: "Strength", muscle_group: "Back", equipment: "Barbell" },
  { name: "Stiff Leg Deadlift", category: "Strength", muscle_group: "Back", equipment: "Barbell" },
  { name: "Barbell Rows", category: "Strength", muscle_group: "Back", equipment: "Barbell" },
  { name: "T-Bar Rows", category: "Strength", muscle_group: "Back", equipment: "Barbell" },
  { name: "Dumbbell Rows", category: "Strength", muscle_group: "Back", equipment: "Dumbbell" },
  { name: "Single Arm Dumbbell Row", category: "Strength", muscle_group: "Back", equipment: "Dumbbell" },
  { name: "Pull-Ups", category: "Strength", muscle_group: "Back", equipment: "Bodyweight" },
  { name: "Chin-Ups", category: "Strength", muscle_group: "Back", equipment: "Bodyweight" },
  { name: "Wide Grip Pull-Ups", category: "Strength", muscle_group: "Back", equipment: "Bodyweight" },
  { name: "Lat Pulldowns", category: "Strength", muscle_group: "Back", equipment: "Cable" },
  { name: "Wide Grip Lat Pulldowns", category: "Strength", muscle_group: "Back", equipment: "Cable" },
  { name: "Close Grip Lat Pulldowns", category: "Strength", muscle_group: "Back", equipment: "Cable" },
  { name: "Cable Rows", category: "Strength", muscle_group: "Back", equipment: "Cable" },
  { name: "Face Pulls", category: "Strength", muscle_group: "Back", equipment: "Cable" },
  { name: "Hyperextensions", category: "Strength", muscle_group: "Back", equipment: "Bodyweight" },
  { name: "Good Mornings", category: "Strength", muscle_group: "Back", equipment: "Barbell" },

  // SHOULDER EXERCISES
  { name: "Overhead Press", category: "Strength", muscle_group: "Shoulders", equipment: "Barbell" },
  { name: "Military Press", category: "Strength", muscle_group: "Shoulders", equipment: "Barbell" },
  { name: "Dumbbell Shoulder Press", category: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Arnold Press", category: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Lateral Raises", category: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Front Raises", category: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Rear Delt Flyes", category: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Upright Rows", category: "Strength", muscle_group: "Shoulders", equipment: "Barbell" },
  { name: "Shrugs", category: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Pike Push-Ups", category: "Strength", muscle_group: "Shoulders", equipment: "Bodyweight" },
  { name: "Handstand Push-Ups", category: "Strength", muscle_group: "Shoulders", equipment: "Bodyweight" },
  { name: "Cable Lateral Raises", category: "Strength", muscle_group: "Shoulders", equipment: "Cable" },
  { name: "Cable Rear Delt Flyes", category: "Strength", muscle_group: "Shoulders", equipment: "Cable" },

  // ARM EXERCISES - BICEPS
  { name: "Barbell Curls", category: "Strength", muscle_group: "Arms", equipment: "Barbell" },
  { name: "Dumbbell Curls", category: "Strength", muscle_group: "Arms", equipment: "Dumbbell" },
  { name: "Hammer Curls", category: "Strength", muscle_group: "Arms", equipment: "Dumbbell" },
  { name: "Preacher Curls", category: "Strength", muscle_group: "Arms", equipment: "Barbell" },
  { name: "Cable Curls", category: "Strength", muscle_group: "Arms", equipment: "Cable" },
  { name: "Concentration Curls", category: "Strength", muscle_group: "Arms", equipment: "Dumbbell" },
  { name: "21s Curls", category: "Strength", muscle_group: "Arms", equipment: "Barbell" },
  { name: "Zottman Curls", category: "Strength", muscle_group: "Arms", equipment: "Dumbbell" },

  // ARM EXERCISES - TRICEPS
  { name: "Close Grip Bench Press", category: "Strength", muscle_group: "Arms", equipment: "Barbell" },
  { name: "Tricep Dips", category: "Strength", muscle_group: "Arms", equipment: "Bodyweight" },
  { name: "Overhead Tricep Extension", category: "Strength", muscle_group: "Arms", equipment: "Dumbbell" },
  { name: "Tricep Pushdowns", category: "Strength", muscle_group: "Arms", equipment: "Cable" },
  { name: "Skull Crushers", category: "Strength", muscle_group: "Arms", equipment: "Barbell" },
  { name: "Diamond Push-Ups", category: "Strength", muscle_group: "Arms", equipment: "Bodyweight" },
  { name: "Tricep Kickbacks", category: "Strength", muscle_group: "Arms", equipment: "Dumbbell" },
  { name: "French Press", category: "Strength", muscle_group: "Arms", equipment: "Barbell" },

  // LEG EXERCISES - QUADRICEPS
  { name: "Barbell Squats", category: "Strength", muscle_group: "Legs", equipment: "Barbell" },
  { name: "Front Squats", category: "Strength", muscle_group: "Legs", equipment: "Barbell" },
  { name: "Goblet Squats", category: "Strength", muscle_group: "Legs", equipment: "Dumbbell" },
  { name: "Leg Press", category: "Strength", muscle_group: "Legs", equipment: "Machine" },
  { name: "Leg Extensions", category: "Strength", muscle_group: "Legs", equipment: "Machine" },
  { name: "Bulgarian Split Squats", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Lunges", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Walking Lunges", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Jump Squats", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Wall Sits", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Hack Squats", category: "Strength", muscle_group: "Legs", equipment: "Machine" },

  // LEG EXERCISES - HAMSTRINGS & GLUTES
  { name: "Romanian Deadlifts", category: "Strength", muscle_group: "Legs", equipment: "Barbell" },
  { name: "Leg Curls", category: "Strength", muscle_group: "Legs", equipment: "Machine" },
  { name: "Stiff Leg Deadlifts", category: "Strength", muscle_group: "Legs", equipment: "Dumbbell" },
  { name: "Hip Thrusts", category: "Strength", muscle_group: "Legs", equipment: "Barbell" },
  { name: "Glute Bridges", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Single Leg Glute Bridges", category: "Strength", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Good Mornings", category: "Strength", muscle_group: "Legs", equipment: "Barbell" },

  // LEG EXERCISES - CALVES
  { name: "Standing Calf Raises", category: "Strength", muscle_group: "Legs", equipment: "Machine" },
  { name: "Seated Calf Raises", category: "Strength", muscle_group: "Legs", equipment: "Machine" },
  { name: "Calf Press", category: "Strength", muscle_group: "Legs", equipment: "Machine" },
  { name: "Donkey Calf Raises", category: "Strength", muscle_group: "Legs", equipment: "Machine" },

  // CORE EXERCISES
  { name: "Plank", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Side Plank", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Crunches", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Bicycle Crunches", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Russian Twists", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Leg Raises", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Hanging Leg Raises", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Mountain Climbers", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Dead Bug", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Bird Dog", category: "Core", muscle_group: "Core", equipment: "Bodyweight" },
  { name: "Ab Wheel Rollouts", category: "Core", muscle_group: "Core", equipment: "Equipment" },
  { name: "Cable Crunches", category: "Core", muscle_group: "Core", equipment: "Cable" },
  { name: "Woodchoppers", category: "Core", muscle_group: "Core", equipment: "Cable" },
  { name: "Pallof Press", category: "Core", muscle_group: "Core", equipment: "Cable" },

  // CARDIO EXERCISES
  { name: "Running", category: "Cardio", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Treadmill", category: "Cardio", muscle_group: "Full Body", equipment: "Machine" },
  { name: "Cycling", category: "Cardio", muscle_group: "Legs", equipment: "Machine" },
  { name: "Stationary Bike", category: "Cardio", muscle_group: "Legs", equipment: "Machine" },
  { name: "Elliptical", category: "Cardio", muscle_group: "Full Body", equipment: "Machine" },
  { name: "Rowing Machine", category: "Cardio", muscle_group: "Full Body", equipment: "Machine" },
  { name: "Stair Climber", category: "Cardio", muscle_group: "Legs", equipment: "Machine" },
  { name: "Jumping Jacks", category: "Cardio", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Burpees", category: "Cardio", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "High Knees", category: "Cardio", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Butt Kickers", category: "Cardio", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Jump Rope", category: "Cardio", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Box Jumps", category: "Cardio", muscle_group: "Legs", equipment: "Equipment" },
  { name: "Battle Ropes", category: "Cardio", muscle_group: "Full Body", equipment: "Equipment" },

  // FLEXIBILITY EXERCISES
  { name: "Forward Fold", category: "Flexibility", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Downward Dog", category: "Flexibility", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Child's Pose", category: "Flexibility", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Pigeon Pose", category: "Flexibility", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Cat Cow Stretch", category: "Flexibility", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Hip Flexor Stretch", category: "Flexibility", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Hamstring Stretch", category: "Flexibility", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Quad Stretch", category: "Flexibility", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Calf Stretch", category: "Flexibility", muscle_group: "Legs", equipment: "Bodyweight" },
  { name: "Shoulder Stretch", category: "Flexibility", muscle_group: "Shoulders", equipment: "Bodyweight" },
  { name: "Chest Stretch", category: "Flexibility", muscle_group: "Chest", equipment: "Bodyweight" },
  { name: "Tricep Stretch", category: "Flexibility", muscle_group: "Arms", equipment: "Bodyweight" },

  // OLYMPIC LIFTS
  { name: "Clean and Jerk", category: "Strength", muscle_group: "Full Body", equipment: "Barbell" },
  { name: "Snatch", category: "Strength", muscle_group: "Full Body", equipment: "Barbell" },
  { name: "Power Clean", category: "Strength", muscle_group: "Full Body", equipment: "Barbell" },
  { name: "Hang Clean", category: "Strength", muscle_group: "Full Body", equipment: "Barbell" },
  { name: "Push Press", category: "Strength", muscle_group: "Shoulders", equipment: "Barbell" },
  { name: "Push Jerk", category: "Strength", muscle_group: "Shoulders", equipment: "Barbell" },

  // FUNCTIONAL EXERCISES
  { name: "Farmer's Walk", category: "Strength", muscle_group: "Full Body", equipment: "Dumbbell" },
  { name: "Turkish Get-Up", category: "Strength", muscle_group: "Full Body", equipment: "Kettlebell" },
  { name: "Kettlebell Swings", category: "Strength", muscle_group: "Full Body", equipment: "Kettlebell" },
  { name: "Kettlebell Goblet Squats", category: "Strength", muscle_group: "Legs", equipment: "Kettlebell" },
  { name: "Kettlebell Deadlifts", category: "Strength", muscle_group: "Legs", equipment: "Kettlebell" },
  { name: "Kettlebell Press", category: "Strength", muscle_group: "Shoulders", equipment: "Kettlebell" },
  { name: "Medicine Ball Slams", category: "Strength", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Wall Balls", category: "Strength", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Tire Flips", category: "Strength", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Sledgehammer Swings", category: "Strength", muscle_group: "Full Body", equipment: "Equipment" },

  // SPORTS SPECIFIC
  { name: "Swimming", category: "Sports", muscle_group: "Full Body", equipment: "Bodyweight" },
  { name: "Basketball", category: "Sports", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Tennis", category: "Sports", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Soccer", category: "Sports", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Rock Climbing", category: "Sports", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Boxing", category: "Sports", muscle_group: "Full Body", equipment: "Equipment" },
  { name: "Martial Arts", category: "Sports", muscle_group: "Full Body", equipment: "Bodyweight" },
];

async function seedComprehensiveExercises() {
  console.log('🔧 Environment check:');
  console.log(`   Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

  console.log('🌱 Seeding comprehensive exercises...');

  try {
    // Check existing exercises
    console.log('🔍 Checking existing exercises...');
    const { data: existingExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('name');

    if (fetchError) {
      console.error('❌ Error fetching existing exercises:', fetchError);
      return;
    }

    const existingNames = new Set(existingExercises?.map(ex => ex.name) || []);
    console.log(`📊 Found ${existingNames.size} existing exercises`);

    // Filter out exercises that already exist
    const newExercises = comprehensiveExercises.filter(exercise => 
      !existingNames.has(exercise.name)
    );

    console.log(`🆕 Found ${newExercises.length} new exercises to add`);

    if (newExercises.length === 0) {
      console.log('✅ All exercises already exist in database!');
      return;
    }

    // Insert new exercises in batches
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < newExercises.length; i += batchSize) {
      const batch = newExercises.slice(i, i + batchSize);
      
      console.log(`💾 Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newExercises.length/batchSize)} (${batch.length} exercises)...`);
      
      const { data, error } = await supabase
        .from('exercises')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }

      totalInserted += data?.length || 0;
      console.log(`✅ Successfully inserted ${data?.length || 0} exercises in this batch`);
    }

    console.log(`🎉 Comprehensive exercise seeding completed!`);
    console.log(`📈 Total new exercises added: ${totalInserted}`);
    
    // Show final count
    const { data: finalCount } = await supabase
      .from('exercises')
      .select('id', { count: 'exact' });
    
    console.log(`📊 Total exercises in database: ${finalCount?.length || 'unknown'}`);

  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
  }
}

// Run the seeding function
seedComprehensiveExercises()
  .then(() => {
    console.log('🏁 Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });
