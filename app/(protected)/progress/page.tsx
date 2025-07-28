'use client';

import { useUser } from '@/hooks/useUser';
import GoalProgress from '@/components/ui/GoalProgress';
import CalendarView from '@/components/ui/CalendarView';
import BeforeAfterComparison from '@/components/ui/BeforeAfterComparison';
import PRMetrics from '@/components/ui/PRMetrics';
import WorkoutFrequency from '@/components/ui/WorkoutFrequency';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProgressPage() {
  const { user, loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Please log in to view your progress.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-gray-400">
          Track your fitness journey with goals, photos, and personal records
        </p>
      </div>
      
      <div className="grid gap-8">
        {/* Top Row - Goal Progress and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GoalProgress userId={user.id} />
          <CalendarView userId={user.id} />
        </div>

        {/* Middle Row - Before/After Photos */}
        <BeforeAfterComparison userId={user.id} />

        {/* Bottom Row - PRs and Frequency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PRMetrics userId={user.id} />
          <WorkoutFrequency userId={user.id} />
        </div>
      </div>
    </div>
  );
}
