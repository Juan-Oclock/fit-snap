'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { Exercise } from '@/types';
import { searchExercises } from '@/lib/exercises';

interface ExerciseSearchProps {
  onExerciseSelect: (exercise: Exercise) => void;
  placeholder?: string;
  className?: string;
}

export default function ExerciseSearch({ 
  onExerciseSelect, 
  placeholder = "Search exercises by name or muscle groups...",
  className = ""
}: ExerciseSearchProps) {
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchForExercises = async () => {
      if (query.trim().length < 2) {
        setExercises([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchExercises(query);
        setExercises(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching exercises:', error);
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchForExercises, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setQuery('');
    setShowResults(false);
    setExercises([]);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
          </div>
        )}
      </div>

      {showResults && exercises.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-center justify-between group"
            >
              <div>
                <div className="font-medium text-white">{exercise.name}</div>
                {exercise.equipment && (
                  <div className="text-sm text-gray-400 mt-1 truncate">
                    {exercise.equipment}
                  </div>
                )}
              </div>
              <Plus className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && exercises.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-400">
          No exercises found for "{query}"
        </div>
      )}
    </div>
  );
}
