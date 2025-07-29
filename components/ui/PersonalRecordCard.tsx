import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';
import ProgressCircle from './ProgressCircle';

interface PersonalRecordCardProps {
  title: string;
  value: number;
  unit: string;
  target?: number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  className?: string;
}

export default function PersonalRecordCard({
  title,
  value,
  unit,
  target,
  change,
  className
}: PersonalRecordCardProps) {
  const hasProgress = target && target > 0;
  const progressPercentage = hasProgress ? Math.min((value / target) * 100, 100) : 0;

  return (
    <Card className={cn('text-center', className)}>
      <CardContent className="p-6">
        {/* Progress Circle or Value Display */}
        {hasProgress ? (
          <div className="flex justify-center mb-4">
            <ProgressCircle
              current={value}
              target={target}
              size={80}
              strokeWidth={6}
              showValues={false}
              showPercentage={false}
              color="primary"
            />
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-3xl font-bold text-text-primary">
              {value}
            </div>
            <div className="text-text-secondary text-sm">
              {unit}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="text-text-primary font-semibold text-sm mb-2">
          {title}
        </h3>

        {/* Value with unit (for progress circles) */}
        {hasProgress && (
          <div className="mb-2">
            <span className="text-text-primary font-semibold">
              {value}
            </span>
            <span className="text-text-secondary text-sm ml-1">
              {unit}
            </span>
            {target && (
              <span className="text-text-tertiary text-xs ml-1">
                / {target}
              </span>
            )}
          </div>
        )}

        {/* Change indicator */}
        {change && (
          <div className="flex items-center justify-center space-x-1">
            <svg
              className={cn(
                'w-3 h-3',
                change.type === 'increase' 
                  ? 'text-green-400 rotate-0' 
                  : 'text-red-400 rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17l9.2-9.2M17 17V7H7"
              />
            </svg>
            <span className={cn(
              'text-xs font-medium',
              change.type === 'increase' ? 'text-green-400' : 'text-red-400'
            )}>
              {change.value}{unit}
            </span>
            <span className="text-text-tertiary text-xs">
              {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
