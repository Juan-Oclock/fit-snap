'use client';

import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function ProgressCircle({ 
  current, 
  target, 
  size = 120, 
  strokeWidth = 8,
  className = '',
  showPercentage = true,
  showValues = true,
  label,
  color = 'primary'
}: ProgressCircleProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorMap = {
    primary: '#FFFC74',
    secondary: '#979797',
    success: '#10B981',
    warning: '#F59E0B'
  };
  
  const backgroundStroke = '#5E5E5E';
  const progressStroke = colorMap[color];
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="progress-ring"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundStroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressStroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="progress-circle transition-all duration-700 ease-out"
          style={{
            filter: color === 'primary' ? 'drop-shadow(0 0 8px rgba(255, 252, 116, 0.3))' : 'none'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercentage && (
          <span className="text-text-primary font-bold" style={{ fontSize: size * 0.15 }}>
            {Math.round(percentage)}%
          </span>
        )}
        {showValues && (
          <span className="text-text-tertiary" style={{ fontSize: size * 0.08 }}>
            {current}/{target}
          </span>
        )}
        {label && (
          <span className="text-text-secondary mt-1" style={{ fontSize: size * 0.07 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
