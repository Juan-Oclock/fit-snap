'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { X, Target, Camera, Dumbbell, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserGoals, updateUserGoals } from '@/lib/settings';
import { uploadProgressPhoto } from '@/lib/progress';
import { UserGoals } from '@/types';

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function OnboardingFlow({ user, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number>(12);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const router = useRouter();

  useEffect(() => {
    loadUserGoals();
  }, [user]);

  const loadUserGoals = async () => {
    try {
      const userGoals = await getUserGoals(user.id);
      setGoals(userGoals);
      if (userGoals?.monthly_workout_target) {
        setSelectedGoal(userGoals.monthly_workout_target);
      }
    } catch (error) {
      console.error('Error loading user goals:', error);
    }
  };

  const handleSetGoal = async () => {
    setIsLoading(true);
    try {
      await updateUserGoals(user.id, { monthly_workout_target: selectedGoal });
      const newCompletedSteps = [...completedSteps];
      newCompletedSteps[0] = true;
      setCompletedSteps(newCompletedSteps);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error setting goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    
    setIsLoading(true);
    try {
      await uploadProgressPhoto(user.id, photoFile, 'before');
      const newCompletedSteps = [...completedSteps];
      newCompletedSteps[1] = true;
      setCompletedSteps(newCompletedSteps);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartWorkout = () => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[2] = true;
    setCompletedSteps(newCompletedSteps);
    router.push('/workout');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Set Your Monthly Goal',
      description: 'How many workouts would you like to complete this month?',
      icon: <Target className="w-8 h-8" style={{ color: '#FFFC74' }} />,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2" style={{ color: '#FFFC74' }}>
              {selectedGoal}
            </div>
            <p style={{ color: '#979797' }}>workouts this month</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="range"
              min="4"
              max="31"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ 
                background: `linear-gradient(to right, #FFFC74 0%, #FFFC74 ${((selectedGoal - 4) / 27) * 100}%, #404040 ${((selectedGoal - 4) / 27) * 100}%, #404040 100%)`,
              }}
            />
            <div className="flex justify-between text-sm" style={{ color: '#979797' }}>
              <span>4 workouts</span>
              <span>31 workouts</span>
            </div>
          </div>

          <button
            onClick={handleSetGoal}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FFFC74', color: '#000000' }}
          >
            {isLoading ? 'Setting Goal...' : 'Set My Goal'}
          </button>
        </div>
      )
    },
    {
      id: 1,
      title: 'Upload Your Before Photo',
      description: 'Take a photo to track your progress over time',
      icon: <Camera className="w-8 h-8" style={{ color: '#FFFC74' }} />,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Before photo preview"
                  className="w-48 h-64 object-cover rounded-lg"
                  style={{ border: '2px solid #404040' }}
                />
                <button
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                className="w-48 h-64 mx-auto rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-opacity-80 transition-colors"
                style={{ borderColor: '#404040' }}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="w-12 h-12 mb-4" style={{ color: '#979797' }} />
                <p className="text-sm" style={{ color: '#979797' }}>
                  Click to upload photo
                </p>
              </div>
            )}
          </div>

          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex space-x-3">
            <button
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#232323', color: '#FFFFFF', border: '1px solid #404040' }}
            >
              {photoFile ? 'Change Photo' : 'Choose Photo'}
            </button>
            
            {photoFile && (
              <button
                onClick={handlePhotoUpload}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#FFFC74', color: '#000000' }}
              >
                {isLoading ? 'Uploading...' : 'Upload Photo'}
              </button>
            )}
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="w-full py-2 px-4 text-sm transition-colors"
            style={{ color: '#979797' }}
          >
            Skip for now
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: 'Start Your First Workout',
      description: 'Ready to begin your fitness journey? Let\'s start with your first workout!',
      icon: <Dumbbell className="w-8 h-8" style={{ color: '#FFFC74' }} />,
      component: (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#232323' }}>
              <Dumbbell className="w-12 h-12" style={{ color: '#FFFC74' }} />
            </div>
            <p style={{ color: '#979797' }}>
              You're all set! Track your exercises, sets, and reps to monitor your progress.
            </p>
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#FFFC74', color: '#000000' }}
          >
            Start My First Workout
          </button>

          <button
            onClick={onComplete}
            className="w-full py-2 px-4 text-sm transition-colors"
            style={{ color: '#979797' }}
          >
            I'll start later
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-lg p-6 relative"
        style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold" style={{ color: '#FFFC74' }}>
              Welcome to FitSnap!
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: '#979797' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  completedSteps[index] 
                    ? 'text-black' 
                    : index === currentStep 
                      ? 'text-black' 
                      : 'text-white'
                }`}
                style={{
                  backgroundColor: completedSteps[index] 
                    ? '#22c55e' 
                    : index === currentStep 
                      ? '#FFFC74' 
                      : '#404040'
                }}
              >
                {completedSteps[index] ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className="w-8 h-0.5 mx-2"
                  style={{ 
                    backgroundColor: completedSteps[index] ? '#22c55e' : '#404040' 
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="mb-4">
            {steps[currentStep].icon}
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">
            {steps[currentStep].title}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#979797' }}>
            {steps[currentStep].description}
          </p>
          
          {steps[currentStep].component}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#232323', color: '#FFFFFF' }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 && !completedSteps[currentStep] && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#404040', color: '#FFFFFF' }}
            >
              <span>Skip Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
