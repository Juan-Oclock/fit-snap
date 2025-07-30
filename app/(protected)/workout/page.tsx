'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Clock, Play, Pause, RotateCcw, Search, X, Trophy } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { searchExercises, saveWorkout, uploadWorkoutPhoto, getUserRestTime } from '@/lib/workout';
import { getUserCommunitySharing } from '@/lib/settings';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationGuard } from '@/contexts/NavigationGuardContext';
import ExerciseTimerModal from '@/components/ui/ExerciseTimerModal';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment?: string;
  created_at: string;
}

interface WorkoutSet {
  reps: number;
  weight: number;
}

interface CompletedSet {
  reps: number;
  weight: number;
  timerSeconds: number;
  setNumber: number;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  timerSeconds: number;
  isTimerRunning: boolean;
  notes: string;
  completedSets: CompletedSet[];
  currentSetNumber: number;
}

export default function WorkoutPage() {
  // --- Timer Modal State ---
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timerModalExerciseId, setTimerModalExerciseId] = useState<string | null>(null);
  // --- In-Modal Rest State ---
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // In-modal rest handlers
  const wasTimerRunningRef = useRef(false);

  const handleRest = () => {
    if (timerModalExerciseId) {
      // Pause the timer for the modal exercise if running
      const exercise = workoutExercises.find(ex => ex.id === timerModalExerciseId);
      if (exercise && exercise.isTimerRunning) {
        wasTimerRunningRef.current = true;
        // Stop interval
        const interval = timerIntervalsRef.current.get(timerModalExerciseId);
        if (interval) {
          clearInterval(interval);
          timerIntervalsRef.current.delete(timerModalExerciseId);
        }
        setWorkoutExercises(prev => prev.map(ex =>
          ex.id === timerModalExerciseId ? { ...ex, isTimerRunning: false } : ex
        ));
      } else {
        wasTimerRunningRef.current = false;
      }
    }
    setIsResting(true);
    setRestTimer(userRestTime);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!);
          setIsResting(false);
          // Resume timer if it was running before rest
          if (timerModalExerciseId && wasTimerRunningRef.current) {
            // Start the timer interval again
            const interval = setInterval(() => {
              setWorkoutExercises(current => current.map(e =>
                e.id === timerModalExerciseId ? { ...e, timerSeconds: e.timerSeconds + 1 } : e
              ));
            }, 1000);
            timerIntervalsRef.current.set(timerModalExerciseId, interval);
            setWorkoutExercises(prev => prev.map(ex =>
              ex.id === timerModalExerciseId ? { ...ex, isTimerRunning: true } : ex
            ));
          }
          wasTimerRunningRef.current = false;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onCancelRest = () => {
    setIsResting(false);
    setRestTimer(0);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    // Resume timer if it was running before rest
    if (timerModalExerciseId && wasTimerRunningRef.current) {
      const interval = setInterval(() => {
        setWorkoutExercises(current => current.map(e =>
          e.id === timerModalExerciseId ? { ...e, timerSeconds: e.timerSeconds + 1 } : e
        ));
      }, 1000);
      timerIntervalsRef.current.set(timerModalExerciseId, interval);
      setWorkoutExercises(prev => prev.map(ex =>
        ex.id === timerModalExerciseId ? { ...ex, isTimerRunning: true } : ex
      ));
    }
    wasTimerRunningRef.current = false;
  };



  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user } = useAuth();
  const { setUnsavedDataChecker, setClearDataFunction } = useNavigationGuard();
  
  // State
  const [workoutName, setWorkoutName] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [workoutPhoto, setWorkoutPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // Workout Notes state removed
  const [isSaving, setIsSaving] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [userRestTime, setUserRestTime] = useState(60);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [restInterval, setRestInterval] = useState<NodeJS.Timeout | null>(null);
  const [pausedExerciseId, setPausedExerciseId] = useState<string | null>(null);
  const [exerciseValidationErrors, setExerciseValidationErrors] = useState<Record<string, string>>({});
  
  // Photo confirmation dialog state
  const [showPhotoConfirmDialog, setShowPhotoConfirmDialog] = useState(false);
  const [highlightPhotoSection, setHighlightPhotoSection] = useState(false);
  const [showPhotoSection, setShowPhotoSection] = useState(false);
  
  // Persistent completed sets that survive exercise removal
  const [persistentCompletedSets, setPersistentCompletedSets] = useState<Array<CompletedSet & { exerciseName: string, exerciseId: string, databaseExerciseId: string }>>([]);

  // Exercise search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [shareToCommunity, setShareToCommunity] = useState(false);
  
  const timerIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Check if there's unsaved workout data
  const hasUnsavedData = useCallback(() => {
    // Check if workout name is entered and there are completed exercises
    return workoutName.trim() !== '' && persistentCompletedSets.length > 0;
  }, [workoutName, persistentCompletedSets]);

  // Clear all unsaved workout data
  const clearUnsavedWorkoutData = useCallback(() => {
    setWorkoutName('');
    setPersistentCompletedSets([]);
    setWorkoutExercises([]);
    setWorkoutPhoto(null);
    setPhotoPreview(null);
  }, []);

  // Register with navigation guard context
  useEffect(() => {
    setUnsavedDataChecker(hasUnsavedData);
    setClearDataFunction(clearUnsavedWorkoutData);
  }, [hasUnsavedData, clearUnsavedWorkoutData, setUnsavedDataChecker, setClearDataFunction]);

  // Load user preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) return;
      
      const restTime = await getUserRestTime();
      setUserRestTime(restTime);
      
      const communitySharing = await getUserCommunitySharing(user.id);
      setShareToCommunity(communitySharing);
    };
    loadUserPreferences();
  }, [user?.id]);

  // Navigation guard - prevent browser navigation when there's unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData()) {
        // Modern browsers ignore custom messages and show their own
        // Just prevent the default and set returnValue to trigger the dialog
        e.preventDefault();
        e.returnValue = ''; // Empty string is required for modern browsers
        return ''; // Some browsers need this return value
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedData]);

  // Navigation guard - Note: Next.js 13+ App Router doesn't have router events
  // Navigation protection is handled through custom handleNavigation function
  // and beforeunload event for browser navigation

  // Workout duration timer removed

  // Helper function to get muscle group name
  const getMuscleGroupName = (exercise: Exercise): string => {
    return exercise.muscle_group;
  };

  // Search exercises with loading state
  const handleSearchExercises = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchExercises(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching exercises:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add exercise
  const addExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: `exercise-${Date.now()}`,
      exercise,
      sets: [{ reps: 0, weight: 0 }],
      timerSeconds: 0,
      isTimerRunning: false,
      notes: '',
      completedSets: [],
      currentSetNumber: 1
    };
    
    setWorkoutExercises(prev => [...prev, newExercise]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Remove exercise
  const removeExercise = (exerciseId: string) => {
    // Check if this exercise has a running timer
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.isTimerRunning) {
      setExerciseValidationErrors(prev => ({
        ...prev,
        [exerciseId]: 'Please click "Exercise Done" to complete the current set before removing this exercise.'
      }));
      setTimeout(() => {
        setExerciseValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[exerciseId];
          return newErrors;
        });
      }, 4000);
      return;
    }
    
    // Stop timer if running (cleanup)
    const interval = timerIntervalsRef.current.get(exerciseId);
    if (interval) {
      clearInterval(interval);
      timerIntervalsRef.current.delete(exerciseId);
    }
    
    setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  // Update set
  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setWorkoutExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? {
            ...ex,
            sets: ex.sets.map((set, idx) => 
              idx === setIndex ? { ...set, [field]: Math.max(0, value) } : set
            )
          }
        : ex
    ));
  };

  // Validation helper functions
  const hasValidSetsForExercise = (exerciseId: string): boolean => {
    const exercise = workoutExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return false;
    
    // Check if at least one set has both reps and weight filled
    return exercise.sets.some(set => 
      set.reps && set.reps > 0 && set.weight && set.weight > 0
    );
  };

  const isAnyTimerRunning = (): boolean => {
    return workoutExercises.some(ex => ex.isTimerRunning);
  };

  const validateExerciseForTimer = (exerciseId: string): boolean => {
    if (!hasValidSetsForExercise(exerciseId)) {
      setExerciseValidationErrors(prev => ({
        ...prev,
        [exerciseId]: 'Please fill in reps and weight for at least one set before starting the timer.'
      }));
      setTimeout(() => {
        setExerciseValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[exerciseId];
          return newErrors;
        });
      }, 3000);
      return false;
    }
    return true;
  };

  // Helper function to check if any exercise has valid data for timers
  const hasAnyValidExercise = (): boolean => {
    return workoutExercises.some(exercise => 
      exercise.sets.some(set => set.reps && set.reps > 0 && set.weight && set.weight > 0)
    );
  };

  // Timer functions
  const toggleTimer = useCallback((exerciseId: string) => {
    setWorkoutExercises(prev => {
      const exercise = prev.find(ex => ex.id === exerciseId);
      if (!exercise) return prev;
      
      // If trying to start timer (not currently running), validate first
      if (!exercise.isTimerRunning) {
        // Check if at least one set has both reps and weight filled
        const hasValidSet = exercise.sets.some(set => 
          set.reps && set.reps > 0 && set.weight && set.weight > 0
        );
        
        if (!hasValidSet) {
          setExerciseValidationErrors(prev => ({
            ...prev,
            [exerciseId]: 'Please fill in reps and weight for at least one set before starting the timer.'
          }));
          setTimeout(() => {
            setExerciseValidationErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[exerciseId];
              return newErrors;
            });
          }, 3000);
          return prev;
        }
      }
      
      const newIsRunning = !exercise.isTimerRunning;
      
      if (newIsRunning) {
        // Clear any existing interval first
        const existingInterval = timerIntervalsRef.current.get(exerciseId);
        if (existingInterval) {
          clearInterval(existingInterval);
        }
        
        // Start timer
        const interval = setInterval(() => {
          setWorkoutExercises(current => current.map(e => 
            e.id === exerciseId ? { ...e, timerSeconds: e.timerSeconds + 1 } : e
          ));
        }, 1000);
        
        timerIntervalsRef.current.set(exerciseId, interval);
      } else {
        // Stop timer
        const interval = timerIntervalsRef.current.get(exerciseId);
        if (interval) {
          clearInterval(interval);
          timerIntervalsRef.current.delete(exerciseId);
        }
      }
      
      return prev.map(ex => 
        ex.id === exerciseId ? { ...ex, isTimerRunning: newIsRunning } : ex
      );
    });
  }, []);

  const resetTimer = useCallback((exerciseId: string) => {
    // Stop timer if running
    const interval = timerIntervalsRef.current.get(exerciseId);
    if (interval) {
      clearInterval(interval);
      timerIntervalsRef.current.delete(exerciseId);
    }
    
    // Reset timer
    setWorkoutExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, timerSeconds: 0, isTimerRunning: false }
        : ex
    ));
  }, []);

  // Exercise Done - Complete current set and prepare for next
  const exerciseDone = useCallback((exerciseId: string) => {
    setWorkoutExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      
      // Get current set data (first set with data)
      const currentSet = ex.sets.find(set => set.reps > 0 && set.weight > 0);
      if (!currentSet) return ex; // No valid set to complete
      
      // Stop timer if running
      const interval = timerIntervalsRef.current.get(exerciseId);
      if (interval) {
        clearInterval(interval);
        timerIntervalsRef.current.delete(exerciseId);
      }
      
      // Create completed set record
      const completedSet: CompletedSet = {
        reps: currentSet.reps,
        weight: currentSet.weight,
        timerSeconds: ex.timerSeconds,
        setNumber: ex.currentSetNumber
      };
      
      // Add to persistent completed sets (survives exercise removal)
      const persistentCompletedSet = {
        ...completedSet,
        exerciseName: ex.exercise.name,
        exerciseId: ex.id,
        databaseExerciseId: ex.exercise.id
      };
      
      // Add to persistent state only if not already exists (prevent duplicates)
      setPersistentCompletedSets(prev => {
        const isDuplicate = prev.some(existing => 
          existing.exerciseId === persistentCompletedSet.exerciseId &&
          existing.setNumber === persistentCompletedSet.setNumber &&
          existing.reps === persistentCompletedSet.reps &&
          existing.weight === persistentCompletedSet.weight &&
          existing.timerSeconds === persistentCompletedSet.timerSeconds
        );
        
        if (isDuplicate) {
          return prev; // Don't add duplicate
        }
        
        return [...prev, persistentCompletedSet];
      });
      
      // Prepare for next set (no need to store local completedSets since we use persistent state)
      return {
        ...ex,
        currentSetNumber: ex.currentSetNumber + 1,
        timerSeconds: 0,
        isTimerRunning: false,
        sets: [{ reps: 0, weight: 0 }] // Reset to empty set for next
      };
    }));
  }, []);

  // Start rest timer
  const startRestTimer = () => {
    // Validate that there's at least one exercise with valid sets
    if (!hasAnyValidExercise()) {
      alert('Please fill in reps and weight for at least one set before starting rest timer.');
      return;
    }
    
    // Find any currently running exercise timer and pause it
    const runningExercise = workoutExercises.find(ex => ex.isTimerRunning);
    if (runningExercise) {
      // Pause the running exercise timer
      const interval = timerIntervalsRef.current.get(runningExercise.id);
      if (interval) {
        clearInterval(interval);
        timerIntervalsRef.current.delete(runningExercise.id);
      }
      
      // Update the exercise state to paused and remember which one was paused
      setWorkoutExercises(prev => prev.map(ex => 
        ex.id === runningExercise.id ? { ...ex, isTimerRunning: false } : ex
      ));
      setPausedExerciseId(runningExercise.id);
    }
    
    setRestTimeRemaining(userRestTime);
    setShowRestTimer(true);
    
    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowRestTimer(false);
          // Resume the paused exercise timer when rest timer ends
          resumePausedExerciseTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setRestInterval(interval);
  };

  // Stop rest timer
  const stopRestTimer = () => {
    if (restInterval) {
      clearInterval(restInterval);
      setRestInterval(null);
    }
    setShowRestTimer(false);
    setRestTimeRemaining(0);
    // Resume the paused exercise timer when rest timer is manually stopped
    resumePausedExerciseTimer();
  };

  // Helper function to resume paused exercise timer
  const resumePausedExerciseTimer = () => {
    if (pausedExerciseId) {
      // Start the timer for the previously paused exercise
      const interval = setInterval(() => {
        setWorkoutExercises(current => current.map(e => 
          e.id === pausedExerciseId ? { ...e, timerSeconds: e.timerSeconds + 1 } : e
        ));
      }, 1000);
      
      timerIntervalsRef.current.set(pausedExerciseId, interval);
      
      // Update the exercise state to running
      setWorkoutExercises(prev => prev.map(ex => 
        ex.id === pausedExerciseId ? { ...ex, isTimerRunning: true } : ex
      ));
      
      // Clear the paused exercise ID
      setPausedExerciseId(null);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWorkoutPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save workout
  const handleSaveWorkout = async () => {
    console.log('=== SAVE WORKOUT CLICKED ===');
    console.log('Workout name:', workoutName);
    console.log('Persistent completed sets:', persistentCompletedSets);
    console.log('Workout exercises:', workoutExercises);
    
    // Check user authentication from AuthContext
    console.log('Current user from AuthContext:', user);
    
    if (!user) {
      alert('You must be logged in to save workouts. Please refresh the page and try again.');
      return;
    }
    
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    // Check if there are any completed exercises (consistent with button enable condition)
    if (persistentCompletedSets.length === 0) {
      alert('Please complete at least one exercise by clicking "Exercise Done"');
      return;
    }

    // Check if photo is missing and show confirmation dialog
    if (!workoutPhoto) {
      setShowPhotoConfirmDialog(true);
      return;
    }

    // Proceed with saving
    await saveWorkoutData();
  };

  // Extracted save logic that can be called with or without photo
  const saveWorkoutData = async () => {
    setIsSaving(true);

    try {
      // Stop all timers
      timerIntervalsRef.current.forEach(interval => clearInterval(interval));
      timerIntervalsRef.current.clear();

      // Upload photo if exists
      let photoUrl: string | undefined;
      if (workoutPhoto) {
        const uploadResult = await uploadWorkoutPhoto(workoutPhoto);
        if (uploadResult.success) {
          photoUrl = uploadResult.url;
        } else {
          console.error('Photo upload failed:', uploadResult.error);
        }
      }

      // Prepare exercises data from all exercises with valid sets
      console.log('=== EXERCISE DATA PREPARATION DEBUG ===');
      console.log('workoutExercises:', workoutExercises);
      console.log('persistentCompletedSets:', persistentCompletedSets);
      
      // First, get all unique exercise IDs from completed sets
      const completedExerciseIds = Array.from(new Set(persistentCompletedSets.map(set => set.exerciseId)));
      console.log('Completed exercise IDs:', completedExerciseIds);
      
      // Find any exercises that have completed sets but are not in workoutExercises
      const missingExercises = completedExerciseIds.filter(exerciseId => 
        !workoutExercises.some(ex => ex.id === exerciseId)
      );
      console.log('Missing exercises (have completed sets but not in workoutExercises):', missingExercises);
      
      const exercisesData = workoutExercises
        .filter(exercise => {
          const hasValidRegularSets = exercise.sets.some(set => set.reps > 0);
          const hasCompletedSets = persistentCompletedSets.some(completedSet => completedSet.exerciseId === exercise.id);
          const hasValidSets = hasValidRegularSets || hasCompletedSets;
          console.log(`Exercise ${exercise.exercise.name}:`);
          console.log(`  - Has valid regular sets:`, hasValidRegularSets, exercise.sets);
          console.log(`  - Has completed sets:`, hasCompletedSets);
          console.log(`  - Will be included:`, hasValidSets);
          return hasValidSets;
        }) // Only exercises with valid sets (either regular or completed)
        .map(exercise => {
          // Get timer-completed sets for this exercise
          const timerCompletedSets = persistentCompletedSets
            .filter(completedSet => completedSet.exerciseId === exercise.id)
            .map(completedSet => ({
              reps: completedSet.reps,
              weight: completedSet.weight,
              duration: completedSet.timerSeconds
            }));
          
          // Get regular sets with valid data (reps > 0)
          const regularSets = exercise.sets
            .filter(set => set.reps > 0)
            .map(set => ({
              reps: set.reps,
              weight: set.weight || 0,
              duration: 0 // Regular sets don't have timer duration
            }));
          
          // Combine both types of sets
          const allSets = [...timerCompletedSets, ...regularSets];
          
          console.log(`Exercise ${exercise.exercise.name}:`);
          console.log('  - Timer completed sets:', timerCompletedSets);
          console.log('  - Regular sets:', regularSets);
          console.log('  - Combined sets:', allSets);
          
          return {
            exercise_id: exercise.exercise.id,
            sets: allSets,
            notes: exercise.notes || undefined
          };
        });
      
      // Add exercises that only exist in persistentCompletedSets (were removed from workoutExercises)
      const missingExercisesData = missingExercises.map(localExerciseId => {
        const completedSetsForExercise = persistentCompletedSets
          .filter(completedSet => completedSet.exerciseId === localExerciseId)
          .map(completedSet => ({
            reps: completedSet.reps,
            weight: completedSet.weight,
            duration: completedSet.timerSeconds
          }));
        
        // Get the database exercise ID from the first completed set
        const firstCompletedSet = persistentCompletedSets.find(set => set.exerciseId === localExerciseId);
        
        if (!firstCompletedSet) {
          console.log(`WARNING: No completed set found for missing exercise ${localExerciseId}`);
          return null;
        }
        
        console.log(`Adding missing exercise ${localExerciseId} (${firstCompletedSet.exerciseName}) with completed sets:`, completedSetsForExercise);
        console.log(`Using database exercise ID: ${firstCompletedSet.databaseExerciseId}`);
        
        return {
          exercise_id: firstCompletedSet.databaseExerciseId,
          sets: completedSetsForExercise,
          notes: undefined
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
      
      // Combine regular exercises and missing exercises
      const allExercisesData = [...exercisesData, ...missingExercisesData];
      
      console.log('=== FINAL EXERCISES DATA ===');
      console.log('exercisesData from workoutExercises:', exercisesData);
      console.log('missingExercisesData:', missingExercisesData);
      console.log('allExercisesData:', allExercisesData);
      console.log('allExercisesData.length:', allExercisesData.length);

      // Save workout
      console.log('=== CALLING SAVE WORKOUT ===');
      console.log('Workout data:', {
        name: workoutName,
        notes: undefined,
        photo_url: photoUrl,
        duration: Math.floor((Date.now() - workoutStartTime) / 1000)
      });
      console.log('Exercises data:', allExercisesData);
      
      const result = await saveWorkout(
        {
          name: workoutName,
          notes: undefined,
          photo_url: photoUrl,
          duration: Math.floor((Date.now() - workoutStartTime) / 1000),
          is_public: shareToCommunity
        },
        allExercisesData
      );

      console.log('=== SAVE WORKOUT RESULT ===', result);

      if (result.success) {
        // Clear unsaved data state since workout was saved successfully
        clearUnsavedWorkoutData();
        
        // Show success message briefly
        alert('Workout saved successfully! 🎉');
        router.push('/history');
      } else {
        throw new Error(result.error || 'Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#151515' }}>
      {/* Rest Timer Modal */}
      {showRestTimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-8 text-center" style={{ backgroundColor: '#1B1B1B', borderRadius: '8px', border: '1px solid #404040' }}>
            <div className="text-6xl font-mono font-bold mb-4" style={{ color: '#FFFC74' }}>
              {formatTime(restTimeRemaining)}
            </div>
            <div className="text-lg mb-6" style={{ color: '#979797' }}>Rest Time</div>
            <button
              onClick={stopRestTimer}
              className="px-6 py-2 text-white transition-colors" style={{ backgroundColor: '#dc2626', borderRadius: '8px' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              Stop Rest
            </button>
          </div>
        </div>
      )}

      {/* Photo Confirmation Dialog */}
      {showPhotoConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 max-w-md mx-4 text-center" style={{ backgroundColor: '#1B1B1B', borderRadius: '8px', border: '1px solid #404040' }}>
            <h3 className="text-lg font-semibold text-white mb-4">
              Would you like to add a workout photo?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#979797' }}>
              Photos help track your progress! You can always add this later in your next workout session.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPhotoConfirmDialog(false);
                  // Proceed to save without photo
                  saveWorkoutData();
                }}
                className="flex-1 px-4 py-2 text-white transition-colors" style={{ backgroundColor: '#232323', borderRadius: '8px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232323'}
              >
                No, Save Now
              </button>
              <button
                onClick={() => {
                  setShowPhotoConfirmDialog(false);
                  // Show photo section
                  setShowPhotoSection(true);
                  // Highlight photo section and scroll to it
                  setHighlightPhotoSection(true);
                  // Scroll to photo section
                  const photoSection = document.querySelector('[data-photo-section]');
                  if (photoSection) {
                    photoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                  // Remove highlight after 3 seconds
                  setTimeout(() => setHighlightPhotoSection(false), 3000);
                }}
                className="flex-1 px-4 py-2 text-black transition-colors" style={{ backgroundColor: '#FFFC74', borderRadius: '8px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef9c3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFC74'}
              >
                Yes, Add Photo
              </button>
            </div>
          </div>
        </div>
      )}



      <div className="container-app space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-heading" style={{ fontSize: '24px', textTransform: 'uppercase', color: '#FFFFFF' }}>NEW WORKOUT</h1>
        </div>

        {/* Workout Name */}
        <div>
          <label className="block text-subheading mb-2" style={{ fontSize: '12px', color: '#979797' }}>
            Workout Name *
          </label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Push Day, Morning Run, etc."
            className="w-full px-3 py-2 text-white focus:outline-none focus:ring-2 focus:border-transparent" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px', color: '#FFFFFF' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#FFFC74'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#404040'}
            required
          />
        </div>

        {/* Global Completed Sets Table */}
        {persistentCompletedSets.length > 0 && (
          <div className="p-4" style={{ backgroundColor: '#1B1B1B', borderRadius: '8px' }}>
            <h3 className="text-lg font-semibold text-white mb-3">Completed Exercise</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #404040' }}>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: '#979797' }}>Exercise</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: '#979797' }}>Set</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: '#979797' }}>Reps</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: '#979797' }}>Weight</th>
                    <th className="text-left py-2 px-2 font-medium" style={{ color: '#979797' }}>Timer</th>
                  </tr>
                </thead>
                <tbody>
                  {persistentCompletedSets.map((completedSet, index) => (
                    <tr key={`${completedSet.exerciseId}-${completedSet.setNumber}-${index}`} className="last:border-b-0" style={{ borderBottom: '1px solid #404040' }}>
                      <td className="py-2 px-2 text-white font-medium">{completedSet.exerciseName}</td>
                      <td className="py-2 px-2 text-white">#{completedSet.setNumber}</td>
                      <td className="py-2 px-2 text-white">{completedSet.reps}</td>
                      <td className="py-2 px-2 text-white">{completedSet.weight} kg</td>
                      <td className="py-2 px-2 text-white">{formatTime(completedSet.timerSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exercise Search */}
        <div className="relative">
          <label className="block text-subheading mb-2" style={{ fontSize: '12px', color: '#979797' }}>
            Add Exercise
          </label>
          <div className="relative">
            <Search className={`absolute left-3 top-3 w-5 h-5`} style={{ color: isAnyTimerRunning() ? '#5E5E5E' : '#979797' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => !isAnyTimerRunning() && handleSearchExercises(e.target.value)}
              placeholder={isAnyTimerRunning() ? "Complete current exercise to add new ones..." : "Search exercises..."}
              disabled={isAnyTimerRunning()}
              className="w-full pl-10 pr-3 py-2 focus:outline-none" style={{
                backgroundColor: isAnyTimerRunning() ? '#151515' : '#232323',
                border: `1px solid ${isAnyTimerRunning() ? '#5E5E5E' : '#404040'}`,
                borderRadius: '8px',
                color: isAnyTimerRunning() ? '#5E5E5E' : '#FFFFFF',
                cursor: isAnyTimerRunning() ? 'not-allowed' : 'text'
              }}
              onFocus={(e) => !isAnyTimerRunning() && (e.currentTarget.style.borderColor = '#FFFC74')}
              onBlur={(e) => !isAnyTimerRunning() && (e.currentTarget.style.borderColor = '#404040')}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {showSearchResults && !isAnyTimerRunning() && (
            <div className="absolute top-full left-0 right-0 mt-1 shadow-lg z-10 max-h-60 overflow-y-auto" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
              {searchResults.length === 0 ? (
                <div className="p-3 text-center" style={{ color: '#979797' }}>
                  {isSearching ? 'Searching...' : 'No exercises found'}
                </div>
              ) : (
                searchResults.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="w-full text-left p-3 transition-colors last:border-b-0" style={{ borderBottom: '1px solid #404040' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#232323'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="font-medium text-white">{exercise.name}</div>
                    <div className="text-sm" style={{ color: '#979797' }}>
                      {exercise.category} • {exercise.equipment || 'No equipment'}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Added Exercises */}
        {workoutExercises.map((workoutExercise, exerciseIndex) => (
  <div key={workoutExercise.id} className="p-4 space-y-4" style={{ backgroundColor: '#1B1B1B', borderRadius: '8px' }}>
    {/* Exercise Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {workoutExercise.exercise.name}
        </h3>
        <p className="text-sm" style={{ color: '#979797' }}>
          {workoutExercise.exercise.category} • {workoutExercise.exercise.equipment || 'No equipment'}
        </p>
      </div>
      <button
        onClick={() => removeExercise(workoutExercise.id)}
        className="w-8 h-8 text-white flex items-center justify-center transition-colors" style={{ backgroundColor: '#dc2626', borderRadius: '50%' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
      >
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* Exercise Validation Message */}
    {exerciseValidationErrors[workoutExercise.id] && (
      <div className="p-3" style={{ backgroundColor: 'rgba(153, 27, 27, 0.5)', border: '1px solid #ef4444', borderRadius: '8px' }}>
        <p className="text-sm" style={{ color: '#fca5a5' }}>
          {exerciseValidationErrors[workoutExercise.id]}
        </p>
      </div>
    )}

    {/* Current Set */}
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-300">Current Set</div>
      {workoutExercise.sets.map((set, setIndex) => (
        <div
          key={setIndex}
          className={`flex items-center gap-3 p-3 rounded transition-all
            ${hasValidSetsForExercise(workoutExercise.id)
              ? 'bg-gray-700'
              : 'bg-yellow-900/10 border-2 border-yellow-400 shadow-yellow-200 animate-pulse'}`}
        >
          <div className="text-sm text-gray-400 w-8">#{workoutExercise.currentSetNumber}</div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Reps</label>
              <input
                type="number"
                value={set.reps || ''}
                onChange={(e) => updateSet(workoutExercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-yellow-400"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={set.weight || ''}
                onChange={(e) => updateSet(workoutExercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-yellow-400"
                min="0"
                step="0.5"
              />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Notification for this specific exercise if no valid sets */}
    {!hasValidSetsForExercise(workoutExercise.id) && (
      <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3 mb-3">
        <div className="flex items-start space-x-2">
          <div className="text-blue-400 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-blue-300 text-sm font-medium">Timer Setup Required</p>
            <p className="text-blue-200 text-xs mt-1">
              Fill in reps and weight for at least one set to enable timers for this exercise.
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Exercise Timer Modal Trigger */}
    {hasValidSetsForExercise(workoutExercise.id) && (
      <div className="flex flex-row items-center py-4 gap-4">
        <button
          onClick={() => {
            // Auto-play: if timer not running, start it before opening modal
            if (!workoutExercise.isTimerRunning) {
              toggleTimer(workoutExercise.id);
            }
            setTimerModalExerciseId(workoutExercise.id);
            setIsTimerModalOpen(true);
          }}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg
            bg-yellow-400 text-black hover:bg-yellow-500 animate-pulse
          `}
          aria-label="Start Timer"
        >
          <Play className="w-10 h-10" />
        </button>
        <span className="flex items-center text-sm text-gray-400 ml-2">
          <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l-7-7 7-7" /></svg>
          Click here to start timer
        </span>
      </div>
    )}

    {/* Exercise Notes */}
    <div>
      <div className="text-sm font-medium text-gray-300 mb-2">Notes (Optional)</div>
      <textarea
        value={workoutExercise.notes}
        onChange={(e) => setWorkoutExercises(prev => prev.map(ex => 
          ex.id === workoutExercise.id ? { ...ex, notes: e.target.value } : ex
        ))}
        placeholder="Add notes about this exercise..."
        rows={3}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
      />
    </div>
  </div>
))}

{/* === EXERCISE TIMER MODAL === */}
{isTimerModalOpen && timerModalExerciseId && (() => {
  const exercise = workoutExercises.find(ex => ex.id === timerModalExerciseId);
  if (!exercise) return null;
  return (
    <ExerciseTimerModal
      isOpen={isTimerModalOpen}
      onClose={() => {
        setIsTimerModalOpen(false);
        setTimerModalExerciseId(null);
        setIsResting(false);
        setRestTimer(0);
        if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      }}
      exerciseName={exercise.exercise.name}
      reps={exercise.sets[0]?.reps || 0}
      weight={exercise.sets[0]?.weight || 0}
      sets={exercise.currentSetNumber}
      timer={exercise.timerSeconds}
      isRunning={exercise.isTimerRunning}
      onPlayPause={() => !isResting && toggleTimer(exercise.id)}
      onRest={handleRest}
      onDone={() => {
        exerciseDone(exercise.id);
        setIsTimerModalOpen(false);
        setTimerModalExerciseId(null);
        setIsResting(false);
        setRestTimer(0);
        if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      }}
      isResting={isResting}
      restTimer={restTimer}
      onCancelRest={onCancelRest}
      userRestTime={userRestTime}
    />
  );
})()}


        {/* Workout Photo */}
        {showPhotoSection && (
          <div 
            data-photo-section
            className={`transition-all duration-500 rounded-lg p-4 ${
              highlightPhotoSection 
                ? 'bg-yellow-900/30 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20' 
                : 'bg-transparent border-2 border-transparent'
            }`}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Photo (Optional)
            </label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Workout preview" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    setWorkoutPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Add workout photo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Capture your progress with a mirror selfie or gym photo. Images are automatically compressed to ~50kB.
            </p>
          </div>
        )}

        {/* Community Sharing Toggle */}
        <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Share to Community</h3>
              <p className="text-gray-400 text-sm">Let others see this workout in the community feed</p>
            </div>
            <button
              type="button"
              onClick={() => setShareToCommunity(!shareToCommunity)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareToCommunity ? 'bg-yellow-400' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareToCommunity ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom padding to prevent content from being hidden behind sticky button */}
        <div className="h-20"></div>


      </div>
      
      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-40">
        <button
          onClick={handleSaveWorkout}
          disabled={isSaving || !workoutName.trim() || persistentCompletedSets.length === 0}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" />
              Saving Workout...
            </>
          ) : (
            'Save Workout'
          )}
        </button>
      </div>
    </div>
  );
}
