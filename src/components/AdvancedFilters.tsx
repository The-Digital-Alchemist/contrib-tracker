import React from 'react';
import type { FilterOptions } from '../hooks/useCanonicalRepos';
import LanguageFilter from './LanguageFilter';

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  availableLanguages: string[];
  disabled?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availableLanguages,
  disabled = false
}) => {
  const handleFilterChange = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ubuntu-grey-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ubuntu-cool-500">🎯 Advanced Filters</h3>
        <button
          onClick={() => onFiltersChange({
            search: '',
            language: '',
            sortBy: 'updated',
            sortOrder: 'desc',
            activityFilter: 'all',
            contributorFriendly: 'all',
            repositorySize: 'all',
            minStars: 0,
            hasRecentActivity: false
          })}
          className="text-sm text-ubuntu-grey-600 hover:text-ubuntu-orange-600 transition-colors"
          disabled={disabled}
        >
          Clear All
        </button>
      </div>

      {/* Search and Language Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-ubuntu-cool-600 mb-2">
            🔍 Search Repositories
          </label>
          <input
            id="search-input"
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name, description..."
            disabled={disabled}
            className="w-full px-4 py-2 border border-ubuntu-grey-300 rounded-lg focus:ring-2 focus:ring-ubuntu-orange-500 focus:border-ubuntu-orange-500 disabled:bg-ubuntu-grey-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ubuntu-cool-600 mb-2">
            💻 Programming Language
          </label>
          <LanguageFilter
            value={filters.language}
            onValueChange={(value) => handleFilterChange('language', value)}
            availableLanguages={availableLanguages}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Activity and Contributor-Friendly Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📈 Repository Activity
          </label>
          <select
            value={filters.activityFilter}
            onChange={(e) => handleFilterChange('activityFilter', e.target.value as FilterOptions['activityFilter'])}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="all">All Activity Levels</option>
            <option value="recent">🔥 Recently Updated (Last Month)</option>
            <option value="active">✅ Active (Last 6 Months)</option>
            <option value="stale">⚠️ Stale (Over 1 Year Old)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🤝 Contributor Friendly
          </label>
          <select
            value={filters.contributorFriendly}
            onChange={(e) => handleFilterChange('contributorFriendly', e.target.value as FilterOptions['contributorFriendly'])}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="all">All Repositories</option>
            <option value="good-first-issues">🌟 Has Good First Issues</option>
            <option value="highly-active">🚀 Highly Active</option>
            <option value="well-maintained">🛠️ Well Maintained</option>
          </select>
        </div>
      </div>

      {/* Repository Size and Stars Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📊 Repository Size
          </label>
          <select
            value={filters.repositorySize}
            onChange={(e) => handleFilterChange('repositorySize', e.target.value as FilterOptions['repositorySize'])}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="all">All Sizes</option>
            <option value="small">🐣 Small (&lt; 100 stars)</option>
            <option value="medium">🏠 Medium (100-1000 stars)</option>
            <option value="large">🏢 Large (1000+ stars)</option>
          </select>
        </div>

        <div>
          <label htmlFor="min-stars" className="block text-sm font-medium text-gray-700 mb-2">
            ⭐ Minimum Stars: {filters.minStars}
          </label>
          <input
            id="min-stars"
            type="range"
            min="0"
            max="1000"
            step="10"
            value={filters.minStars}
            onChange={(e) => handleFilterChange('minStars', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>500</span>
            <span>1000+</span>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ⚡ Quick Filters
        </label>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasRecentActivity}
              onChange={(e) => handleFilterChange('hasRecentActivity', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-sm text-gray-700">🕒 Updated This Week</span>
          </label>
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📋 Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterOptions['sortBy'])}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="updated">📅 Last Updated</option>
            <option value="stars">⭐ Stars</option>
            <option value="name">🔤 Name</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔄 Sort Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as FilterOptions['sortOrder'])}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="desc">📉 Descending (High to Low)</option>
            <option value="asc">📈 Ascending (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
            </span>
          )}
          {filters.language && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Language: {filters.language}
            </span>
          )}
          {filters.activityFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Activity: {filters.activityFilter}
            </span>
          )}
          {filters.contributorFriendly !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Contributor: {filters.contributorFriendly}
            </span>
          )}
          {filters.minStars > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Min Stars: {filters.minStars}+
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters; 