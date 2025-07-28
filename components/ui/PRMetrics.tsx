'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { getPersonalRecords, formatDate } from '@/lib/progress';
import LoadingSpinner from './LoadingSpinner';

interface PRMetricsProps {
  userId: string;
}

interface PersonalRecord {
  id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  achieved_at: string;
}

export default function PRMetrics({ userId }: PRMetricsProps) {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const data = await getPersonalRecords(userId);
        setRecords(data);
      } catch (error) {
        console.error('Error fetching personal records:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchRecords();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Personal Records</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const displayedRecords = showAll ? records : records.slice(0, 3);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Personal Records
        </h2>
        {records.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-yellow-400 text-sm font-medium transition-colors"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No personal records yet</p>
          <p className="text-sm text-gray-500">
            Complete workouts to start tracking your PRs!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRecords.map((record, index) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary bg-opacity-20 rounded-full">
                  <span className="text-primary font-bold text-sm">
                    #{index + 1}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">
                    {record.exercise_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {record.weight}kg × {record.reps} rep{record.reps !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(record.achieved_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {record.weight}kg
                </div>
                <div className="text-xs text-gray-400">
                  {record.reps} rep{record.reps !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}

          {/* Summary stats */}
          {records.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-primary mb-1">
                  {records.length}
                </div>
                <div className="text-sm text-gray-400">
                  Total PRs
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-primary mb-1">
                  {Math.max(...records.map(r => r.weight))}kg
                </div>
                <div className="text-sm text-gray-400">
                  Heaviest Lift
                </div>
              </div>
            </div>
          )}

          {/* Motivational message */}
          {records.length > 0 && (
            <div className="mt-4 p-3 bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-lg">
              <p className="text-center text-primary text-sm font-medium">
                🔥 Keep pushing your limits! Every PR is progress!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
