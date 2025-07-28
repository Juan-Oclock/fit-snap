'use client';

import { Clock, Weight, RotateCcw } from 'lucide-react';

interface CompletedSet {
  id: string;
  reps: number;
  weight: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
  created_at: string;
}

interface CompletedExercise {
  id: string;
  exercise: {
    id: string;
    name: string;
    muscle_groups?: {
      name: string;
    };
  };
  sets: CompletedSet[];
  totalDuration: number;
  isCompleted: boolean;
}

interface LogPreviewProps {
  completedExercises: CompletedExercise[];
  currentExercise?: CompletedExercise;
  className?: string;
}

export default function LogPreview({ completedExercises, currentExercise, className = '' }: LogPreviewProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalWorkoutTime = (): number => {
    const completedTime = completedExercises.reduce((total, ex) => total + ex.totalDuration, 0);
    const currentTime = currentExercise?.totalDuration || 0;
    return completedTime + currentTime;
  };

  const getTotalSets = (): number => {
    const completedSets = completedExercises.reduce((total, ex) => total + ex.sets.length, 0);
    const currentSets = currentExercise?.sets.length || 0;
    return completedSets + currentSets;
  };

  if (completedExercises.length === 0 && !currentExercise) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 text-center text-gray-400 ${className}`}>
        <div className="text-sm">No exercises logged yet</div>
        <div className="text-xs mt-1">Start your first exercise to see progress here</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Workout Summary */}
      <div className="border-b border-gray-700 pb-3">
        <h3 className="text-lg font-medium text-white mb-2">Workout Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{completedExercises.length + (currentExercise ? 1 : 0)}</div>
            <div className="text-xs text-gray-400">Exercises</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{getTotalSets()}</div>
            <div className="text-xs text-gray-400">Total Sets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{formatTime(getTotalWorkoutTime())}</div>
            <div className="text-xs text-gray-400">Duration</div>
          </div>
        </div>
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <div className="border border-yellow-400 rounded-lg p-3 bg-yellow-400/5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-yellow-400">Current: {currentExercise.exercise.name}</h4>
            <div className="flex items-center space-x-1 text-yellow-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{formatTime(currentExercise.totalDuration)}</span>
            </div>
          </div>
          {currentExercise.sets.length > 0 && (
            <div className="space-y-1">
              {currentExercise.sets.map((set, index) => (
                <div key={set.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Set {index + 1}</span>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>{set.reps} reps</span>
                    <span>@</span>
                    <span className="flex items-center space-x-1">
                      <Weight className="w-3 h-3" />
                      <span>{set.weight}kg</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Exercises */}
      {completedExercises.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Completed Exercises</h4>
          {completedExercises.map((exercise) => (
            <div key={exercise.id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-green-400">✓ {exercise.exercise.name}</h5>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{formatTime(exercise.totalDuration)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-400">
                  Sets: <span className="text-white">{exercise.sets.length}</span>
                </div>
                <div className="text-gray-400">
                  Muscle: <span className="text-white">{exercise.exercise.muscle_groups?.name || 'Unknown'}</span>
                </div>
              </div>
              
              {/* Sets Summary */}
              <div className="mt-2 space-y-1">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Set {index + 1}</span>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span>{set.reps} reps</span>
                      <span>@</span>
                      <span className="flex items-center space-x-1">
                        <Weight className="w-3 h-3" />
                        <span>{set.weight}kg</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
