import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

interface WorkoutCardProps {
  title: string;
  type: string;
  duration: string;
  calories?: number;
  date: string;
  image?: string;
  className?: string;
  onClick?: () => void;
}

export default function WorkoutCard({
  title,
  type,
  duration,
  calories,
  date,
  image,
  className,
  onClick
}: WorkoutCardProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer hover:bg-ui-hover transition-all duration-200 overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center space-x-4 p-4">
          {/* Workout Image/Icon */}
          <div className="flex-shrink-0">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Workout Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-text-primary font-semibold text-sm truncate">
                {title}
              </h3>
              <span className="text-text-tertiary text-xs ml-2">
                {date}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-text-secondary text-xs">
                {type}
              </span>
              <span className="text-text-tertiary text-xs">•</span>
              <span className="text-text-secondary text-xs">
                {duration}
              </span>
              {calories && (
                <>
                  <span className="text-text-tertiary text-xs">•</span>
                  <span className="text-primary text-xs font-medium">
                    {calories} cal
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-4 h-4 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
