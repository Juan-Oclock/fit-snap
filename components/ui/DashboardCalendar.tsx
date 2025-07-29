'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWorkoutDays } from '@/lib/progress';
import LoadingSpinner from './LoadingSpinner';

interface DashboardCalendarProps {
  userId: string;
}

export default function DashboardCalendar({ userId }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

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

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-1">
            {dayNames.map((day: string, index: number) => (
              <div key={`day-${index}-${day}`} className="text-center text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isWorkoutDay = day && workoutDays.includes(day);
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === currentMonth && 
                new Date().getFullYear() === currentYear;

              return (
                <div
                  key={index}
                  className="h-10 flex items-center justify-center relative"
                >
                  <div
                    className={`
                      w-8 h-8 flex items-center justify-center text-sm rounded-full transition-colors
                      ${day ? 'hover:bg-gray-700' : ''}
                      ${isWorkoutDay ? 'bg-yellow-500 text-gray-900 font-semibold' : ''}
                      ${isToday && !isWorkoutDay ? 'bg-gray-600 text-white font-semibold' : ''}
                      ${!day ? 'cursor-default' : 'cursor-pointer'}
                      ${!isWorkoutDay && !isToday && day ? 'border border-solid' : ''}
                    `}
                    style={!isWorkoutDay && !isToday && day ? { borderColor: '#3C3C3C', color: '#7E7E7E' } : {}}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
