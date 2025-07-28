'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Exercise } from '@/types';

interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: Exercise) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ExerciseSelector({ onExerciseSelect, disabled = false, placeholder = "Search exercises..." }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchExercises();
    } else {
      setExercises([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const searchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          id,
          name,
          category,
          muscle_group,
          equipment,
          created_at
        `)
        .or(`name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setExercises(data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setSearchQuery('');
    setShowDropdown(false);
    setExercises([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length > 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          </div>
        )}
      </div>

      {showDropdown && exercises.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-white">{exercise.name}</div>
                <div className="text-sm text-gray-400">
                  {exercise.muscle_group || 'Unknown muscle group'}
                </div>
              </div>
              <Plus className="w-4 h-4 text-yellow-400" />
            </button>
          ))}
        </div>
      )}

      {showDropdown && exercises.length === 0 && searchQuery.length > 2 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 p-4 text-center text-gray-400">
          No exercises found
        </div>
      )}
    </div>
  );
}
