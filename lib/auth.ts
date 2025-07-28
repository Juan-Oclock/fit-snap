import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

// Check if the current user is an admin (can manage exercises)
export const isAdmin = async (): Promise<boolean> => {
  try {
    // console.log('Admin check - Starting...');
    
    // First, try to get admin status from localStorage (set during login)
    const storedAdminStatus = localStorage.getItem('isAdmin');
    if (storedAdminStatus !== null) {
      const isAdminUser = storedAdminStatus === 'true';
      // console.log('Admin check - Using stored status:', isAdminUser);
      return isAdminUser;
    }
    
    // Fallback: Check session if no stored status (for existing sessions)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // console.log('Admin check - Session error:', error);
    // console.log('Admin check - Email:', session?.user?.email);
    
    if (!session?.user?.email) {
      // console.log('Admin check - No session or email found');
      return false;
    }
    
    const userEmail = session.user.email.toLowerCase().trim();
    const adminEmail = 'onelasttimejuan@gmail.com';
    const isAdminUser = userEmail === adminEmail;
    
    // console.log('Admin check - Is admin (from session):', isAdminUser);
    
    // Store the result for future use
    localStorage.setItem('isAdmin', isAdminUser.toString());
    
    return isAdminUser;
    
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Clear admin status (call on logout)
export const clearAdminStatus = () => {
  localStorage.removeItem('isAdmin');
};

// Get current user session
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
