'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  fetchWorkoutHistory, 
  getUserMuscleGroups, 
  exportWorkoutHistoryCSV, 
  downloadCSV,
  formatDuration,
  formatWorkoutDate,
  formatWorkoutTime,
  deleteWorkout,
  WorkoutHistoryItem,
  HistoryFilters 
} from '@/lib/history';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  DownloadIcon, 
  SearchIcon, 
  CalendarIcon, 
  FilterIcon,
  Loader2Icon,
  XIcon,
  TrashIcon
} from 'lucide-react';

export default function HistoryPage() {
  const { user, loading: userLoading } = useUser();
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [deletingWorkouts, setDeletingWorkouts] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const workoutsPerPage = 10;
  const totalPages = Math.ceil(totalWorkouts / workoutsPerPage);
  
  // Filters
  const [filters, setFilters] = useState<HistoryFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    muscleGroup: '',
    workoutType: ''
  });
  
  // Load workouts and muscle groups
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const offset = (currentPage - 1) * workoutsPerPage;
        const [workoutData, muscleGroupData] = await Promise.all([
          fetchWorkoutHistory(filters, workoutsPerPage, offset),
          getUserMuscleGroups()
        ]);
        
        setWorkouts(workoutData.workouts);
        setTotalWorkouts(workoutData.total);
        setMuscleGroups(muscleGroupData);
      } catch (err) {
        console.error('Error loading workout history:', err);
        setError('Failed to load workout history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, currentPage, filters]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      muscleGroup: '',
      workoutType: ''
    });
    setCurrentPage(1);
  };
  
  // Toggle workout expansion
  const toggleWorkoutExpansion = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const handleDeleteWorkout = async (workoutId: string, workoutName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${workoutName || 'Untitled Workout'}"?\n\nThis action cannot be undone and will remove all exercises, sets, and related data.`
    );
    
    if (!confirmDelete) return;

    setDeletingWorkouts(prev => new Set(prev).add(workoutId));
    
    try {
      await deleteWorkout(workoutId);
      
      // Remove the workout from local state
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      setTotalWorkouts(prev => prev - 1);
      
      // Remove from expanded workouts if it was expanded
      setExpandedWorkouts(prev => {
        const newExpanded = new Set(prev);
        newExpanded.delete(workoutId);
        return newExpanded;
      });
      
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('Failed to delete workout. Please try again.');
    } finally {
      setDeletingWorkouts(prev => {
        const newDeleting = new Set(prev);
        newDeleting.delete(workoutId);
        return newDeleting;
      });
    }
  };

  // Handle CSV export
  const handleExport = async () => {
    try {
      setExporting(true);
      const csvContent = await exportWorkoutHistoryCSV(filters);
      downloadCSV(csvContent, `workout-history-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export workout history. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  
  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  if (userLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Workout History</h1>
        <button 
          onClick={handleExport}
          disabled={exporting || workouts.length === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <DownloadIcon className="h-4 w-4" />
          )}
          Export CSV
        </button>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search and Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                placeholder="From date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                placeholder="To date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              value={filters.workoutType}
              onChange={(e) => handleFilterChange('workoutType', e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="push">Push</option>
              <option value="pull">Pull</option>
              <option value="legs">Legs</option>
              <option value="upper">Upper</option>
              <option value="lower">Lower</option>
              <option value="full_body">Full Body</option>
              <option value="custom">Custom</option>
            </select>
            
            <select 
              value={filters.muscleGroup}
              onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
              className="input-field"
            >
              <option value="">All Muscle Groups</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {/* Workout List */}
      <div className="card">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-dark-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-2">
                      <div className="h-5 bg-dark-700 rounded w-32"></div>
                      <div className="h-4 bg-dark-700 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-dark-700 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-dark-700 rounded w-48"></div>
                </div>
              </div>
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FilterIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No workouts found</p>
              <p className="text-sm">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or create your first workout.' 
                  : 'Start your fitness journey by creating your first workout!'}
              </p>
            </div>
            {!hasActiveFilters && (
              <button 
                onClick={() => window.location.href = '/workout'}
                className="btn-primary"
              >
                Create First Workout
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {workouts.map((workout, index) => {
              const isExpanded = expandedWorkouts.has(workout.id);
              return (
                <div key={workout.id}>
                  {index > 0 && (
                    <div className="border-t border-dark-600 mb-6"></div>
                  )}
                  <div className="border border-dark-700 rounded-lg p-4 hover:border-dark-600 hover:bg-dark-800/50 transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-white">{workout.name || 'Untitled Workout'}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>{formatWorkoutDate(workout.completed_at)}</span>
                        <span>•</span>
                        <span>{formatWorkoutTime(workout.completed_at)}</span>
                        <span>•</span>
                        <span>Duration: {formatDuration(workout.total_exercise_duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteWorkout(workout.id, workout.name)}
                        disabled={deletingWorkouts.has(workout.id)}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded transition-colors"
                        title="Delete workout"
                      >
                        {deletingWorkouts.has(workout.id) ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    {workout.exercise_count} exercises • {workout.total_sets} sets • {workout.total_weight}kg max
                  </div>
                  
                  <div className="mt-2">
                    <button 
                      onClick={() => toggleWorkoutExpansion(workout.id)}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          Hide Details
                          <ChevronUpIcon className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          View Details
                          <ChevronDownIcon className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-dark-700">
                      {workout.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-white mb-2">Notes</h4>
                          <p className="text-gray-300 text-sm">{workout.notes}</p>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-white">Exercises</h4>
                        {workout.workout_exercises.map((workoutExercise, index) => (
                          <div key={workoutExercise.id} className="bg-dark-800 rounded-lg px-4 py-3">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-medium text-white text-sm">
                                  {index + 1}. {workoutExercise.exercise.name}
                                </h5>
                                <p className="text-gray-400 text-xs capitalize mt-1">
                                  {workoutExercise.exercise.muscle_group} • {workoutExercise.exercise.category}
                                </p>
                              </div>
                            </div>
                            
                            {workoutExercise.workout_sets.length > 0 && (
                              <div className="mt-3">
                                <div className="grid grid-cols-4 gap-3 text-xs text-gray-400 mb-2 px-1">
                                  <span>Set</span>
                                  <span>Reps</span>
                                  <span>Weight</span>
                                  <span>Duration</span>
                                </div>
                                {workoutExercise.workout_sets.map((set, setIndex) => (
                                  <div key={set.id} className="grid grid-cols-4 gap-3 text-xs py-1.5 px-1">
                                    <span className="text-gray-300">#{setIndex + 1}</span>
                                    <span className="text-white">{set.reps}</span>
                                    <span className="text-white">{set.weight || 0}kg</span>
                                    <span className="text-white">
                                      {set.duration ? formatDuration(set.duration) : '-'}
                                      {set.is_personal_record && (
                                        <span className="ml-1 text-yellow-500 text-xs">PR</span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {workoutExercise.notes && (
                              <div className="mt-2 pt-2 border-t border-dark-700">
                                <p className="text-gray-300 text-xs">{workoutExercise.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === pageNum 
                        ? 'bg-primary text-dark-900' 
                        : 'bg-dark-700 hover:bg-dark-600 text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
