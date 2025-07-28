'use client';

import { useState } from 'react';
import { Filter, Users, TrendingUp, Clock } from 'lucide-react';

export type SortOption = 'recent' | 'popular' | 'trending';
export type FilterOption = 'all' | 'following' | 'my_workouts';

interface CommunityFiltersProps {
  sortBy: SortOption;
  filterBy: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
  onlineCount: number;
}

export default function CommunityFilters({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
  onlineCount
}: CommunityFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Recent', icon: Clock },
    { value: 'popular' as SortOption, label: 'Popular', icon: TrendingUp },
    { value: 'trending' as SortOption, label: 'Trending', icon: TrendingUp }
  ];

  const filterOptions = [
    { value: 'all' as FilterOption, label: 'All Posts' },
    { value: 'following' as FilterOption, label: 'Following' },
    { value: 'my_workouts' as FilterOption, label: 'My Workouts' }
  ];

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Online Users */}
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{onlineCount} online</span>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center space-x-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-8"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters || filterBy !== 'all'
                ? 'bg-primary text-dark-900'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {filterBy !== 'all' && (
              <div className="w-2 h-2 bg-current rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Show posts from:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filterBy === option.value
                      ? 'bg-primary text-dark-900'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filterBy !== 'all' || sortBy !== 'recent') && (
        <div className="mt-3 pt-3 border-t border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Active filters:</span>
              {sortBy !== 'recent' && (
                <span className="px-2 py-1 bg-dark-700 rounded">
                  {sortOptions.find(s => s.value === sortBy)?.label}
                </span>
              )}
              {filterBy !== 'all' && (
                <span className="px-2 py-1 bg-dark-700 rounded">
                  {filterOptions.find(f => f.value === filterBy)?.label}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                onSortChange('recent');
                onFilterChange('all');
                setShowFilters(false);
              }}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
