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
    <div className="p-4 hover:border-gray-600 transition-colors" style={{ backgroundColor: '#2E2E2E', border: '1px solid #404040', borderRadius: '8px' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg mb-2">{exercise.name}</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Category:</span>
              <span className="px-2 py-1 text-xs font-medium" style={{ backgroundColor: '#5E5E5E', color: '#FFFC74', borderRadius: '12px' }}>
                {exercise.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Muscle Group:</span>
              <span className="px-2 py-1 text-xs font-medium" style={{ backgroundColor: '#5E5E5E', color: '#979797', borderRadius: '12px' }}>
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
              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 transition-colors" style={{ borderRadius: '8px' }}
              title="Edit exercise"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(exercise)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors" style={{ borderRadius: '8px' }}
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
