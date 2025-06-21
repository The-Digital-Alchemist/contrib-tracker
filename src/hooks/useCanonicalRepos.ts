import { useState, useEffect, useMemo, useCallback } from 'react';
import { githubApi, GitHubApiError } from '../services/githubApi';
import type { GitHubRepo, GitHubAPIResponse } from '../services/githubApi';

export interface FilterOptions {
  search: string;
  language: string;
  sortBy: 'stars' | 'updated' | 'name';
  sortOrder: 'asc' | 'desc';
  activityFilter: 'all' | 'active' | 'recent';
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
    activityFilter: 'all'
  };

  const currentFilters = { ...defaultFilters, ...filters };
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(currentFilters.search, 500);

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
        currentFilters.sortOrder
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
  }, [limit, debouncedSearch, currentFilters.sortBy, currentFilters.sortOrder]);

  // Client-side filtering for language and activity (search and sorting handled server-side)
  const filteredRepos = useMemo(() => {
    let filtered = [...repos];

    // Apply language filter
    if (currentFilters.language) {
      filtered = filtered.filter(repo => 
        repo.language?.toLowerCase() === currentFilters.language.toLowerCase()
      );
    }

    // Apply activity filter
    if (currentFilters.activityFilter !== 'all') {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      filtered = filtered.filter(repo => {
        const updatedAt = new Date(repo.updated_at);
        
        if (currentFilters.activityFilter === 'recent') {
          return updatedAt >= oneMonthAgo;
        } else if (currentFilters.activityFilter === 'active') {
          return updatedAt >= sixMonthsAgo;
        }
        return true;
      });
    }

    // Note: Search and sorting are now handled server-side via GitHub API
    // Only client-side name sorting for GitHub API compatibility
    if (currentFilters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return currentFilters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [repos, currentFilters.language, currentFilters.activityFilter, currentFilters.sortBy, currentFilters.sortOrder]);

  // Get unique languages for filter dropdown
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