import { useState, useEffect, useCallback, useRef } from 'react';
import { githubApi, GitHubApiError } from '../services/githubApi';
import type { GitHubRateLimitResponse, GitHubRateLimit } from '../services/githubApi';

interface UseGitHubRateLimitState {
  rateLimits: GitHubRateLimitResponse | null;
  coreRateLimit: GitHubRateLimit | null;
  searchRateLimit: GitHubRateLimit | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  timeUntilReset: number | null; // seconds until reset
}

export const useGitHubRateLimit = (
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute default
): UseGitHubRateLimitState => {
  const [rateLimits, setRateLimits] = useState<GitHubRateLimitResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const fetchRateLimit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await githubApi.fetchRateLimit();
      setRateLimits(response);
      
      // Calculate time until reset for core rate limit
      if (response.rate.reset) {
        const resetTime = response.rate.reset * 1000; // Convert to milliseconds
        const now = Date.now();
        const secondsUntilReset = Math.max(0, Math.floor((resetTime - now) / 1000));
        setTimeUntilReset(secondsUntilReset);
      }
    } catch (err) {
      if (err instanceof GitHubApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch rate limit information');
      }
      console.error('Error fetching rate limits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    if (rateLimits?.rate.reset && timeUntilReset !== null && timeUntilReset > 0) {
      const timer = setTimeout(() => {
        setTimeUntilReset(prev => prev ? Math.max(0, prev - 1) : 0);
      }, 1000);
      
      timeoutRef.current = timer;
      return () => clearTimeout(timer);
    }
  }, [rateLimits, timeUntilReset]);

  // Auto-refresh functionality
  useEffect(() => {
    // Initial fetch
    fetchRateLimit();

    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchRateLimit, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchRateLimit, autoRefresh, refreshInterval]);

  // Derived values for easier access
  const coreRateLimit = rateLimits?.rate || null;
  const searchRateLimit = rateLimits?.resources.search || null;

  return {
    rateLimits,
    coreRateLimit,
    searchRateLimit,
    loading,
    error,
    refetch: fetchRateLimit,
    timeUntilReset,
  };
}; 