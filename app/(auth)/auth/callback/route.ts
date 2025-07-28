import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  try {
    if (code) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error.message);
        // Redirect to login page with error
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
        );
      }
      
      if (!data.session) {
        // No session created, redirect to login
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('No session created')}`, request.url)
        );
      }
    }
    
    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('Unexpected error in auth callback:', err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication error')}`, request.url)
    );
  }
}
