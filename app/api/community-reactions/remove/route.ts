import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { workoutId, userId } = await request.json();

    if (!workoutId || !userId) {
      return NextResponse.json({ error: 'Workout ID and User ID are required' }, { status: 400 });
    }

    console.log('🔄 Removing reaction:', { workoutId, userId });

    // Remove the reaction
    const { error } = await supabaseServiceRole
      .from('community_reactions')
      .delete()
      .eq('workout_id', workoutId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error removing reaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Reaction removed successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Reaction removed successfully'
    });

  } catch (error) {
    console.error('❌ Error in remove reaction API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
