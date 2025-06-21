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
    // Since server-side sorting is used, repos should be in the order returned by API
    expect(result.current.filteredRepos).toEqual(mockRepos);
    expect(result.current.totalCount).toBe(100);
    expect(result.current.filteredCount).toBe(2);
    expect(result.current.availableLanguages).toEqual(['JavaScript', 'TypeScript']);
    expect(result.current.error).toBeNull();
    expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, 2, '', 'updated', 'desc');
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
      expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, customLimit, '', 'updated', 'desc');
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

    it('should search repos via GitHub API', async () => {
      // Mock API response for search term
      const searchResults = [mockRepos[1]]; // Only snapcraft
      vi.mocked(githubApi.fetchCanonicalRepos).mockResolvedValue({
        items: searchResults,
        total_count: 1
      });

      const { result } = renderHook(() => useCanonicalRepos(10, { search: 'snap' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should call API with search term (after debounce)
      await waitFor(() => {
        expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, 10, 'snap', 'updated', 'desc');
      }, { timeout: 1000 });

      expect(result.current.repos).toEqual(searchResults);
      expect(result.current.filteredRepos).toEqual(searchResults);
      expect(result.current.totalCount).toBe(1);
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

    it('should sort repos by stars via GitHub API', async () => {
      // Mock API response sorted by stars
      const sortedByStars = [mockRepos[2], mockRepos[1], mockRepos[0]]; // juju, snapcraft, ubuntu-server
      vi.mocked(githubApi.fetchCanonicalRepos).mockResolvedValue({
        items: sortedByStars,
        total_count: 3
      });

      const { result } = renderHook(() => useCanonicalRepos(10, { sortBy: 'stars', sortOrder: 'desc' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should call API with stars sorting
      expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, 10, '', 'stars', 'desc');
      
      expect(result.current.filteredRepos).toEqual(sortedByStars);
    });

    it('should sort repos by name client-side', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { sortBy: 'name', sortOrder: 'asc' }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // API call should still use 'updated' since GitHub doesn't support name sorting
      expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, 10, '', 'updated', 'asc');
      
      // But client-side sorting should sort by name
      expect(result.current.filteredRepos[0].name).toBe('juju');
      expect(result.current.filteredRepos[1].name).toBe('snapcraft');
      expect(result.current.filteredRepos[2].name).toBe('ubuntu-server');
    });

    it('should combine server-side and client-side filters', async () => {
      const { result } = renderHook(() => useCanonicalRepos(10, { 
        language: 'Python', 
        sortBy: 'stars', 
        sortOrder: 'desc' 
      }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should call API with stars sorting
      expect(githubApi.fetchCanonicalRepos).toHaveBeenCalledWith(1, 10, '', 'stars', 'desc');
      
      // Client-side language filter should apply to all repos
      expect(result.current.filteredRepos).toHaveLength(2);
      expect(result.current.filteredRepos.every(repo => repo.language === 'Python')).toBe(true);
    });
  });
}); 