'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getWorkoutFrequency } from '@/lib/progress';
import LoadingSpinner from './LoadingSpinner';

interface WorkoutFrequencyProps {
  userId: string;
}

interface FrequencyData {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
}

export default function WorkoutFrequency({ userId }: WorkoutFrequencyProps) {
  const [frequency, setFrequency] = useState<FrequencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFrequency() {
      try {
        const data = await getWorkoutFrequency(userId);
        setFrequency(data);
      } catch (error) {
        console.error('Error fetching workout frequency:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchFrequency();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Workout Frequency</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!frequency) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Workout Frequency</h2>
        <p className="text-gray-400">Unable to load frequency data</p>
      </div>
    );
  }

  const weeklyChange = frequency.thisWeek - frequency.lastWeek;
  const monthlyChange = frequency.thisMonth - frequency.lastMonth;

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendText = (change: number) => {
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Workout Frequency
      </h2>

      <div className="space-y-6">
        {/* Weekly Comparison */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-300">Weekly</h3>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(weeklyChange)}`}>
              {getTrendIcon(weeklyChange)}
              <span>{getTrendText(weeklyChange)} from last week</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {frequency.thisWeek}
              </div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 mb-1">
                {frequency.lastWeek}
              </div>
              <div className="text-sm text-gray-400">Last Week</div>
            </div>
          </div>

          {/* Visual bar comparison */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16">This week</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.thisWeek / Math.max(frequency.thisWeek, frequency.lastWeek, 1)) * 100, 5)}%` }}
                />
              </div>
              <span className="text-xs text-primary w-6">{frequency.thisWeek}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16">Last week</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.lastWeek / Math.max(frequency.thisWeek, frequency.lastWeek, 1)) * 100, 5)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6">{frequency.lastWeek}</span>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-300">Monthly</h3>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(monthlyChange)}`}>
              {getTrendIcon(monthlyChange)}
              <span>{getTrendText(monthlyChange)} from last month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {frequency.thisMonth}
              </div>
              <div className="text-sm text-gray-400">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 mb-1">
                {frequency.lastMonth}
              </div>
              <div className="text-sm text-gray-400">Last Month</div>
            </div>
          </div>

          {/* Visual bar comparison */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16">This month</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.thisMonth / Math.max(frequency.thisMonth, frequency.lastMonth, 1)) * 100, 5)}%` }}
                />
              </div>
              <span className="text-xs text-primary w-6">{frequency.thisMonth}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16">Last month</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.lastMonth / Math.max(frequency.thisMonth, frequency.lastMonth, 1)) * 100, 5)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6">{frequency.lastMonth}</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="font-medium text-gray-300 mb-3">Insights</h3>
          <div className="space-y-2 text-sm">
            {weeklyChange > 0 && (
              <p className="text-green-400">
                📈 Great job! You're more active this week than last week.
              </p>
            )}
            {weeklyChange < 0 && (
              <p className="text-yellow-400">
                💪 Try to match or exceed last week's activity level.
              </p>
            )}
            {monthlyChange > 0 && (
              <p className="text-green-400">
                🎯 Excellent monthly progress! Keep up the consistency.
              </p>
            )}
            {frequency.thisWeek >= 3 && (
              <p className="text-primary">
                🔥 You're crushing it with {frequency.thisWeek} workouts this week!
              </p>
            )}
            {frequency.thisWeek === 0 && (
              <p className="text-gray-400">
                🚀 Ready to start your week strong? Schedule your first workout!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
