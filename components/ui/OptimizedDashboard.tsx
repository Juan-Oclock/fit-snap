'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressCircle from '@/components/ui/ProgressCircle';
import { getRemainingDaysInMonth, getCurrentMonthName } from '@/lib/date-utils';
import DashboardCalendar from '@/components/ui/DashboardCalendar';
import BeforeAfterComparison from '@/components/ui/BeforeAfterComparison';
import OnboardingFlow from '@/components/ui/OnboardingFlow';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { getDashboardData, invalidateDashboardCache, formatDuration, formatDate } from '@/lib/dashboard-optimized';
import { getUserProfile } from '@/lib/settings';
import { checkOnboardingStatus, completeOnboarding, shouldShowOnboarding, OnboardingStatus } from '@/lib/onboarding';
import { Workout, WorkoutWithExercises, UserProfile } from '@/types';
import { useDebounce } from '@/lib/performance';

interface PersonalRecord {
  exercise_name: string;
  weight: number;
  reps: number;
}

interface DashboardData {
  goal: number;
  hasGoal: boolean;
  monthlyWorkouts: number;
  workoutDays: number[];
  personalRecords: PersonalRecord[];
  recentWorkouts: WorkoutWithExercises[];
  userProfile: UserProfile | null;
}

// Memoized components for better performance
const MemoizedProgressCircle = memo(ProgressCircle);
const MemoizedDashboardCalendar = memo(DashboardCalendar);
const MemoizedBeforeAfterComparison = memo(BeforeAfterComparison);

// Memoized workout card component
const WorkoutCard = memo(({ workout }: { workout: WorkoutWithExercises }) => {
  const stats = useMemo(() => {
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
  }, [workout.workout_exercises]);

  const formattedTime = useMemo(() => {
    const date = new Date(workout.completed_at);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, [workout.completed_at]);

  return (
    <div className="bg-card-dark border border-border-color rounded-lg p-4 hover:border-yellow-400 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        {workout.photo_url ? (
          <img 
            src={workout.photo_url} 
            alt="Workout" 
            className="w-12 h-12 rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-xl">
            💪
          </div>
        )}
        <div className="flex-1">
          <div className="text-white text-sm font-medium">
            {formatDate(workout.completed_at)} • {formattedTime} • {formatDuration(workout.duration || 0)}
          </div>
          <div className="text-gray-400 text-xs">
            {stats.exerciseCount > 0 ? (
              `${stats.exerciseCount} Exercise${stats.exerciseCount !== 1 ? 's' : ''} • ${stats.totalSets} Set${stats.totalSets !== 1 ? 's' : ''} • ${stats.maxWeight}kg max`
            ) : (
              'No exercise details recorded'
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

WorkoutCard.displayName = 'WorkoutCard';

// Memoized personal records section
const PersonalRecordsSection = memo(({ personalRecords }: { personalRecords: PersonalRecord[] }) => (
  <div className="bg-card-dark border border-border-color rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-heading">PERSONAL RECORDS</h2>
      <Link href="/progress" className="text-yellow-400 hover:text-yellow-300 text-sm">
        View All →
      </Link>
    </div>
    
    {personalRecords.length > 0 ? (
      <div className="space-y-3">
        {personalRecords.map((record, index) => (
          <div key={`${record.exercise_name}-${index}`} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <span className="text-white font-medium">{record.exercise_name}</span>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold">{record.weight}kg</div>
              <div className="text-gray-400 text-sm">{record.reps} reps</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">🏆</div>
        <p className="text-gray-400">No personal records yet</p>
        <p className="text-gray-500 text-sm">Complete workouts to see your PRs</p>
      </div>
    )}
  </div>
));

PersonalRecordsSection.displayName = 'PersonalRecordsSection';

export default function OptimizedDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State for dashboard data
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);

  // Memoized values
  const remainingDays = useMemo(() => getRemainingDaysInMonth(), []);
  const currentMonth = useMemo(() => getCurrentMonthName(), []);
  
  // Progress calculation
  const progressPercentage = useMemo(() => {
    if (!dashboardData) return 0;
    return Math.min((dashboardData.monthlyWorkouts / dashboardData.goal) * 100, 100);
  }, [dashboardData?.monthlyWorkouts, dashboardData?.goal]);

  // Debounced refresh function
  const debouncedRefresh = useDebounce(useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      // Invalidate cache and fetch fresh data
      invalidateDashboardCache(user.id);
      const data = await getDashboardData(user.id);
      setDashboardData(data);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setError('Failed to refresh dashboard data');
    }
  }, [user?.id]), 300);

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
        setError(null);
        
        console.log('🚀 Starting optimized dashboard data fetch for user:', user.id);
        
        // Fetch dashboard data and onboarding status in parallel
        const [data, onboardingStatusData] = await Promise.all([
          getDashboardData(user.id),
          checkOnboardingStatus(user.id)
        ]);
        
        console.log('📊 Optimized dashboard data fetched');
        
        setDashboardData(data);
        setOnboardingStatus(onboardingStatusData);
        setShowOnboarding(shouldShowOnboarding(onboardingStatusData));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    }

    fetchDashboardData();
  }, [user?.id]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await completeOnboarding(user.id);
      setShowOnboarding(false);
      // Refresh dashboard data after onboarding
      debouncedRefresh();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [user?.id, debouncedRefresh]);

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ {error}</div>
          <button 
            onClick={debouncedRefresh}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="container-app space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading">DASHBOARD</h1>
            <p className="text-subheading">Track your fitness journey</p>
          </div>
          <button 
            onClick={debouncedRefresh}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh dashboard"
          >
            🔄
          </button>
        </div>

        {/* Goal Progress */}
        <div className="bg-card-dark border border-border-color rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-heading">{currentMonth.toUpperCase()} GOAL</h2>
              <p className="text-subheading">
                {dashboardData.monthlyWorkouts} of {dashboardData.goal} workouts completed
              </p>
            </div>
            <MemoizedProgressCircle 
              current={dashboardData.monthlyWorkouts}
              target={dashboardData.goal}
              size={120}
              showPercentage={true}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{remainingDays}</div>
              <div className="text-gray-400 text-sm">Days Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dashboardData.workoutDays.length}</div>
              <div className="text-gray-400 text-sm">Active Days</div>
            </div>
          </div>
        </div>

        {/* Calendar and Progress Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MemoizedDashboardCalendar 
            userId={user.id}
          />
          <MemoizedBeforeAfterComparison userId={user.id} />
        </div>

        {/* Personal Records and Recent Workouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalRecordsSection personalRecords={dashboardData.personalRecords} />
          
          {/* Recent Workouts */}
          <div className="bg-card-dark border border-border-color rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading">RECENT WORKOUTS</h2>
              <Link href="/workout" className="text-yellow-400 hover:text-yellow-300 text-sm">
                New Workout →
              </Link>
            </div>
            
            {dashboardData.recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">💪</div>
                <p className="text-gray-400">No workouts yet</p>
                <Link 
                  href="/workout" 
                  className="inline-block mt-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  Start Your First Workout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Flow */}
      {showOnboarding && onboardingStatus && (
        <OnboardingFlow
          user={user}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
