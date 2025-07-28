'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  initialTime?: number; // in seconds
  onTimeUpdate?: (time: number) => void;
  onComplete?: () => void;
  className?: string;
  showControls?: boolean;
  autoStart?: boolean;
}

export default function Timer({ 
  initialTime = 0, 
  onTimeUpdate, 
  onComplete,
  className = '',
  showControls = true,
  autoStart = false
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = initialTime > 0 ? prevTime - 1 : prevTime + 1;
          
          // For countdown timer, check if complete
          if (initialTime > 0 && newTime <= 0) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, initialTime, onTimeUpdate, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(initialTime);
    onTimeUpdate?.(initialTime);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="text-2xl font-mono font-bold text-yellow-400">
        {formatTime(time)}
      </div>
      
      {showControls && (
        <div className="flex space-x-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
            aria-label={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
