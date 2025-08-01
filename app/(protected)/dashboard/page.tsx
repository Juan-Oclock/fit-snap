'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressCircle from '@/components/ui/ProgressCircle';
import { getRemainingDaysInMonth, getCurrentMonthName } from '@/lib/date-utils';
import DashboardCalendar from '@/components/ui/DashboardCalendar';
import BeforeAfterComparison from '@/components/ui/BeforeAfterComparison';
import OnboardingFlow from '@/components/ui/OnboardingFlow';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getUserGoal,
  getMonthlyWorkoutCount,
  getWorkoutDays,
  getPersonalRecords,
  getRecentWorkouts,
  hasUserSetGoal,
  formatDuration,
  formatDate
} from '@/lib/dashboard';
import { getUserProfile } from '@/lib/settings';
import { checkOnboardingStatus, completeOnboarding, shouldShowOnboarding, OnboardingStatus } from '@/lib/onboarding';
import { Workout, WorkoutWithExercises, UserProfile, UserGoals } from '@/types';

interface PersonalRecord {
  exercise_name: string;
  weight: number;
  reps: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State for dashboard data
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [monthlyGoal, setMonthlyGoal] = useState(12);
  const remainingDays = getRemainingDaysInMonth();
  const currentMonth = getCurrentMonthName();
  const [monthlyWorkouts, setMonthlyWorkouts] = useState(0);
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutWithExercises[]>([]);

  const [hasGoal, setHasGoal] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  
  // Helper functions for workout statistics
  const getWorkoutStats = (workout: WorkoutWithExercises) => {
    if (!workout.workout_exercises || workout.workout_exercises.length === 0) {
      return { exerciseCount: 0, totalSets: 0, maxWeight: 0 };
    }
    
    const exerciseCount = workout.workout_exercises.length;
    const totalSets = workout.workout_exercises.reduce((total, exercise) => 
      total + (exercise.workout_sets?.length || 0), 0);
    const maxWeight = workout.workout_exercises.reduce((max, exercise) => {
      const exerciseMaxWeight = exercise.workout_sets?.reduce((setMax, set) => 
        Math.max(setMax, set.weight || 0), 0) || 0;
      return Math.max(max, exerciseMaxWeight);
    }, 0);
    
    return { exerciseCount, totalSets, maxWeight };
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  

  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return;
      
      try {
        setDashboardLoading(true);
        
        // Fetch all dashboard data in parallel
        console.log('🚀 Starting dashboard data fetch for user:', user.id);
        console.log('🆔 Actual user ID:', user.id, 'Type:', typeof user.id);
        
        // Fetch dashboard data with individual error handling
        const [
          goal,
          workoutCount,
          workoutDaysData,
          prs,
          workouts,
          goalExists,
          profile,
          onboardingStatusData
        ] = await Promise.allSettled([
          getUserGoal(user.id),
          getMonthlyWorkoutCount(user.id),
          getWorkoutDays(user.id),
          getPersonalRecords(user.id),
          getRecentWorkouts(user.id),
          hasUserSetGoal(user.id),
          getUserProfile(user.id),
          checkOnboardingStatus(user.id)
        ]).then(results => results.map((result, index) => {
          if (result.status === 'rejected') {
            const functionNames = [
              'getUserGoal', 'getMonthlyWorkoutCount', 'getWorkoutDays', 
              'getPersonalRecords', 'getRecentWorkouts', 'hasUserSetGoal',
              'getUserProfile', 'checkOnboardingStatus'
            ];
            console.warn(`Dashboard API ${functionNames[index]} failed:`, result.reason);
            // Return safe defaults for each function
            switch (index) {
              case 0: return null; // getUserGoal
              case 1: return 0; // getMonthlyWorkoutCount
              case 2: return []; // getWorkoutDays
              case 3: return []; // getPersonalRecords
              case 4: return []; // getRecentWorkouts
              case 5: return false; // hasUserSetGoal
              case 6: return null; // getUserProfile
              case 7: return { // checkOnboardingStatus
                has_set_goal: false,
                has_uploaded_photo: false,
                has_completed_workout: false,
                onboarding_completed: false
              };
              default: return null;
            }
          }
          return result.value;
        }));
        
        // console.log('📊 Dashboard data fetched:', {
        //   goal,
        //   workoutCount,
        //   workoutDaysLength: workoutDaysData.length,
        //   prsLength: prs.length,
        //   prs,
        //   workoutsLength: workouts.length,
        //   goalExists,
        //   profile: !!profile
        // });
        
        setMonthlyGoal((goal as UserGoals | null)?.monthly_workout_target || 12);
        setMonthlyWorkouts(workoutCount as number);
        setWorkoutDays(workoutDaysData as number[]);
        setPersonalRecords(prs as PersonalRecord[]);
        setRecentWorkouts(workouts as WorkoutWithExercises[]);

        setHasGoal(goalExists as boolean);
        setUserProfile(profile as UserProfile | null);
        
        // Check if onboarding should be shown
        setOnboardingStatus(onboardingStatusData as OnboardingStatus);
        setShowOnboarding(shouldShowOnboarding(onboardingStatusData as OnboardingStatus));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    }
    
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);
  
  // Onboarding handlers
  const handleOnboardingComplete = async () => {
    if (user?.id) {
      await completeOnboarding(user.id);
      setShowOnboarding(false);
      // Refresh dashboard data to reflect any changes
      if (user?.id) {
        const newStatus = await checkOnboardingStatus(user.id);
        setOnboardingStatus(newStatus);
      }
    }
  };
  
  const handleOnboardingSkip = async () => {
    if (user?.id) {
      await completeOnboarding(user.id);
      setShowOnboarding(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }
  
  // Use username from profile first, then fallback to email prefix
  const userName = userProfile?.username || user?.email?.split('@')[0] || 'One';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  
  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <>
      {/* Onboarding Flow */}
      {showOnboarding && user && (
        <OnboardingFlow
          user={user}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      
      <div className="container-app space-y-6">
      {/* Welcome Header - Top Left */}
      <div className="flex justify-start">
        <div className="text-left">
          <h1 className="text-heading font-semibold mb-1" style={{ fontSize: '15px' }}>
            Hello, {userName}
          </h1>
          <p className="text-subheading" style={{ fontSize: '10px' }}>{currentDate}</p>
        </div>
      </div>
      
      {/* Monthly Progress - Progress Circle Left, Info Right */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-6">
          {/* Progress Circle - Left Side */}
          <div className="flex-shrink-0">
            <ProgressCircle 
              current={monthlyWorkouts} 
              target={monthlyGoal} 
              size={175}
              color="primary"
            />
          </div>
          
          {/* Info Section - Right Side */}
          <div className="flex-1">
            <h2 className="text-heading font-bold mb-2 uppercase tracking-wider" style={{ fontSize: '1.1rem', lineHeight: '1.2rem' }}>
              {currentMonth} PROGRESS
            </h2>
            <p className="text-subheading text-sm mb-1">
              {Math.max(0, monthlyGoal - monthlyWorkouts)} workout{Math.max(0, monthlyGoal - monthlyWorkouts) !== 1 ? 's' : ''} remaining
            </p>
            <p className="text-subheading text-xs mb-4">
              {remainingDays} days left in {currentMonth.toLowerCase()}
            </p>
            
            {/* Stats Grid */}
            <div className="space-y-4">
              <div>
                <p className="text-subheading uppercase tracking-wide mb-1" style={{ fontSize: '0.5rem' }}>Goal Completion</p>
                <p className="text-highlight" style={{ fontSize: '16px', fontWeight: 600 }}>{monthlyWorkouts}/{monthlyGoal}</p>
              </div>
              <div>
                <p className="text-subheading uppercase tracking-wide mb-1" style={{ fontSize: '0.5rem' }}>This Month</p>
                <p className="text-heading" style={{ fontSize: '16px', fontWeight: 600 }}>{monthlyWorkouts} workouts</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        {remainingDays > 0 && monthlyWorkouts < monthlyGoal && (
          <div className="mt-4 p-3 border" style={{ backgroundColor: '#1A1A1A', borderColor: '#3C3C3C', borderRadius: '2px' }}>
            {(monthlyGoal - monthlyWorkouts) > remainingDays ? (
              <p className="text-yellow-400 text-xs text-center">
                ⚠️ Need {((monthlyGoal - monthlyWorkouts) / remainingDays).toFixed(1)} workouts/day to reach goal
              </p>
            ) : (
              <p className="text-green-400 text-xs text-center">
                ✅ On track! About 1 workout every {Math.ceil(remainingDays / (monthlyGoal - monthlyWorkouts))} days
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Workout Calendar */}
      <div className="p-[30px] border" style={{ borderColor: '#3C3C3C', borderRadius: '5px' }}>
        <DashboardCalendar userId={user.id} />
      </div>
      
      {/* Recent Workouts */}
      <div className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">RECENT WORKOUT</h2>
          <Link 
            href="/history"
            className="text-yellow-500 text-sm hover:underline"
          >
            VIEW ALL
          </Link>
        </div>
        
        {recentWorkouts.length > 0 ? (
          <div className="space-y-4">
            {recentWorkouts.map((workout) => {
              const stats = getWorkoutStats(workout);
              return (
                <div key={workout.id} className="flex min-h-[120px]">
                  {/* Left Column - Photo (30%) */}
                  <div className="w-[30%]">
                    <div className="w-full h-full rounded-l-lg overflow-hidden bg-gray-700">
                      {workout.photo_url ? (
                        <img 
                          src={workout.photo_url} 
                          alt={`${workout.name} photo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-600">
                          {/* Image placeholder icon */}
                          <svg 
                            className="w-8 h-8 text-gray-400 mb-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1.5} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          <span className="text-gray-400 text-xs text-center px-1">No image uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Column - Workout Details (70%) */}
                  <div className="w-[70%] pl-3 p-4 flex flex-col justify-center" style={{ backgroundColor: '#262626', borderLeft: '3px solid #FEFC73', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                    {/* Workout Name */}
                    <h3 className="text-white font-bold text-lg mb-1">{workout.name}</h3>
                    
                    {/* Date and Duration */}
                    <div className="text-subheading text-sm mb-2">
                      <span>{formatDate(workout.completed_at)} {formatTime(workout.completed_at)} - Duration: {formatDuration(workout.duration)}</span>
                    </div>
                    
                    {/* Exercise Details */}
                    <div className="text-subheading text-sm">
                      {stats.exerciseCount > 0 ? (
                        <span>{stats.exerciseCount} Exercise{stats.exerciseCount !== 1 ? 's' : ''} - {stats.totalSets} set{stats.totalSets !== 1 ? 's' : ''}{stats.maxWeight > 0 ? ` - ${stats.maxWeight}kg max` : ''}</span>
                      ) : (
                        <span className="text-gray-500 italic">No exercise details recorded</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-500 text-2xl">⚡</span>
            </div>
            <p className="text-gray-400 mb-4">
              No workouts yet. Start your fitness journey!
            </p>
            <Link 
              href="/workout"
              className="inline-block px-6 py-2 bg-yellow-500 text-black font-medium rounded-md hover:bg-yellow-600 transition-colors"
            >
              Create Workout
            </Link>
          </div>
        )}
      </div>
      
      {/* Personal Records */}
      <div className="py-6">
        <h2 className="text-lg font-semibold text-white mb-6">PERSONAL RECORDS</h2>
        
        {personalRecords.length > 0 ? (
          <div className="flex">
            {/* Left Column - Circular Stats (30%) */}
            <div className="w-[30%] p-6 flex flex-col justify-center space-y-6" style={{ backgroundColor: '#1B1B1B' }}>
              {/* Total PRs Circle */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-yellow-500 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{personalRecords.length}</span>
                </div>
                <span className="text-subheading text-sm text-center">TOTAL PRs</span>
              </div>
              
              {/* Heaviest Lift Circle */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-yellow-500 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-white">
                    {Math.max(...personalRecords.map(pr => pr.weight))}kg
                  </span>
                </div>
                <span className="text-subheading text-sm text-center">Heaviest Lift</span>
              </div>
            </div>
            
            {/* Right Column - Exercise List (70%) */}
            <div className="w-[70%] p-6 flex flex-col justify-center" style={{ backgroundColor: '#232323' }}>
              <div className="space-y-4">
                {personalRecords.map((pr, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-white font-medium uppercase">{pr.exercise_name}</span>
                    <span className="text-subheading text-sm">
                      {pr.weight}KG X {pr.reps}
                    </span>
                  </div>
                ))}
                
                {/* Motivational Message */}
                <div className="mt-6 pt-4">
                  <p className="text-subheading text-sm">
                    Keep pushing your limits! Every PR is progress!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-subheading text-center py-8">
            No personal records yet. Start working out to set your first PR!
          </p>
        )}
      </div>
      
      {/* Before & After Photos */}
      <BeforeAfterComparison userId={user.id} />
      
      {/* Goal Setting CTA (only shown if no goal is set) */}
      {!hasGoal && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-500 text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
            Set your goal here
          </h3>
          <p className="text-gray-400 mb-4">
            Define your monthly workout target to track your progress
          </p>
          <Link 
            href="/settings"
            className="inline-block px-6 py-2 bg-yellow-500 text-black font-medium rounded-md hover:bg-yellow-600 transition-colors"
          >
            Set Your Goal
          </Link>
        </div>
      )}
      
    </div>
    </>
  );
}
