import { supabase } from './supabase';
import { Exercise } from '@/types';

// Fetch all exercises
export const fetchExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }

  return data || [];
};

// Search exercises by name
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10);

  if (error) {
    console.error('Error searching exercises:', error);
    return [];
  }

  return data || [];
};

// Filter exercises by category and/or muscle group
export const filterExercises = async (
  category?: string,
  muscleGroup?: string,
  searchQuery?: string
): Promise<Exercise[]> => {
  let query = supabase
    .from('exercises')
    .select('*');

  if (category) {
    query = query.eq('category', category);
  }

  if (muscleGroup) {
    query = query.eq('muscle_group', muscleGroup);
  }

  if (searchQuery && searchQuery.trim()) {
    query = query.ilike('name', `%${searchQuery}%`);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error filtering exercises:', error);
    return [];
  }

  return data || [];
};

// Create a new exercise
export const createExercise = async (exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from('exercises')
    .insert([exercise])
    .select()
    .single();

  if (error) {
    console.error('Error creating exercise:', error);
    return null;
  }

  return data;
};

// Update an existing exercise
export const updateExercise = async (id: string, updates: Partial<Omit<Exercise, 'id' | 'created_at'>>): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise:', error);
    return null;
  }

  return data;
};

// Delete an exercise
export const deleteExercise = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting exercise:', error);
    return false;
  }

  return true;
};

// Get available categories and muscle groups
export const getExerciseOptions = async (): Promise<{
  categories: string[];
  muscleGroups: string[];
}> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('category, muscle_group');

  if (error) {
    console.error('Error fetching exercise options:', error);
    return { categories: [], muscleGroups: [] };
  }

  const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
  const muscleGroups = [...new Set(data.map(item => item.muscle_group))].filter(Boolean).sort();

  return { categories, muscleGroups };
};
