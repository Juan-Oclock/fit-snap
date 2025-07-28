'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Exercise } from '@/types';
import { createExercise, updateExercise, getExerciseOptions } from '@/lib/exercises';

interface ExerciseFormProps {
  exercise?: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

export default function ExerciseForm({ exercise, isOpen, onClose, onSave }: ExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    muscle_group: '',
    equipment: ''
  });
  const [options, setOptions] = useState({
    categories: [] as string[],
    muscleGroups: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load exercise options on mount
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const exerciseOptions = await getExerciseOptions();
        // console.log('Exercise options loaded:', exerciseOptions);
        setOptions(exerciseOptions);
      } catch (error) {
        console.error('Error loading exercise options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        category: exercise.category,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        muscle_group: '',
        equipment: ''
      });
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category || !formData.muscle_group) {
      return;
    }

    setIsSaving(true);
    try {
      let savedExercise: Exercise | null = null;

      if (exercise) {
        // Update existing exercise
        savedExercise = await updateExercise(exercise.id, {
          name: formData.name.trim(),
          category: formData.category,
          muscle_group: formData.muscle_group,
          equipment: formData.equipment.trim() || undefined
        });
      } else {
        // Create new exercise
        savedExercise = await createExercise({
          name: formData.name.trim(),
          category: formData.category,
          muscle_group: formData.muscle_group,
          equipment: formData.equipment.trim() || undefined
        });
      }

      if (savedExercise) {
        onSave(savedExercise);
        onClose();
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {exercise ? 'Edit Exercise' : 'Add New Exercise'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="e.g., Bench Press"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            {isLoading ? (
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {options.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="muscle_group" className="block text-sm font-medium text-gray-300 mb-2">
              Muscle Group *
            </label>
            {isLoading ? (
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <select
                id="muscle_group"
                value={formData.muscle_group}
                onChange={(e) => handleInputChange('muscle_group', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="">Select Muscle Group</option>
                {options.muscleGroups.map((muscleGroup) => (
                  <option key={muscleGroup} value={muscleGroup}>
                    {muscleGroup}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-300 mb-2">
              Equipment
            </label>
            <input
              type="text"
              id="equipment"
              value={formData.equipment}
              onChange={(e) => handleInputChange('equipment', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="e.g., Barbell, Dumbbells, Bodyweight"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.name.trim() || !formData.category || !formData.muscle_group}
              className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {exercise ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
