import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { workoutId, content, userId } = await request.json();

    if (!workoutId || !content || !userId) {
      return NextResponse.json({ error: 'Workout ID, content, and User ID are required' }, { status: 400 });
    }

    console.log('💬 Adding comment:', { workoutId, userId, contentLength: content.length });

    // Add the comment using service role
    const { data: comment, error } = await supabaseServiceRole
      .from('community_comments')
      .insert({
        workout_id: workoutId,
        user_id: userId,
        content: content.trim()
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error adding comment:', error);
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }

    // Get profile data for the comment
    const { data: profile } = await supabaseServiceRole
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userId)
      .single();

    const commentWithProfile = {
      ...comment,
      profiles: profile
    };

    console.log('✅ Comment added successfully');
    return NextResponse.json({ comment: commentWithProfile });

  } catch (error) {
    console.error('❌ Server error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
