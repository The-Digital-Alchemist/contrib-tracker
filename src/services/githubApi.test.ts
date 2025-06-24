import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubApi, GitHubApiError } from './githubApi';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('githubApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRepoIssues', () => {
    it('should fetch repository issues successfully', async () => {
      const mockIssues = [
        {
          id: 1,
          number: 123,
          title: 'Test issue',
          body: 'Test description',
          state: 'open',
          user: { id: 1, login: 'testuser', avatar_url: '', html_url: '', type: 'User' },
          labels: [],
          assignees: [],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          closed_at: null,
          html_url: 'https://github.com/test/repo/issues/123',
          comments: 0
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssues
      });

      const result = await githubApi.fetchRepoIssues('canonical', 'test-repo');

      expect(result).toEqual(mockIssues);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/repos/canonical/test-repo/issues'),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' })
      });

      await expect(githubApi.fetchRepoIssues('canonical', 'nonexistent')).rejects.toThrow(GitHubApiError);
    });
  });

  describe('fetchGoodFirstIssues', () => {
    it('should fetch good first issues with correct labels', async () => {
      const mockIssues = [
        {
          id: 1,
          number: 123,
          title: 'Good first issue',
          body: 'Easy to fix',
          state: 'open',
          user: { id: 1, login: 'testuser', avatar_url: '', html_url: '', type: 'User' },
          labels: [{ id: 1, name: 'good first issue', color: 'green', description: null }],
          assignees: [],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          closed_at: null,
          html_url: 'https://github.com/test/repo/issues/123',
          comments: 0
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssues
      });

      const result = await githubApi.fetchGoodFirstIssues('canonical', 'test-repo');

      expect(result).toEqual(mockIssues);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('labels=good+first+issue'),
        expect.any(Object)
      );
    });
  });

  describe('fetchRepoPullRequests', () => {
    it('should fetch repository pull requests successfully', async () => {
      const mockPRs = [
        {
          id: 1,
          number: 456,
          title: 'Test PR',
          body: 'Test PR description',
          state: 'open',
          user: { id: 1, login: 'testuser', avatar_url: '', html_url: '', type: 'User' },
          labels: [],
          assignees: [],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          closed_at: null,
          merged_at: null,
          html_url: 'https://github.com/test/repo/pull/456',
          draft: false,
          additions: 10,
          deletions: 5,
          changed_files: 2
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPRs
      });

      const result = await githubApi.fetchRepoPullRequests('canonical', 'test-repo');

      expect(result).toEqual(mockPRs);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/repos/canonical/test-repo/pulls'),
        expect.any(Object)
      );
    });
  });

  describe('fetchRepoCommits', () => {
    it('should fetch repository commits successfully', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            message: 'Test commit',
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z'
            }
          },
          author: { id: 1, login: 'testuser', avatar_url: '', html_url: '', type: 'User' },
          html_url: 'https://github.com/test/repo/commit/abc123'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommits
      });

      const result = await githubApi.fetchRepoCommits('canonical', 'test-repo');

      expect(result).toEqual(mockCommits);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/repos/canonical/test-repo/commits'),
        expect.any(Object)
      );
    });
  });

  describe('fetchRepoContributors', () => {
    it('should fetch repository contributors successfully', async () => {
      const mockContributors = [
        {
          id: 1,
          login: 'contributor1',
          avatar_url: 'https://avatars.githubusercontent.com/u/1',
          html_url: 'https://github.com/contributor1',
          contributions: 42,
          type: 'User'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContributors
      });

      const result = await githubApi.fetchRepoContributors('canonical', 'test-repo');

      expect(result).toEqual(mockContributors);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/repos/canonical/test-repo/contributors'),
        expect.any(Object)
      );
    });
  });

  describe('fetchCanonicalReposAdvanced', () => {
    const mockRepoResponse = {
      total_count: 1,
      items: [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'canonical/test-repo',
          description: 'A test repository',
          stargazers_count: 150,
          forks_count: 25,
          language: 'Python',
          updated_at: '2024-01-15T10:00:00Z',
          html_url: 'https://github.com/canonical/test-repo'
        }
      ]
    };

    it('should fetch repos with advanced filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoResponse
      });

      const result = await githubApi.fetchCanonicalReposAdvanced(1, 10, {
        search: 'python',
        language: 'Python',
        minStars: 100,
        repositorySize: 'medium',
        activityFilter: 'recent'
      });

      expect(result.total_count).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('test-repo');
      
      // Verify the search query includes advanced filters (URL-encoded)
      const fetchCall = mockFetch.mock.calls[0][0];
      expect(fetchCall).toContain('org%3Acanonical'); // org:canonical
      expect(fetchCall).toContain('python');
      expect(fetchCall).toContain('language%3APython'); // language:Python
      expect(fetchCall).toContain('stars%3A%3E%3D100'); // stars:>=100
      expect(fetchCall).toContain('stars%3A100..1000'); // stars:100..1000
      expect(fetchCall).toContain('pushed%3A%3E'); // pushed:>
    });

    it('should handle stale repository filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoResponse
      });

      await githubApi.fetchCanonicalReposAdvanced(1, 10, {
        activityFilter: 'stale'
      });

      const fetchCall = mockFetch.mock.calls[0][0];
      expect(fetchCall).toContain('pushed%3A%3C'); // pushed:<
    });

    it('should handle repository size filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoResponse
      });

      await githubApi.fetchCanonicalReposAdvanced(1, 10, {
        repositorySize: 'large'
      });

      const fetchCall = mockFetch.mock.calls[0][0];
      expect(fetchCall).toContain('stars%3A%3E1000'); // stars:>1000
    });

    it('should handle recent activity filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoResponse
      });

      await githubApi.fetchCanonicalReposAdvanced(1, 10, {
        hasRecentActivity: true
      });

      const fetchCall = mockFetch.mock.calls[0][0];
      expect(fetchCall).toContain('pushed%3A%3E'); // pushed:>
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Rate limit exceeded' })
      });

      await expect(githubApi.fetchCanonicalReposAdvanced(1, 10, {})).rejects.toThrow(GitHubApiError);
    });
  });
}); 