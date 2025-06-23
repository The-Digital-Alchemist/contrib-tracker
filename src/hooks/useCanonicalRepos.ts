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
  loading: boolean;
  error: string | null;
  availableLanguages: string[];
  refetch: () => Promise<void>;
}

export const useCanonicalRepos = (
  limit = 5, 
  filters?: Partial<FilterOptions>
): UseCanonicalReposState => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
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
      
      // Map our sort options to GitHub API sort options (GitHub doesn't support name sorting)
      const githubSortBy = currentFilters.sortBy === 'stars' ? 'stars' : 'updated';
      
      const response: GitHubAPIResponse = await githubApi.fetchCanonicalRepos(
        1, 
        limit, 
        debouncedSearch,
        githubSortBy,
        currentFilters.sortOrder,
        debouncedLanguage
      );
      
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
  }, [limit, debouncedSearch, debouncedLanguage, currentFilters.sortBy, currentFilters.sortOrder]);

  // Client-side filtering for advanced criteria (search, language, and basic sorting handled server-side)
  const filteredRepos = useMemo(() => {
    let filtered = [...repos];

    // Apply activity filter
    if (currentFilters.activityFilter !== 'all') {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      filtered = filtered.filter(repo => {
        const updatedAt = new Date(repo.updated_at);
        
        if (currentFilters.activityFilter === 'recent') {
          return updatedAt >= oneMonthAgo;
        } else if (currentFilters.activityFilter === 'active') {
          return updatedAt >= sixMonthsAgo;
        } else if (currentFilters.activityFilter === 'stale') {
          return updatedAt < oneYearAgo;
        }
        return true;
      });
    }

    // Apply minimum stars filter
    if (currentFilters.minStars > 0) {
      filtered = filtered.filter(repo => repo.stargazers_count >= currentFilters.minStars);
    }

    // Apply repository size filter (based on stars as a proxy for size/popularity)
    if (currentFilters.repositorySize !== 'all') {
      filtered = filtered.filter(repo => {
        const stars = repo.stargazers_count;
        if (currentFilters.repositorySize === 'small') {
          return stars < 100;
        } else if (currentFilters.repositorySize === 'medium') {
          return stars >= 100 && stars < 1000;
        } else if (currentFilters.repositorySize === 'large') {
          return stars >= 1000;
        }
        return true;
      });
    }

    // Apply recent activity filter
    if (currentFilters.hasRecentActivity) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(repo => new Date(repo.updated_at) >= oneWeekAgo);
    }

    // Note: contributorFriendly filter will require API calls to check for good first issues
    // This will be implemented as a separate async operation to avoid performance issues

    // Client-side name sorting for GitHub API compatibility
    if (currentFilters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return currentFilters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [
    repos, 
    currentFilters.activityFilter, 
    currentFilters.sortBy, 
    currentFilters.sortOrder,
    currentFilters.minStars,
    currentFilters.repositorySize,
    currentFilters.hasRecentActivity
  ]);

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
    fetchRepos();
  }, [fetchRepos]);

  return {
    repos,
    filteredRepos,
    totalCount,
    filteredCount: filteredRepos.length,
    loading,
    error,
    availableLanguages,
    refetch: fetchRepos,
  };
}; 