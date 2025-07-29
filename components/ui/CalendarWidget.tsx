import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from './Card';

interface CalendarWidgetProps {
  workoutDates?: string[]; // Array of dates with workouts (YYYY-MM-DD format)
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export default function CalendarWidget({
  workoutDates = [],
  onDateSelect,
  className
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };
  
  const isWorkoutDate = (date: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return workoutDates.includes(dateString);
  };
  
  const isToday = (date: number) => {
    return today.getDate() === date && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };
  
  const handleDateClick = (date: number) => {
    const selectedDate = new Date(year, month, date);
    onDateSelect?.(selectedDate);
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push(date);
  }
  
  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary font-semibold">
            {monthNames[month]} {year}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-ui-hover rounded transition-colors"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-ui-hover rounded transition-colors"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="h-8 flex items-center justify-center text-text-tertiary text-xs font-medium"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => (
            <div
              key={index}
              className="h-8 flex items-center justify-center"
            >
              {date && (
                <button
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 hover:bg-ui-hover',
                    isToday(date) && 'bg-primary text-dark font-bold',
                    isWorkoutDate(date) && !isToday(date) && 'bg-primary/20 text-primary',
                    !isToday(date) && !isWorkoutDate(date) && 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {date}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-4 pt-3 border-t border-ui-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-text-tertiary text-xs">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary/20"></div>
            <span className="text-text-tertiary text-xs">Workout</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
