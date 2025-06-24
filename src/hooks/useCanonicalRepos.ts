import { useState, useEffect, useMemo, useCallback } from 'react';
import { githubApi, GitHubApiError } from '../services/githubApi';
import type { GitHubRepo, GitHubAPIResponse } from '../services/githubApi';

export interface FilterOptions {
  search: string;
  language: string;
  sortBy: 'stars' | 'updated' | 'name';
  sortOrder: 'asc' | 'desc';
  activityFilter: 'all' | 'active' | 'recent' | 'stale';
  contributorFriendly: 'all' | 'good-first-issues' | 'highly-active' | 'well-maintained';
  repositorySize: 'all' | 'small' | 'medium' | 'large';
  minStars: number;
  hasRecentActivity: boolean;
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseCanonicalReposState {
  repos: GitHubRepo[];
  filteredRepos: GitHubRepo[];
  totalCount: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  availableLanguages: string[];
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const useCanonicalRepos = (
  limit = 30, 
  filters?: Partial<FilterOptions>
): UseCanonicalReposState => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default filter options
  const defaultFilters: FilterOptions = {
    search: '',
    language: '',
    sortBy: 'updated',
    sortOrder: 'desc',
    activityFilter: 'all',
    contributorFriendly: 'all',
    repositorySize: 'all',
    minStars: 0,
    hasRecentActivity: false
  };

  const currentFilters = { ...defaultFilters, ...filters };
  
  // Debounce search and language to avoid too many API calls
  const debouncedSearch = useDebounce(currentFilters.search, 500);
  const debouncedLanguage = useDebounce(currentFilters.language, 300);

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we need advanced filtering (any non-default values)
      const needsAdvancedFiltering = 
        currentFilters.activityFilter !== 'all' ||
        currentFilters.contributorFriendly !== 'all' ||
        currentFilters.repositorySize !== 'all' ||
        currentFilters.minStars > 0 ||
        currentFilters.hasRecentActivity;

      let response: GitHubAPIResponse;

      if (needsAdvancedFiltering) {
        // Use advanced filtering API
        response = await githubApi.fetchCanonicalReposAdvanced(currentPage, limit, {
          search: debouncedSearch,
          language: debouncedLanguage,
          sortBy: currentFilters.sortBy === 'stars' ? 'stars' : 'updated',
          sortOrder: currentFilters.sortOrder,
          activityFilter: currentFilters.activityFilter,
          contributorFriendly: currentFilters.contributorFriendly,
          repositorySize: currentFilters.repositorySize,
          minStars: currentFilters.minStars,
          hasRecentActivity: currentFilters.hasRecentActivity
        });
      } else {
        // Use simple filtering API for better performance
        const githubSortBy = currentFilters.sortBy === 'stars' ? 'stars' : 'updated';
        response = await githubApi.fetchCanonicalRepos(
          currentPage, 
          limit, 
          debouncedSearch,
          githubSortBy,
          currentFilters.sortOrder,
          debouncedLanguage
        );
      }
      
      setRepos(response.items);
      setTotalCount(response.total_count);
    } catch (err) {
      if (err instanceof GitHubApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error fetching Canonical repos:', err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit, 
    debouncedSearch, 
    debouncedLanguage, 
    currentFilters.sortBy, 
    currentFilters.sortOrder,
    currentFilters.activityFilter,
    currentFilters.contributorFriendly,
    currentFilters.repositorySize,
    currentFilters.minStars,
    currentFilters.hasRecentActivity
  ]);

  // Minimal client-side filtering for name sorting only (GitHub API doesn't support name sorting)
  const filteredRepos = useMemo(() => {
    const filtered = [...repos];

    // Client-side name sorting for GitHub API compatibility
    if (currentFilters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return currentFilters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [repos, currentFilters.sortBy, currentFilters.sortOrder]);

  // Get unique languages for filter dropdown
  // Note: Since language filtering is now server-side, we get languages from current results
  // This means available languages will change based on search results, which is actually better UX
  const availableLanguages = useMemo(() => {
    const languages = repos
      .map(repo => repo.language)
      .filter((lang): lang is string => lang !== null)
      .filter((lang, index, arr) => arr.indexOf(lang) === index)
      .sort();
    return languages;
  }, [repos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, debouncedLanguage, currentFilters.sortBy, currentFilters.sortOrder, currentFilters.activityFilter, currentFilters.contributorFriendly, currentFilters.repositorySize, currentFilters.minStars, currentFilters.hasRecentActivity]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  return {
    repos,
    filteredRepos,
    totalCount,
    filteredCount: filteredRepos.length,
    currentPage,
    totalPages,
    loading,
    error,
    availableLanguages,
    refetch: fetchRepos,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  };
}; 