'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Exercise } from '@/types';
import { filterExercises, deleteExercise, getExerciseOptions } from '@/lib/exercises';
import ExerciseCard from '@/components/ui/ExerciseCard';
import ExerciseForm from '@/components/ui/ExerciseForm';
import { isAdmin } from '@/lib/auth';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Exercise | null>(null);
  const [options, setOptions] = useState({
    categories: [] as string[],
    muscleGroups: [] as string[]
  });
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Load exercises and options on mount
  useEffect(() => {
    loadExercises();
    loadOptions();
  }, []);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      // console.log('Exercises page - Starting admin check...');
      const adminStatus = await isAdmin();
      // console.log('Exercises page - Admin status result:', adminStatus);
      setIsAdminUser(adminStatus);
    };
    checkAdminStatus();
  }, []);

  // Filter exercises when filters change
  useEffect(() => {
    applyFilters();
  }, [exercises, searchQuery, selectedCategory, selectedMuscleGroup]);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const data = await filterExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const exerciseOptions = await getExerciseOptions();
      setOptions(exerciseOptions);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await filterExercises(
        selectedCategory || undefined,
        selectedMuscleGroup || undefined,
        searchQuery || undefined
      );
      setFilteredExercises(filtered);
    } catch (error) {
      console.error('Error filtering exercises:', error);
      setFilteredExercises(exercises);
    }
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    setShowForm(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    setDeleteConfirm(exercise);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    // console.log('Deleting exercise:', deleteConfirm);
    try {
      const success = await deleteExercise(deleteConfirm.id);
      // console.log('Delete result:', success);
      if (success) {
        setExercises(prev => prev.filter(ex => ex.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        console.error('Delete operation returned false');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleFormSave = (savedExercise: Exercise) => {
    if (editingExercise) {
      // Update existing exercise
      setExercises(prev => prev.map(ex => 
        ex.id === savedExercise.id ? savedExercise : ex
      ));
    } else {
      // Add new exercise
      setExercises(prev => [savedExercise, ...prev]);
    }
    
    // Refresh options in case new categories/muscle groups were added
    loadOptions();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedMuscleGroup('');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedMuscleGroup;

  return (
    <div className="container-app space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-semibold mb-1" style={{ fontSize: '24px' }}>EXERCISE LIBRARY</h1>
          <p className="text-subheading" style={{ fontSize: '12px' }}>
            Manage your exercise database and create custom workouts
          </p>
        </div>
        {isAdminUser && (
          <button
            onClick={handleAddExercise}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 font-medium transition-colors flex items-center gap-2" style={{ borderRadius: '8px' }}
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="p-6 sticky top-6" style={{ backgroundColor: '#1B1B1B', borderRadius: '8px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading font-semibold flex items-center gap-2" style={{ fontSize: '16px' }}>
                <Filter className="w-5 h-5" />
                FILTERS
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-subheading mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exercises..."
                    className="w-full pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-subheading mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                >
                  <option value="">All Categories</option>
                  {options.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="muscle-group" className="block text-sm font-medium text-subheading mb-2">
                  Muscle Group
                </label>
                <select
                  id="muscle-group"
                  value={selectedMuscleGroup}
                  onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                  className="w-full px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                >
                  <option value="">All Muscle Groups</option>
                  {options.muscleGroups.map((muscleGroup) => (
                    <option key={muscleGroup} value={muscleGroup}>
                      {muscleGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 text-sm text-subheading">
                {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-subheading mx-auto mb-4" />
              <h3 className="text-heading font-medium mb-2" style={{ fontSize: '16px' }}>
                {hasActiveFilters ? 'No exercises match your filters' : 'No exercises found'}
              </h3>
              <p className="text-subheading mb-4" style={{ fontSize: '12px' }}>
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or clear the filters.'
                  : 'Get started by adding your first exercise to the library.'
                }
              </p>
              {!hasActiveFilters && isAdminUser && (
                <button
                  onClick={handleAddExercise}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 font-medium transition-colors inline-flex items-center gap-2" style={{ borderRadius: '8px' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Exercise
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onEdit={handleEditExercise}
                  onDelete={handleDeleteExercise}
                  isAdmin={isAdminUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Form Modal */}
      <ExerciseForm
        exercise={editingExercise}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6" style={{ backgroundColor: '#1B1B1B', borderRadius: '8px', border: '1px solid #404040' }}>
            <h3 className="text-heading font-semibold mb-4" style={{ fontSize: '16px' }}>Delete Exercise</h3>
            <p className="text-subheading mb-6" style={{ fontSize: '12px' }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-subheading hover:bg-gray-600 transition-colors" style={{ backgroundColor: '#232323', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors" style={{ borderRadius: '8px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
