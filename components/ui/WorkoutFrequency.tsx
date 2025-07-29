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
      <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
        <h2 className="text-xl font-semibold mb-4 text-white">WORKOUT FREQUENCY</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!frequency) {
    return (
      <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
        <h2 className="text-xl font-semibold mb-4 text-white">WORKOUT FREQUENCY</h2>
        <p style={{ color: '#979797' }}>Unable to load frequency data</p>
      </div>
    );
  }

  const weeklyChange = frequency.thisWeek - frequency.lastWeek;
  const monthlyChange = frequency.thisMonth - frequency.lastMonth;

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />;
    if (change < 0) return <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />;
    return <Minus className="w-4 h-4" style={{ color: '#979797' }} />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return '#22c55e';
    if (change < 0) return '#ef4444';
    return '#979797';
  };

  const getTrendText = (change: number) => {
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
        <BarChart3 className="w-5 h-5" style={{ color: '#FFFC74' }} />
        WORKOUT FREQUENCY
      </h2>

      <div className="space-y-6">
        {/* Weekly Comparison */}
        <div className="p-4" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Weekly</h3>
            <div className="flex items-center gap-1 text-sm" style={{ color: getTrendColor(weeklyChange) }}>
              {getTrendIcon(weeklyChange)}
              <span>{getTrendText(weeklyChange)} from last week</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: '#FFFC74' }}>
                {frequency.thisWeek}
              </div>
              <div className="text-sm" style={{ color: '#979797' }}>This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: '#979797' }}>
                {frequency.lastWeek}
              </div>
              <div className="text-sm" style={{ color: '#979797' }}>Last Week</div>
            </div>
          </div>

          {/* Visual bar comparison */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: '#979797' }}>This week</span>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#404040' }}>
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.thisWeek / Math.max(frequency.thisWeek, frequency.lastWeek, 1)) * 100, 5)}%`, backgroundColor: '#FFFC74' }}
                />
              </div>
              <span className="text-xs w-6" style={{ color: '#FFFC74' }}>{frequency.thisWeek}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: '#979797' }}>Last week</span>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#404040' }}>
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.lastWeek / Math.max(frequency.thisWeek, frequency.lastWeek, 1)) * 100, 5)}%`, backgroundColor: '#666666' }}
                />
              </div>
              <span className="text-xs w-6" style={{ color: '#979797' }}>{frequency.lastWeek}</span>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="p-4" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Monthly</h3>
            <div className="flex items-center gap-1 text-sm" style={{ color: getTrendColor(monthlyChange) }}>
              {getTrendIcon(monthlyChange)}
              <span>{getTrendText(monthlyChange)} from last month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: '#FFFC74' }}>
                {frequency.thisMonth}
              </div>
              <div className="text-sm" style={{ color: '#979797' }}>This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: '#979797' }}>
                {frequency.lastMonth}
              </div>
              <div className="text-sm" style={{ color: '#979797' }}>Last Month</div>
            </div>
          </div>

          {/* Visual bar comparison */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: '#979797' }}>This month</span>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#404040' }}>
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.thisMonth / Math.max(frequency.thisMonth, frequency.lastMonth, 1)) * 100, 5)}%`, backgroundColor: '#FFFC74' }}
                />
              </div>
              <span className="text-xs w-6" style={{ color: '#FFFC74' }}>{frequency.thisMonth}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16" style={{ color: '#979797' }}>Last month</span>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#404040' }}>
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((frequency.lastMonth / Math.max(frequency.thisMonth, frequency.lastMonth, 1)) * 100, 5)}%`, backgroundColor: '#666666' }}
                />
              </div>
              <span className="text-xs w-6" style={{ color: '#979797' }}>{frequency.lastMonth}</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}>
          <h3 className="font-medium text-white mb-3">Insights</h3>
          <div className="space-y-2 text-sm">
            {weeklyChange > 0 && (
              <p style={{ color: '#22c55e' }}>
                📈 Great job! You're more active this week than last week.
              </p>
            )}
            {weeklyChange < 0 && (
              <p style={{ color: '#FFFC74' }}>
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
