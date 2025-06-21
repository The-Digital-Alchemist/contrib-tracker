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
    expect(result.current.filteredRepos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filteredCount).toBe(0);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.availableLanguages).toEqual([]);
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
    // filteredRepos should be sorted by updated_at desc by default (repo2 first, then repo1)
    expect(result.current.filteredRepos).toEqual([mockRepos[1], mockRepos[0]]);
    expect(result.current.totalCount).toBe(100);
    expect(result.current.filteredCount).toBe(2);
    expect(result.current.availableLanguages).toEqual(['JavaScript', 'TypeScript']);
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

  describe('filtering functionality', () => {
    const mockRepos = [
      { 
        id: 1, 
        name: 'ubuntu-server', 
        full_name: 'canonical/ubuntu-server',
        description: 'Ubuntu Server packages',
        stargazers_count: 500,
        forks_count: 50,
        language: 'Python',
        updated_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/canonical/ubuntu-server'
      },
      { 
        id: 2, 
        name: 'snapcraft', 
        full_name: 'canonical/snapcraft',
        description: 'Tool for creating snaps',
        stargazers_count: 1000,
        forks_count: 100,
        language: 'Python',
        updated_at: '2024-02-01T00:00:00Z',
        html_url: 'https://github.com/canonical/snapcraft'
      },
      { 
        id: 3, 
        name: 'juju', 
        full_name: 'canonical/juju',
        description: 'Juju application deployment',
        stargazers_count: 2000,
        forks_count: 200,
        language: 'Go',
        updated_at: '2023-06-01T00:00:00Z',
        html_url: 'https://github.com/canonical/juju'
      }
    ];

    beforeEach(() => {
      vi.mocked(githubApi.fetchCanonicalRepos).mockResolvedValue({
        items: mockRepos,
        total_count: 3
      });
    });

    it('should filter repos by search term', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { search: 'snap' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredRepos).toHaveLength(1);
      expect(result.current.filteredRepos[0].name).toBe('snapcraft');
      expect(result.current.filteredCount).toBe(1);
    });

    it('should filter repos by language', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { language: 'Python' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredRepos).toHaveLength(2);
      expect(result.current.filteredRepos.every(repo => repo.language === 'Python')).toBe(true);
      expect(result.current.filteredCount).toBe(2);
    });

    it('should sort repos by stars in descending order', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { sortBy: 'stars', sortOrder: 'desc' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredRepos[0].stargazers_count).toBe(2000);
      expect(result.current.filteredRepos[1].stargazers_count).toBe(1000);
      expect(result.current.filteredRepos[2].stargazers_count).toBe(500);
    });

    it('should sort repos by name in ascending order', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { sortBy: 'name', sortOrder: 'asc' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredRepos[0].name).toBe('juju');
      expect(result.current.filteredRepos[1].name).toBe('snapcraft');
      expect(result.current.filteredRepos[2].name).toBe('ubuntu-server');
    });

    it('should combine multiple filters', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { 
        language: 'Python', 
        sortBy: 'stars', 
        sortOrder: 'desc' 
      }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.filteredRepos).toHaveLength(2);
      expect(result.current.filteredRepos[0].name).toBe('snapcraft'); // Higher stars
      expect(result.current.filteredRepos[1].name).toBe('ubuntu-server'); // Lower stars
      expect(result.current.filteredRepos.every(repo => repo.language === 'Python')).toBe(true);
    });
  });
}); 