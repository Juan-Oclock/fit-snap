'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getWorkoutDays, getWorkoutForDay } from '@/lib/progress';
import { Workout } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface CalendarViewProps {
  userId: string;
}

export default function CalendarView({ userId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    async function fetchWorkoutDays() {
      setLoading(true);
      try {
        const days = await getWorkoutDays(userId, currentYear, currentMonth);
        setWorkoutDays(days);
      } catch (error) {
        console.error('Error fetching workout days:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchWorkoutDays();
    }
  }, [userId, currentYear, currentMonth]);

  const handleDayClick = async (day: number) => {
    if (workoutDays.includes(day)) {
      const date = new Date(currentYear, currentMonth, day);
      try {
        const workout = await getWorkoutForDay(userId, date);
        if (workout) {
          setSelectedWorkout(workout);
          setShowWorkoutModal(true);
        }
      } catch (error) {
        console.error('Error fetching workout for day:', error);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Workout Calendar
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-medium min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isWorkoutDay = day && workoutDays.includes(day);
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === currentMonth && 
                new Date().getFullYear() === currentYear;

              return (
                <div
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded cursor-pointer transition-colors
                    ${day ? 'hover:bg-gray-700' : ''}
                    ${isWorkoutDay ? 'bg-primary text-gray-900 font-semibold hover:bg-yellow-500' : ''}
                    ${isToday && !isWorkoutDay ? 'bg-gray-600 font-semibold' : ''}
                    ${!day ? 'cursor-default' : ''}
                  `}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Workout completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-600 rounded"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {showWorkoutModal && selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedWorkout.name}</h3>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Date:</span>
                <span className="ml-2">
                  {new Date(selectedWorkout.completed_at).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 capitalize">{selectedWorkout.type}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="ml-2">
                  {Math.floor(selectedWorkout.duration / 60)}m {selectedWorkout.duration % 60}s
                </span>
              </div>

              {selectedWorkout.notes && (
                <div>
                  <span className="text-gray-400">Notes:</span>
                  <p className="mt-1 text-gray-300">{selectedWorkout.notes}</p>
                </div>
              )}

              {selectedWorkout.photo_url && (
                <div>
                  <span className="text-gray-400">Photo:</span>
                  <img
                    src={selectedWorkout.photo_url}
                    alt="Workout"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
