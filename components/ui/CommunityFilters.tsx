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
    <div className="p-4" style={{ backgroundColor: '#1B1B1B', border: '1px solid #404040', borderRadius: '8px' }}>
      <div className="flex items-center justify-between">
        {/* Online Users */}
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }}></div>
            <Users className="w-4 h-4" style={{ color: '#979797' }} />
            <span style={{ color: '#FFFFFF' }}>{onlineCount} online</span>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center space-x-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="px-3 py-2 text-sm text-white focus:outline-none appearance-none pr-8" style={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#FFFC74'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#404040'}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ backgroundColor: '#232323', color: '#FFFFFF' }}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4" style={{ color: '#979797' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-2 text-sm transition-colors" style={{
              backgroundColor: showFilters || filterBy !== 'all' ? '#FFFC74' : '#232323',
              color: showFilters || filterBy !== 'all' ? '#000000' : '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #404040'
            }}
            onMouseEnter={(e) => {
              if (!(showFilters || filterBy !== 'all')) {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }
            }}
            onMouseLeave={(e) => {
              if (!(showFilters || filterBy !== 'all')) {
                e.currentTarget.style.backgroundColor = '#232323';
              }
            }}
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
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #404040' }}>
          <div className="space-y-3">
            <h4 className="text-sm font-medium" style={{ color: '#979797' }}>Show posts from:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className="px-3 py-2 text-sm transition-colors" style={{
                    backgroundColor: filterBy === option.value ? '#FFFC74' : '#232323',
                    color: filterBy === option.value ? '#000000' : '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #404040'
                  }}
                  onMouseEnter={(e) => {
                    if (filterBy !== option.value) {
                      e.currentTarget.style.backgroundColor = '#2a2a2a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterBy !== option.value) {
                      e.currentTarget.style.backgroundColor = '#232323';
                    }
                  }}
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
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #404040' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs" style={{ color: '#979797' }}>
              <span>Active filters:</span>
              {sortBy !== 'recent' && (
                <span className="px-2 py-1" style={{ backgroundColor: '#232323', borderRadius: '4px', color: '#FFFFFF' }}>
                  {sortOptions.find(s => s.value === sortBy)?.label}
                </span>
              )}
              {filterBy !== 'all' && (
                <span className="px-2 py-1" style={{ backgroundColor: '#232323', borderRadius: '4px', color: '#FFFFFF' }}>
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
              className="text-xs transition-colors" style={{ color: '#FFFC74' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fef9c3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#FFFC74'}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
