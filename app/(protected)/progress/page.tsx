'use client';

import { useUser } from '@/hooks/useUser';
import GoalProgress from '@/components/ui/GoalProgress';
import CalendarView from '@/components/ui/CalendarView';
// import BeforeAfterComparison from '@/components/ui/BeforeAfterComparison';
// import PRMetrics from '@/components/ui/PRMetrics';
import WorkoutFrequency from '@/components/ui/WorkoutFrequency';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProgressPage() {
  const { user, loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="container-app">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4" style={{ color: '#979797' }}>Loading progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-app">
        <div className="flex items-center justify-center min-h-[400px]">
          <p style={{ color: '#979797' }}>Please log in to view your progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app space-y-6">
      <div className="space-y-2">
        <h1 className="text-heading">PROGRESS TRACKING</h1>
        <p className="text-subheading">
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
        {/* <BeforeAfterComparison userId={user.id} /> */}

        {/* Bottom Row - PRs and Frequency */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* <PRMetrics userId={user.id} /> */}
          <WorkoutFrequency userId={user.id} />
        </div>
      </div>
    </div>
  );
}
