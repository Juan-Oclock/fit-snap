"use client";

import React, { useState } from "react";
import { Play, Pause } from "lucide-react";

interface ExerciseTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  reps: number;
  weight: number;
  sets?: number;
  timer: number;
  isRunning: boolean;
  onPlayPause: () => void;
  onRest: () => void;
  onDone: () => void;
  // New for rest timer
  isResting: boolean;
  restTimer: number;
  onCancelRest: () => void;
  userRestTime: number;
}

export default function ExerciseTimerModal({
  isOpen,
  onClose,
  exerciseName,
  reps,
  weight,
  sets,
  timer,
  isRunning,
  onPlayPause,
  onRest,
  onDone,
  isResting,
  restTimer,
  onCancelRest,
  userRestTime,
}: ExerciseTimerModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95 ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'} pt-10 pb-10`}
      style={{ minHeight: "100vh", minWidth: "100vw" }}
    >
      {/* Exercise Info */}
      <div className="text-center mb-12">
        <h2 className="text-xl font-medium text-gray-300 mb-4">{exerciseName}</h2>
        <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
          <span>Reps: {reps}</span>
          <span>Weight: {weight}kg</span>
          {sets !== undefined && (
            <span>Sets: {sets}</span>
          )}
        </div>
      </div>

      {/* Timer Play/Pause */}
      <div className="flex flex-col items-center mb-12">
        <button
          className={`w-40 h-40 rounded-full flex items-center justify-center transition-colors mb-6 ${
            isResting
              ? 'border-4 border-gray-600 bg-transparent text-gray-400 cursor-not-allowed'
              : isRunning ? 'animate-timer-pulse border-4 border-yellow-400 bg-transparent text-yellow-400' : 'border-4 border-gray-500 bg-transparent text-yellow-400 hover:border-gray-400'
          }`}
          onClick={onPlayPause}
          disabled={isResting}
        >
          {isRunning ? (
            <div className="flex gap-2">
              <div className="w-3 h-12 bg-yellow-400 rounded-sm" />
              <div className="w-3 h-12 bg-yellow-400 rounded-sm" />
            </div>
          ) : (
            <div className="w-0 h-0 border-l-[36px] border-l-yellow-400 border-t-[27px] border-t-transparent border-b-[27px] border-b-transparent ml-3" />
          )}
        </button>
        <div className="text-3xl font-mono text-white mb-10">{formatTime(timer)}</div>
        {/* In-modal Rest Timer */}
        {isResting && (
          <div className="flex flex-col items-center mb-8">
            <div className="text-3xl font-mono text-yellow-400 mb-2">{formatTime(restTimer)}</div>
            <div className="text-lg text-gray-400 mb-4">Resting... ({userRestTime}s)</div>
            <button
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              onClick={onCancelRest}
            >
              Cancel Rest
            </button>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center w-full mt-8 gap-4 px-8">
        <button
          className="px-8 py-3 border border-gray-500 bg-transparent text-white font-medium rounded transition-colors hover:border-gray-400"
          onClick={onRest}
          disabled={isResting}
        >
          REST
        </button>
        <button
          className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          onClick={() => {
            onDone();
            handleClose();
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}
