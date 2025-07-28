'use client';

import { useState } from 'react';

interface CalendarProps {
  workoutDays: number[];
  className?: string;
}

export default function Calendar({ workoutDays, className = '' }: CalendarProps) {
  const [currentDate] = useState(new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Generate calendar days
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
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-center">
          {monthNames[currentMonth]} {currentYear}
        </h3>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center text-sm rounded
              ${day === null 
                ? '' 
                : day === currentDate.getDate() 
                  ? 'bg-yellow-500 text-black font-bold' 
                  : workoutDays.includes(day)
                    ? 'bg-yellow-500/20 text-yellow-400 font-medium'
                    : 'text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-center">
        <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
        Workout days
      </div>
    </div>
  );
}
