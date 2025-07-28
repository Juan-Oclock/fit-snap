import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session to ensure it's up to date
  await supabase.auth.getSession();
  
  // Get the pathname from the URL
  const path = req.nextUrl.pathname;
  
  // Check auth status using session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  // Debug logging
  console.log('Middleware - Path:', path, 'Session:', session ? 'found' : 'none', 'Error:', error?.message || 'none');
  
  const isAuthenticated = !!session && !error;
  
  // Auth routes (don't need redirection when authenticated)
  const authRoutes = ['/login', '/register', '/auth/callback', '/debug-auth'];
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/workout',
    '/exercises',
    '/progress',
    '/community',
    '/settings',
    '/profile'
  ];
  
  // Admin-only routes
  const adminRoutes = ['/admin'];
  
  // Check if the current path matches a route pattern
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  
  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // If user is not logged in and tries to access protected routes, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Handle admin-only routes
  if (isAdminRoute) {
    // First check if the user is logged in
    if (!isAuthenticated) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    // For admin routes, check if user has admin role
    // For now we'll use a simple email check as a placeholder
    // In a real app, you would check from a roles table in the database
    const isAdmin = session.user.email?.endsWith('@fitsnap.com') || 
                   session.user.app_metadata?.is_admin === true;
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
}

// Only run middleware on routes that require auth checking
export const config = {
  matcher: [
    // Auth routes that need special handling
    '/login',
    '/register',
    '/auth/callback',
    '/debug-auth',
    // Protected routes that require authentication
    // '/dashboard/:path*', // ✅ Uses (protected) layout only
    // '/workout/:path*', // ✅ Uses (protected) layout only
    // '/exercises/:path*', // ✅ Uses (protected) layout only
    '/history/:path*',
    // '/progress/:path*', // ✅ Uses (protected) layout only
    // '/settings/:path*', // ✅ Uses (protected) layout only - REMOVED to fix redirect loop
    // '/community/:path*', // ✅ Uses (protected) layout only - REMOVED to fix redirect loop 
    '/admin/:path*',
  ],
};
