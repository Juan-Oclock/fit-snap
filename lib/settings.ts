import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserProfile, UserSettings, UserGoals } from '@/types';
import { getRemainingDaysInMonth } from './date-utils';
import { compressAvatar, validateImageFile, getCompressionStats } from '@/lib/image-compression';

const supabase = createClientComponentClient();

// Profile functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
}

export async function createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return false;
  }
}

// Settings functions
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings exist, return default settings
      if (error.code === 'PGRST116') {
        return {
          id: '',
          user_id: userId,
          default_rest_seconds: 60,
          theme: 'dark',
          notifications_enabled: true,
          community_sharing_enabled: false,
          created_at: '',
          updated_at: ''
        };
      }
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSettings:', error);
    return null;
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
  try {
    // First try to update existing settings
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user settings:', error);
        return false;
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          default_rest_seconds: 60,
          theme: 'dark',
          notifications_enabled: true,
          community_sharing_enabled: false,
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user settings:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    return false;
  }
}

// Goals functions
export async function getUserGoals(userId: string): Promise<UserGoals | null> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no goals exist, return default goals
      if (error.code === 'PGRST116') {
        const remainingDays = getRemainingDaysInMonth();
        return {
          id: '',
          user_id: userId,
          monthly_workout_target: Math.min(12, remainingDays),
          created_at: '',
          updated_at: ''
        };
      }
      console.error('Error fetching user goals:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserGoals:', error);
    return null;
  }
}

export async function updateUserGoals(userId: string, goals: Partial<UserGoals>): Promise<boolean> {
  try {
    // First try to update existing goals
    const { data: existingGoals } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingGoals) {
      // Update existing goals
      const { error } = await supabase
        .from('user_goals')
        .update({
          ...goals,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user goals:', error);
        return false;
      }
    } else {
      // Create new goals with remaining days limit
      const remainingDays = getRemainingDaysInMonth();
      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          monthly_workout_target: Math.min(goals.monthly_workout_target || 12, remainingDays),
          ...goals,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user goals:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserGoals:', error);
    return false;
  }
}

// Account actions
export async function deleteUserAccount(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(
      (await supabase.auth.getUser()).data.user?.id || ''
    );

    if (error) {
      console.error('Error deleting user account:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    return false;
  }
}

export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in signOut:', error);
    return false;
  }
}

// Upload avatar image with compression
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    // Validate the image file first
    const validation = validateImageFile(file, 5); // 5MB max
    if (!validation.valid) {
      console.error('Invalid image file:', validation.error);
      throw new Error(validation.error);
    }

    // Compress the image before upload
    const compressedFile = await compressAvatar(file);
    
    // Log compression stats
    const stats = getCompressionStats(file, compressedFile);
    console.log('Image compression:', stats);
    
    const fileExt = 'jpg'; // Always use jpg after compression
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // Store in root of avatars bucket

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return null;
  }
}

// Helper function to get community sharing preference
export async function getUserCommunitySharing(userId: string): Promise<boolean> {
  try {
    const settings = await getUserSettings(userId);
    return settings?.community_sharing_enabled ?? false;
  } catch (error) {
    console.error('Error getting community sharing preference:', error);
    return false;
  }
}
