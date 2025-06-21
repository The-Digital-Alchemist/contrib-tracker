import { useState, useEffect, useMemo } from 'react';
import { githubApi, GitHubApiError } from '../services/githubApi';
import type { GitHubRepo, GitHubAPIResponse } from '../services/githubApi';

export interface FilterOptions {
  search: string;
  language: string;
  sortBy: 'stars' | 'updated' | 'name';
  sortOrder: 'asc' | 'desc';
  activityFilter: 'all' | 'active' | 'recent';
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

  const fetchRepos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: GitHubAPIResponse = await githubApi.fetchCanonicalRepos(1, limit);
      
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
  };

  // Filtering and sorting logic
  const filteredRepos = useMemo(() => {
    let filtered = [...repos];

    // Apply search filter
    if (currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm) ||
        repo.description?.toLowerCase().includes(searchTerm) ||
        repo.full_name.toLowerCase().includes(searchTerm)
      );
    }

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

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (currentFilters.sortBy) {
        case 'stars':
          comparison = a.stargazers_count - b.stargazers_count;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updated':
        default:
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }

      return currentFilters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [repos, currentFilters]);

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
  }, [limit]);

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