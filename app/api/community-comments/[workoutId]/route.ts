import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { workoutId: string } }
) {
  try {
    const { workoutId } = params;

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    console.log('💬 Fetching comments for workout:', workoutId);

    // Get comments using service role
    const { data: comments, error } = await supabaseServiceRole
      .from('community_comments')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Get profile data for each comment
    const commentsWithProfiles = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: profile } = await supabaseServiceRole
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', comment.user_id)
          .single();
        
        return {
          ...comment,
          profiles: profile
        };
      })
    );

    console.log('✅ Comments fetched successfully:', commentsWithProfiles.length);
    return NextResponse.json({ comments: commentsWithProfiles });

  } catch (error) {
    console.error('❌ Server error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
