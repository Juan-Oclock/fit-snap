'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Calendar, Clock, User, ChevronDown, ChevronUp, Target, Weight } from 'lucide-react';
import { CommunityWorkout, CommunityComment } from '@/lib/community';
import { addReaction, removeReaction, addComment, getWorkoutComments } from '@/lib/community';
import { UserAvatar } from './UserAvatar';
import { formatRelativeTime, generateExerciseSummary, calculateWorkoutVolume } from '@/lib/community';

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

interface CommunityWorkoutCardProps {
  workout: CommunityWorkout;
  currentUserId?: string;
  onReactionUpdate?: (workoutId: string, newCount: number) => void;
  onCommentAdd?: (workoutId: string, newCount: number) => void;
}

export default function CommunityWorkoutCard({ 
  workout, 
  currentUserId,
  onReactionUpdate,
  onCommentAdd 
}: CommunityWorkoutCardProps) {
  const initialIsLiked = workout.community_reactions?.some(r => r.user_id === currentUserId) || false;
  const initialLikeCount = workout.community_reactions?.length || 0;
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailedExercises, setDetailedExercises] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Comment state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);


  const handleLikeToggle = async () => {
    if (!currentUserId || isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        await removeReaction(workout.id, currentUserId);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await addReaction(workout.id, currentUserId, 'like');
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      if (onReactionUpdate) {
        onReactionUpdate(workout.id, isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(initialIsLiked);
      setLikeCount(initialLikeCount);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentsToggle = async () => {
    if (!showComments && comments.length === 0) {
      // Load comments when first opening
      setLoadingComments(true);
      try {
        const fetchedComments = await getWorkoutComments(workout.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!currentUserId || !newComment.trim() || addingComment) return;

    setAddingComment(true);
    try {
      const comment = await addComment(workout.id, currentUserId, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Update the comment count in the parent component
      if (onCommentAdd) {
        const newCount = (workout._count?.community_comments || 0) + 1;
        onCommentAdd(workout.id, newCount);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setAddingComment(false);
    }
  };

  const fetchWorkoutDetails = async () => {
    if (loadingDetails || detailedExercises.length > 0) return;
    
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/community-workout-details/${workout.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setDetailedExercises(data.exercises || []);
        console.log(`Fetched ${data.exercises?.length || 0} exercises with ${data.totalSets || 0} total sets`);
      } else {
        console.error('Failed to fetch workout details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching workout details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleDetails = async () => {
    if (!showDetails) {
      await fetchWorkoutDetails();
    }
    setShowDetails(!showDetails);
  };

  const exerciseSummary = generateExerciseSummary(workout.workout_exercises);
  const totalVolume = calculateWorkoutVolume(workout.workout_exercises);
  const displayName = workout.profiles?.full_name || workout.profiles?.username || 'Anonymous User';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserAvatar 
            name={workout.profiles?.full_name || undefined}
            username={workout.profiles?.username || undefined}
            size="md"
          />
          <div>
            <p className="font-medium text-white">{displayName}</p>
            <p className="text-sm text-gray-400">
              {formatRelativeTime(workout.completed_at)}
            </p>
          </div>
        </div>
        <div className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
          {workout.type}
        </div>
      </div>

      {/* Workout Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
        
        {workout.notes && (
          <p className="text-gray-300 text-sm">{workout.notes}</p>
        )}

        {/* Exercise Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>{exerciseSummary}</span>
            </div>
            {totalVolume > 0 && (
              <div className="flex items-center space-x-1">
                <Weight className="w-4 h-4" />
                <span>{totalVolume.toLocaleString()} lbs total</span>
              </div>
            )}
          </div>
          {workout.workout_exercises && workout.workout_exercises.length > 0 && (
            <button
              onClick={handleToggleDetails}
              disabled={loadingDetails}
              className="flex items-center space-x-1 text-sm text-primary hover:text-primary-light transition-colors disabled:opacity-50"
            >
              <span>{loadingDetails ? 'Loading...' : 'View Details'}</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Exercise Details */}
        {showDetails && (
          <div className="bg-dark-700 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Exercise Details</h4>

            {detailedExercises.length > 0 ? (
              detailedExercises.map((workoutExercise, index) => (
                <div key={index} className="bg-dark-800 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-white">
                        {index + 1}. {workoutExercise.exercises?.name || 'Unknown Exercise'}
                      </h5>
                      <p className="text-gray-400 text-xs capitalize">
                        {workoutExercise.exercises?.muscle_group}
                      </p>
                    </div>
                  </div>
                
                  {workoutExercise.workout_sets && workoutExercise.workout_sets.length > 0 ? (
                    <div className="mt-3">
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-2">
                        <span>Set</span>
                        <span>Reps</span>
                        <span>Weight</span>
                        <span>Duration</span>
                      </div>
                      {workoutExercise.workout_sets.map((set: any, setIndex: number) => (
                        <div key={setIndex} className="grid grid-cols-4 gap-2 text-sm py-1">
                          <span className="text-gray-300">#{setIndex + 1}</span>
                          <span className="text-white">{set.reps || 0}</span>
                          <span className="text-white">{set.weight || 0} lbs</span>
                          <span className="text-white">{set.duration ? formatDuration(set.duration) : '-'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-gray-400 text-sm">
                      No sets recorded for this exercise
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">
                {loadingDetails ? 'Loading exercise details...' : 'No exercise details available'}
              </div>
            )}
          </div>
        )}

        {/* Workout Photo */}
        {workout.photo_url && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-dark-700">
            <Image
              src={workout.photo_url}
              alt={`${workout.name} photo`}
              fill
              className="object-cover"
            />
          </div>
        )}

      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-dark-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLikeToggle}
            disabled={!currentUserId || isLoading}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked 
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-red-500'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likeCount}</span>
          </button>
          
          <button 
            onClick={handleCommentsToggle}
            className="flex items-center space-x-1 text-gray-400 hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{workout._count?.community_comments || 0}</span>
          </button>
        </div>

        <div className="text-xs text-gray-500">
          <Clock className="w-3 h-3 inline mr-1" />
          Workout completed
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-dark-700 pt-4 space-y-4">
          {/* Add Comment Form */}
          {currentUserId && (
            <div className="flex space-x-3">
              <UserAvatar 
                username={"You"} 
                size="sm" 
              />
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-primary"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                    className="px-4 py-1 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    {addingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {loadingComments ? (
              <div className="text-center text-gray-400 py-4">
                Loading comments...
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <UserAvatar 
                    username={comment.profiles?.username || 'Unknown'} 
                    size="sm" 
                  />
                  <div className="flex-1 bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {comment.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
