import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

// Debug environment variables (hide sensitive parts)
console.log('🔧 Environment check:');
console.log(`   Supabase URL: ${supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET'}`);
console.log(`   Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'NOT SET'}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log('🔍 Checking exercises table structure...');
  
  try {
    // Try to get one row to see the column structure
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking table structure:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Exercises table columns:', Object.keys(data[0]));
      return Object.keys(data[0]);
    } else {
      console.log('📋 Exercises table is empty, checking schema...');
      // Try inserting a test row to see what columns are expected
      const testExercise = {
        name: 'Test Exercise',
        category_id: '00000000-0000-0000-0000-000000000000',
        muscle_group_id: '00000000-0000-0000-0000-000000000000'
      };
      
      const { error: testError } = await supabase
        .from('exercises')
        .insert(testExercise)
        .select();
        
      if (testError) {
        console.log('❌ Test insert error (this helps us see column names):', testError.message);
        
        // Try alternative column names
        const altTestExercise = {
          name: 'Test Exercise',
          category: '00000000-0000-0000-0000-000000000000',
          muscle_group: '00000000-0000-0000-0000-000000000000'
        };
        
        const { error: altError } = await supabase
          .from('exercises')
          .insert(altTestExercise)
          .select();
          
        if (altError) {
          console.log('❌ Alternative test insert error:', altError.message);
        } else {
          console.log('✅ Alternative column names work: category, muscle_group');
          return ['category', 'muscle_group'];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    return null;
  }
}

// Check existing exercises and clean up duplicates
async function checkExistingExercises() {
  console.log('🔍 Checking existing exercises...');
  
  const { data: existingExercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (error) {
    console.error('❌ Error fetching existing exercises:', error);
    return;
  }

  if (existingExercises && existingExercises.length > 0) {
    console.log(`📊 Found ${existingExercises.length} existing exercises:`);
    existingExercises.forEach(exercise => {
      console.log(`  - ${exercise.name}: category="${exercise.category}", muscle_group="${exercise.muscle_group}"`);
    });

    // Check for duplicates by name
    const nameCount: { [key: string]: number } = {};
    existingExercises.forEach(exercise => {
      nameCount[exercise.name] = (nameCount[exercise.name] || 0) + 1;
    });

    const duplicates = Object.entries(nameCount).filter(([name, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate exercises:');
      duplicates.forEach(([name, count]) => {
        console.log(`  - ${name}: ${count} entries`);
      });
      
      console.log('🧹 Cleaning up duplicates...');
      // Delete all exercises to start fresh
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (deleteError) {
        console.error('❌ Error cleaning up exercises:', deleteError);
      } else {
        console.log('✅ Cleaned up all existing exercises');
      }
    }
  } else {
    console.log('📝 No existing exercises found');
  }
}

async function seedExercises() {
  console.log('🌱 Seeding exercises...');

  try {
    // Check existing exercises and clean up duplicates
    await checkExistingExercises();

    // Check table structure first
    const columns = await checkTableStructure();
    
    // Verify that categories and muscle_groups tables exist (for reference)
    console.log('📋 Verifying categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name')
      .limit(1);

    console.log('💪 Verifying muscle_groups table...');
    const { data: muscleGroups, error: muscleGroupsError } = await supabase
      .from('muscle_groups')
      .select('name')
      .limit(1);

    if (categoriesError || muscleGroupsError) {
      console.log('⚠️  Categories or muscle_groups tables not accessible, but proceeding with seeding...');
    }

    console.log('🏋️ Creating exercise data...');

    // Sample exercises to insert - using names instead of IDs
    const exercises = [
      {
        name: 'Bench Press',
        category: 'Strength',
        muscle_group: 'Chest',
        equipment: 'Barbell'
      },
      {
        name: 'Goblet Squat',
        category: 'Strength',
        muscle_group: 'Legs',
        equipment: 'Dumbbell'
      },
      {
        name: 'Barbell Row',
        category: 'Strength',
        muscle_group: 'Back',
        equipment: 'Barbell'
      },
      {
        name: 'Pull-Up',
        category: 'Strength',
        muscle_group: 'Back',
        equipment: 'Bodyweight'
      },
      {
        name: 'Dumbbell Curl',
        category: 'Strength',
        muscle_group: 'Arms',
        equipment: 'Dumbbell'
      },
      {
        name: 'Plank',
        category: 'Strength',
        muscle_group: 'Core',
        equipment: 'Bodyweight'
      }
    ];

    // Insert exercises (simple insert since no unique constraint exists)
    console.log('💾 Inserting exercises into database...');
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercises)
      .select();

    if (error) {
      console.error('❌ Error inserting exercises:', error);
      throw error;
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} exercises:`);
    data?.forEach(exercise => {
      console.log(`  - ${exercise.name} (${exercise.equipment}) - ${exercise.muscle_group}`);
    });

  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedExercises()
  .then(() => {
    console.log('🎉 Exercise seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
