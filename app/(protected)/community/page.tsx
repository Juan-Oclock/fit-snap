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
      <div className="container-app space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-heading" style={{ fontSize: '24px', textTransform: 'uppercase', color: '#FFFFFF' }}>COMMUNITY</h1>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#FFFC74' }} />
            <p style={{ color: '#979797' }}>Loading community posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-heading" style={{ fontSize: '24px', textTransform: 'uppercase', color: '#FFFFFF' }}>COMMUNITY</h1>
        </div>
        
        <div className="p-6 text-center" style={{ backgroundColor: 'rgba(153, 27, 27, 0.2)', border: '1px solid #dc2626', borderRadius: '8px' }}>
          <p className="mb-4" style={{ color: '#fca5a5' }}>{error}</p>
          <button 
            onClick={loadCommunityData}
            className="px-4 py-2 text-black transition-colors" style={{ backgroundColor: '#FFFC74', borderRadius: '8px' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef9c3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFC74'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app space-y-6" style={{ overflowX: 'hidden' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-heading" style={{ fontSize: '24px', textTransform: 'uppercase', color: '#FFFFFF' }}>COMMUNITY</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" style={{ color: '#979797' }}>
            <Users className="w-5 h-5" />
            <span>{onlineCount} online</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#979797' }}>
            <MessageSquare className="w-5 h-5" />
            <span>{workouts.length} posts</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#979797' }}>
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
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {workouts.length === 0 ? (
          <div className="p-12 text-center" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#979797' }} />
            <h3 className="text-lg font-medium text-white mb-2">No community posts yet</h3>
            <p className="mb-6" style={{ color: '#979797' }}>
              Be the first to share your workout with the community!
            </p>
            <p className="text-sm" style={{ color: '#5E5E5E' }}>
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
                  className="px-6 py-2 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                  onMouseEnter={(e) => !loadingMore && (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                  onMouseLeave={(e) => !loadingMore && (e.currentTarget.style.backgroundColor = '#232323')}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" style={{ color: '#FFFC74' }} />
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
