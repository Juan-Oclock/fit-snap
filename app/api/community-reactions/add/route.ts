import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { workoutId, reactionType = 'like', userId } = await request.json();

    if (!workoutId || !userId) {
      return NextResponse.json({ error: 'Workout ID and User ID are required' }, { status: 400 });
    }

    console.log('🔄 Adding reaction:', { workoutId, userId, reactionType });

    // First, remove any existing reaction (toggle behavior)
    const { error: deleteError } = await supabaseServiceRole
      .from('community_reactions')
      .delete()
      .eq('workout_id', workoutId)
      .eq('user_id', userId);

    if (deleteError) {
      console.log('⚠️ Delete existing reaction error (may be normal):', deleteError.message);
    } else {
      console.log('✅ Existing reactions cleared');
    }

    // Add the new reaction
    const { data, error } = await supabaseServiceRole
      .from('community_reactions')
      .insert({
        workout_id: workoutId,
        user_id: userId,
        reaction_type: reactionType
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding reaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Reaction added successfully:', data);

    return NextResponse.json({ 
      success: true, 
      reaction: data,
      message: 'Reaction added successfully'
    });

  } catch (error) {
    console.error('❌ Error in add reaction API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
