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
      <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
        <h2 className="text-xl font-semibold mb-4 text-white">Monthly Goal Progress</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
        <h2 className="text-xl font-semibold mb-4 text-white">Monthly Goal Progress</h2>
        <p style={{ color: '#979797' }}>Unable to load progress data</p>
      </div>
    );
  }

  const isGoalMet = progress.current >= progress.target;
  const remainingSessions = Math.max(0, progress.target - progress.current);

  return (
    <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-white">{currentMonth} Goal Progress</h2>
        <div className="text-right">
          <p className="text-xs" style={{ color: '#979797' }}>{remainingDays} days left</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center space-y-3">
          <ProgressCircle
            current={progress.current}
            target={progress.target}
            size={140}
            strokeWidth={10}
            showPercentage={true}
            showValues={false}
          />
          <div className="text-center">
            <span className="text-lg font-medium" style={{ color: '#FFFC74' }}>
              {progress.current} of {progress.target}
            </span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-white">
            {progress.current} of {progress.target} sessions completed
          </p>
          
          {isGoalMet ? (
            <div className="space-y-1">
              <p className="font-medium" style={{ color: '#FFFC74' }}>🎉 Goal achieved!</p>
              <p className="text-sm" style={{ color: '#979797' }}>
                Great job staying consistent this month!
              </p>
              {remainingDays > 0 && (
                <p className="text-xs" style={{ color: '#22c55e' }}>
                  Keep going! {remainingDays} days left to exceed your goal
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-white">
                {remainingSessions} session{remainingSessions !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-sm" style={{ color: '#979797' }}>
                {Math.round(progress.percentage)}% complete
              </p>
              {remainingDays > 0 && remainingSessions > remainingDays && (
                <p className="text-xs" style={{ color: '#FFFC74' }}>
                  ⚠️ Need {(remainingSessions / remainingDays).toFixed(1)} sessions/day to reach goal
                </p>
              )}
              {remainingDays > 0 && remainingSessions <= remainingDays && remainingSessions > 0 && (
                <p className="text-xs" style={{ color: '#22c55e' }}>
                  ✅ On track! About 1 session every {Math.ceil(remainingDays / remainingSessions)} days
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress bar for mobile/alternative view */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm mb-2" style={{ color: '#979797' }}>
            <span>Progress</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#404040' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress.percentage, 100)}%`, backgroundColor: '#FFFC74' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
