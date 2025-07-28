'use client';

import { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';

interface SetData {
  reps: number;
  weight: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
}

interface SetLoggerProps {
  onSetComplete: (setData: SetData) => void;
  onAddAnotherSet: () => void;
  onCompleteExercise: () => void;
  currentSetNumber: number;
  previousSet?: SetData;
  disabled?: boolean;
}

export default function SetLogger({ 
  onSetComplete, 
  onAddAnotherSet, 
  onCompleteExercise, 
  currentSetNumber, 
  previousSet,
  disabled = false 
}: SetLoggerProps) {
  const [reps, setReps] = useState(previousSet?.reps || 0);
  const [weight, setWeight] = useState(previousSet?.weight || 0);
  const [notes, setNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteSet = async () => {
    if (reps <= 0) {
      alert('Please enter valid reps');
      return;
    }

    setIsCompleting(true);
    const setData: SetData = {
      reps,
      weight,
      notes: notes.trim() || undefined
    };

    try {
      await onSetComplete(setData);
      // Reset form for next set
      setNotes('');
      // Keep weight and reps as they might be similar for next set
    } catch (error) {
      console.error('Error completing set:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const incrementReps = () => setReps(prev => prev + 1);
  const decrementReps = () => setReps(prev => Math.max(0, prev - 1));
  const incrementWeight = () => setWeight(prev => prev + 2.5); // Common weight increment
  const decrementWeight = () => setWeight(prev => Math.max(0, prev - 2.5));

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Set {currentSetNumber}</h3>
        {previousSet && (
          <div className="text-sm text-gray-400">
            Previous: {previousSet.reps} reps @ {previousSet.weight}kg
          </div>
        )}
      </div>

      {/* Reps Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Reps</label>
        <div className="flex items-center space-x-3">
          <button
            onClick={decrementReps}
            disabled={disabled || reps <= 0}
            className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
            disabled={disabled}
            className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={incrementReps}
            disabled={disabled}
            className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weight Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
        <div className="flex items-center space-x-3">
          <button
            onClick={decrementWeight}
            disabled={disabled || weight <= 0}
            className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
            disabled={disabled}
            className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={incrementWeight}
            disabled={disabled}
            className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did this set feel?"
          disabled={disabled}
          rows={2}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none disabled:opacity-50"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleCompleteSet}
          disabled={disabled || isCompleting || reps <= 0}
          className="flex-1 py-3 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>{isCompleting ? 'Saving...' : 'Complete Set'}</span>
        </button>
      </div>

      {/* Exercise Control Buttons */}
      <div className="flex space-x-3 pt-2 border-t border-gray-700">
        <button
          onClick={onAddAnotherSet}
          disabled={disabled}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Another Set
        </button>
        <button
          onClick={onCompleteExercise}
          disabled={disabled}
          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Complete Exercise
        </button>
      </div>
    </div>
  );
}
