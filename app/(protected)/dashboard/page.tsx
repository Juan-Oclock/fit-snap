'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressCircle from '@/components/ui/ProgressCircle';
import { getRemainingDaysInMonth, getCurrentMonthName } from '@/lib/date-utils';
import DashboardCalendar from '@/components/ui/DashboardCalendar';
import BeforeAfterComparison from '@/components/ui/BeforeAfterComparison';
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
import { Workout, UserProfile } from '@/types';

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
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  const [hasGoal, setHasGoal] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
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
        
        const [
          goal,
          workoutCount,
          workoutDaysData,
          prs,
          workouts,
          goalExists,
          profile
        ] = await Promise.all([
          getUserGoal(user.id),
          getMonthlyWorkoutCount(user.id),
          getWorkoutDays(user.id),
          getPersonalRecords(user.id),
          getRecentWorkouts(user.id),
          hasUserSetGoal(user.id),
          getUserProfile(user.id)
        ]);
        
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
        
        setMonthlyGoal(goal);
        setMonthlyWorkouts(workoutCount);
        setWorkoutDays(workoutDaysData);
        setPersonalRecords(prs);
        setRecentWorkouts(workouts);

        setHasGoal(goalExists);
        setUserProfile(profile);
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
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Hello, {userName}
        </h1>
        <p className="text-gray-400">{currentDate}</p>
      </div>
      
      {/* Monthly Progress */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col items-center">
          <ProgressCircle 
            current={monthlyWorkouts} 
            target={monthlyGoal} 
            size={140}
            className="mb-4"
          />
          <h2 className="text-xl font-semibold text-white mb-2">{currentMonth} Progress</h2>
          <p className="text-gray-400 text-sm">
            {Math.max(0, monthlyGoal - monthlyWorkouts)} workout{Math.max(0, monthlyGoal - monthlyWorkouts) !== 1 ? 's' : ''} remaining
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {remainingDays} days left in {currentMonth.toLowerCase()}
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">Goal Completion</p>
            <p className="text-yellow-500 font-bold text-lg">{monthlyWorkouts}/{monthlyGoal}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">This Month</p>
            <p className="text-white font-bold text-lg">{monthlyWorkouts} workouts</p>
          </div>
        </div>
        
        {/* Progress indicator */}
        {remainingDays > 0 && monthlyWorkouts < monthlyGoal && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
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
      
      {/* Personal Records and Daily Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Records */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
              <span className="text-yellow-500 text-lg">🏆</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Personal Records</h2>
          </div>
          
          {/* PR Summary Stats */}
          {personalRecords.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-500">{personalRecords.length}</div>
                <div className="text-gray-400 text-sm">Total PRs</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {Math.max(...personalRecords.map(pr => pr.weight))}kg
                </div>
                <div className="text-gray-400 text-sm">Heaviest Lift</div>
              </div>
            </div>
          )}
          
          {personalRecords.length > 0 ? (
            <>
              <div className="space-y-3">
                {personalRecords.map((pr, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-gray-300">{pr.exercise_name}</span>
                    <span className="text-yellow-500 font-medium">
                      {pr.weight}kg × {pr.reps}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Motivational Message */}
              <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center text-yellow-500 text-sm">
                  <span className="mr-2">🔥</span>
                  Keep pushing your limits! Every PR is progress!
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No personal records yet. Start working out to set your first PR!
            </p>
          )}
        </div>
        
        {/* Before & After Photos */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <BeforeAfterComparison userId={user.id} />
        </div>
      </div>
      
      {/* Workout Calendar */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <DashboardCalendar userId={user.id} />
      </div>
      
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
      
      {/* Recent Workouts */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Workouts</h2>
          <Link 
            href="/history"
            className="text-yellow-500 text-sm hover:underline"
          >
            View All
          </Link>
        </div>
        
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                <div>
                  <p className="text-white font-medium">{workout.name}</p>
                  <p className="text-gray-400 text-sm">
                    {formatDuration(workout.duration)} • {workout.type}
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  {formatDate(workout.completed_at)}
                </p>
              </div>
            ))}
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
    </div>
  );
}
