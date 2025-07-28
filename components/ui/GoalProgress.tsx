'use client';

import { useEffect, useState } from 'react';
import { getMonthlyProgress } from '@/lib/progress';
import { getRemainingDaysInMonth, getCurrentMonthName } from '@/lib/date-utils';
import ProgressCircle from './ProgressCircle';
import LoadingSpinner from './LoadingSpinner';

interface GoalProgressProps {
  userId: string;
}

interface ProgressData {
  current: number;
  target: number;
  percentage: number;
}

export default function GoalProgress({ userId }: GoalProgressProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const remainingDays = getRemainingDaysInMonth();
  const currentMonth = getCurrentMonthName();

  useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await getMonthlyProgress(userId);
        setProgress(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Monthly Goal Progress</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Monthly Goal Progress</h2>
        <p className="text-gray-400">Unable to load progress data</p>
      </div>
    );
  }

  const isGoalMet = progress.current >= progress.target;
  const remainingSessions = Math.max(0, progress.target - progress.current);

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">{currentMonth} Goal Progress</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400">{remainingDays} days left</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <ProgressCircle
            current={progress.current}
            target={progress.target}
            size={140}
            strokeWidth={10}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {progress.current}
            </span>
            <span className="text-sm text-gray-400">
              of {progress.target}
            </span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            {progress.current} of {progress.target} sessions completed
          </p>
          
          {isGoalMet ? (
            <div className="space-y-1">
              <p className="text-primary font-medium">🎉 Goal achieved!</p>
              <p className="text-sm text-gray-400">
                Great job staying consistent this month!
              </p>
              {remainingDays > 0 && (
                <p className="text-xs text-green-400">
                  Keep going! {remainingDays} days left to exceed your goal
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-gray-300">
                {remainingSessions} session{remainingSessions !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-sm text-gray-400">
                {Math.round(progress.percentage)}% complete
              </p>
              {remainingDays > 0 && remainingSessions > remainingDays && (
                <p className="text-xs text-yellow-400">
                  ⚠️ Need {(remainingSessions / remainingDays).toFixed(1)} sessions/day to reach goal
                </p>
              )}
              {remainingDays > 0 && remainingSessions <= remainingDays && remainingSessions > 0 && (
                <p className="text-xs text-green-400">
                  ✅ On track! About 1 session every {Math.ceil(remainingDays / remainingSessions)} days
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress bar for mobile/alternative view */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
