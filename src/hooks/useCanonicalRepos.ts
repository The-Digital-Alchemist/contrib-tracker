import { useState, useEffect } from 'react';
import { githubApi, GitHubApiError } from '../services/githubApi';
import type { GitHubRepo, GitHubAPIResponse } from '../services/githubApi';

interface UseCanonicalReposState {
  repos: GitHubRepo[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCanonicalRepos = (limit = 5): UseCanonicalReposState => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchRepos();
  }, [limit]);

  return {
    repos,
    totalCount,
    loading,
    error,
    refetch: fetchRepos,
  };
}; 