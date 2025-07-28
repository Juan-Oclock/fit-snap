'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  isAdmin?: boolean;
}

export default function ExerciseCard({ exercise, onEdit, onDelete, isAdmin = false }: ExerciseCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg mb-2">{exercise.name}</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Category:</span>
              <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                {exercise.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Muscle Group:</span>
              <span className="bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                {exercise.muscle_group}
              </span>
            </div>
            {exercise.equipment && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Equipment:</span>
                <span className="text-gray-300">{exercise.equipment}</span>
              </div>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(exercise)}
              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit exercise"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(exercise)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete exercise"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
