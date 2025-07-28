'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCommunityWorkouts, getOnlineUsersCount, CommunityWorkout } from '@/lib/community';
import CommunityWorkoutCard from '@/components/ui/CommunityWorkoutCard';
import CommunityFilters, { SortOption, FilterOption } from '@/components/ui/CommunityFilters';
import { Loader2, Users, MessageSquare, TrendingUp } from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<CommunityWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadCommunityData();
    loadOnlineCount();
  }, [sortBy, filterBy]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommunityWorkouts(20, 0);
      setWorkouts(data);
      setHasMore(data.length === 20);
    } catch (err) {
      console.error('Error loading community data:', err);
      setError('Failed to load community posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineCount = async () => {
    try {
      const count = await getOnlineUsersCount();
      setOnlineCount(count);
    } catch (err) {
      console.error('Error loading online count:', err);
    }
  };

  const loadMoreWorkouts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const data = await getCommunityWorkouts(20, workouts.length);
      setWorkouts(prev => [...prev, ...data]);
      setHasMore(data.length === 20);
    } catch (err) {
      console.error('Error loading more workouts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReactionUpdate = (workoutId: string, newCount: number) => {
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, community_reactions: Array(newCount).fill({ id: '', user_id: '', reaction_type: 'like' }) }
        : workout
    ));
  };

  const handleCommentAdd = (workoutId: string, newCount: number) => {
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { 
            ...workout, 
            _count: { 
              community_reactions: workout._count?.community_reactions || 0,
              community_comments: newCount 
            } 
          }
        : workout
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Community</h1>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-400">Loading community posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Community</h1>
        </div>
        
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadCommunityData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>{onlineCount} online</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="w-5 h-5" />
            <span>{workouts.length} workouts</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="w-5 h-5" />
            <span>Community</span>
          </div>

        </div>
      </div>

      {/* Filters */}
      <CommunityFilters
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        onlineCount={onlineCount}
      />

      {/* Community Feed */}
      <div className="space-y-6">
        {workouts.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No community posts yet</h3>
            <p className="text-gray-400 mb-6">
              Be the first to share your workout with the community!
            </p>
            <p className="text-sm text-gray-500">
              Complete a workout and toggle "Share to community" to get started.
            </p>
          </div>
        ) : (
          <>
            {workouts.map((workout) => (
              <CommunityWorkoutCard
                key={workout.id}
                workout={workout}
                currentUserId={user?.id}
                onReactionUpdate={handleReactionUpdate}
                onCommentAdd={handleCommentAdd}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMoreWorkouts}
                  disabled={loadingMore}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
