import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanonicalRepos } from './useCanonicalRepos';
import { githubApi, GitHubApiError } from '../services/githubApi';

// Mock the GitHub API
vi.mock('../services/githubApi', () => ({
  githubApi: {
    fetchCanonicalRepos: vi.fn()
  },
  GitHubApiError: class GitHubApiError extends Error {
    constructor(message: string, public status?: number) {
      super(message);
      this.name = 'GitHubApiError';
    }
  }
}));

describe('useCanonicalRepos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useCanonicalRepos());
    
    expect(result.current.repos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should fetch repos successfully', async () => {
    const mockRepos = [
      { 
        id: 1, 
        name: 'repo1', 
        full_name: 'canonical/repo1',
        description: 'Test repo 1',
        stargazers_count: 100,
        forks_count: 10,
        language: 'JavaScript',
        updated_at: '2023-01-01T00:00:00Z',
        html_url: 'https://github.com/canonical/repo1'
      },
      { 
        id: 2, 
        name: 'repo2', 
        full_name: 'canonical/repo2',
        description: 'Test repo 2',
        stargazers_count: 200,
        forks_count: 20,
        language: 'TypeScript',
        updated_at: '2023-01-02T00:00:00Z',
        html_url: 'https://github.com/canonical/repo2'
      }
    ];
    
    const mockResponse = {
      items: mockRepos,
      total_count: 100
    };

    vi.mocked(githubApi.fetchCanonicalRepos).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCanonicalRepos(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repos).toEqual(mockRepos);
    expect(result.current.totalCount).toBe(100);
    expect(result.current.error).toBeNull();
    expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, 2);
  });

  it('should handle GitHubApiError', async () => {
    const mockError = new GitHubApiError('GitHub API rate limit exceeded', 403);
    vi.mocked(githubApi.fetchCanonicalRepos).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCanonicalRepos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.error).toBe('GitHub API rate limit exceeded');
  });

  it('should handle generic errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(githubApi.fetchCanonicalRepos).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCanonicalRepos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('should refetch data when refetch is called', async () => {
    const mockRepos = [{
      id: 1, 
      name: 'repo1', 
      full_name: 'canonical/repo1',
      description: 'Test repo',
      stargazers_count: 50,
      forks_count: 5,
      language: 'Python',
      updated_at: '2023-01-01T00:00:00Z',
      html_url: 'https://github.com/canonical/repo1'
    }];
    const mockResponse = { items: mockRepos, total_count: 50 };

    vi.mocked(githubApi.fetchCanonicalRepos).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCanonicalRepos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock call history
    vi.clearAllMocks();

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledTimes(1);
    });
  });

  it('should use custom limit parameter', async () => {
    const customLimit = 5;
    vi.mocked(githubApi.fetchCanonicalRepos).mockResolvedValue({
      items: [],
      total_count: 0
    });

    renderHook(() => useCanonicalRepos(customLimit));

    await waitFor(() => {
      expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, customLimit);
    });
  });
}); 