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
    <div className="p-6" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
          <CalendarIcon className="w-5 h-5" />
          Workout Calendar
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded transition-colors text-white"
            style={{ backgroundColor: '#232323' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232323'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-medium min-w-[140px] text-center text-white">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded transition-colors text-white"
            style={{ backgroundColor: '#232323' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232323'}
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
        <div className="p-4" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium py-2" style={{ color: '#979797' }}>
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
                  className="aspect-square flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isWorkoutDay ? '#FFFC74' : (isToday && !isWorkoutDay ? '#404040' : 'transparent'),
                    color: isWorkoutDay ? '#000000' : '#FFFFFF',
                    fontWeight: (isWorkoutDay || isToday) ? '600' : '400',
                    cursor: !day ? 'default' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (day && !isWorkoutDay) {
                      e.currentTarget.style.backgroundColor = '#404040';
                    } else if (day && isWorkoutDay) {
                      e.currentTarget.style.backgroundColor = '#e6e619';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (day && !isWorkoutDay && !isToday) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } else if (day && isWorkoutDay) {
                      e.currentTarget.style.backgroundColor = '#FFFC74';
                    } else if (isToday && !isWorkoutDay) {
                      e.currentTarget.style.backgroundColor = '#404040';
                    }
                  }}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: '#979797' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFFC74' }}></div>
              <span>Workout completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#404040' }}></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {showWorkoutModal && selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedWorkout.name}</h3>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="transition-colors"
                style={{ color: '#979797' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#979797'}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span style={{ color: '#979797' }}>Date:</span>
                <span className="ml-2 text-white">
                  {new Date(selectedWorkout.completed_at).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <span style={{ color: '#979797' }}>Type:</span>
                <span className="ml-2 capitalize text-white">{selectedWorkout.type}</span>
              </div>
              
              <div>
                <span style={{ color: '#979797' }}>Duration:</span>
                <span className="ml-2 text-white">
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
