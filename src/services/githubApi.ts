interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
}

interface GitHubAPIResponse {
  total_count: number;
  items: GitHubRepo[];
}

// Repository deep dive types
interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Bot';
}

interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: GitHubUser;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  comments: number;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  user: GitHubUser;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  draft: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: GitHubUser | null;
  html_url: string;
}

interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: 'User' | 'Bot';
}

interface GitHubIssuesResponse {
  total_count?: number; // Only available when using search API
  items?: GitHubIssue[]; // Only available when using search API
}

// Rate limit types
interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

interface GitHubRateLimitResponse {
  resources: {
    core: GitHubRateLimit;
    search: GitHubRateLimit;
    graphql: GitHubRateLimit;
    integration_manifest: GitHubRateLimit;
    source_import: GitHubRateLimit;
    code_scanning_upload: GitHubRateLimit;
    actions_runner_registration: GitHubRateLimit;
    scim: GitHubRateLimit;
    dependency_snapshots: GitHubRateLimit;
  };
  rate: GitHubRateLimit; // Legacy - same as resources.core
}

class GitHubApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

// DEVELOPMENT NOTES:
// ===================
// GitHub API Rate Limits:
// - Unauthenticated: 60 requests/hour
// - With token: 5,000 requests/hour
// - Search API: 30 requests/minute (authenticated)
//
// To avoid rate limiting, add VITE_GITHUB_TOKEN to .env.local
// See .env.example for setup instructions

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const BASE_URL = 'https://api.github.com';

const headers: HeadersInit = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Canonical-Contribution-Tracker',
};

if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
} else {
  console.warn(
    '⚠️  No GitHub token found. API requests will be rate limited.\n' +
    'Add VITE_GITHUB_TOKEN to .env.local to increase rate limits.\n' +
    'See .env.example for instructions.'
  );
}

export const githubApi = {
  async fetchCanonicalRepos(
    page = 1, 
    perPage = 30, 
    searchQuery = '', 
    sortBy = 'updated', 
    sortOrder = 'desc',
    language = ''
  ): Promise<GitHubAPIResponse> {
    try {
      // Build the search query
      let query = 'org:canonical';
      
      // Add search term if provided
      if (searchQuery.trim()) {
        query += ` ${searchQuery.trim()}`;
      }
      
      // Add language filter if provided
      if (language.trim()) {
        query += ` language:${language.trim()}`;
      }
      
      // Build the URL with search parameters
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        order: sortOrder,
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      const url = `${BASE_URL}/search/repositories?${params}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubAPIResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repositories');
    }
  },

  async fetchCanonicalReposAdvanced(
    page = 1,
    perPage = 30,
    filters: {
      search?: string;
      language?: string;
      sortBy?: 'stars' | 'updated' | 'name';
      sortOrder?: 'asc' | 'desc';
      activityFilter?: 'all' | 'active' | 'recent' | 'stale';
      contributorFriendly?: 'all' | 'good-first-issues' | 'highly-active' | 'well-maintained';
      repositorySize?: 'all' | 'small' | 'medium' | 'large';
      minStars?: number;
      hasRecentActivity?: boolean;
    } = {}
  ): Promise<GitHubAPIResponse> {
    try {
      // Build the base search query
      let query = 'org:canonical';
      
      // Add search term if provided
      if (filters.search?.trim()) {
        query += ` ${filters.search.trim()}`;
      }
      
      // Add language filter if provided
      if (filters.language?.trim()) {
        query += ` language:${filters.language.trim()}`;
      }

      // Add star count filter if provided
      if (filters.minStars && filters.minStars > 0) {
        query += ` stars:>=${filters.minStars}`;
      }

      // Add repository size filter (based on stars)
      if (filters.repositorySize && filters.repositorySize !== 'all') {
        switch (filters.repositorySize) {
          case 'small':
            query += ' stars:<100';
            break;
          case 'medium':
            query += ' stars:100..1000';
            break;
          case 'large':
            query += ' stars:>1000';
            break;
        }
      }

      // Add activity-based filters
      const now = new Date();
      if (filters.activityFilter && filters.activityFilter !== 'all') {
        switch (filters.activityFilter) {
          case 'recent': {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            query += ` pushed:>${oneMonthAgo.toISOString().split('T')[0]}`;
            break;
          }
          case 'active': {
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            query += ` pushed:>${sixMonthsAgo.toISOString().split('T')[0]}`;
            break;
          }
          case 'stale': {
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            query += ` pushed:<${oneYearAgo.toISOString().split('T')[0]}`;
            break;
          }
        }
      }

      // Add recent activity filter
      if (filters.hasRecentActivity) {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query += ` pushed:>${oneWeekAgo.toISOString().split('T')[0]}`;
      }

      // Build the URL with search parameters
      const params = new URLSearchParams({
        q: query,
        sort: filters.sortBy || 'updated',
        order: filters.sortOrder || 'desc',
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      const url = `${BASE_URL}/search/repositories?${params}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubAPIResponse = await response.json();

      // Handle contributor-friendly filters that require additional API calls
      // TODO: Temporarily disabled due to rate limiting issues - will implement with caching
      // if (filters.contributorFriendly && filters.contributorFriendly !== 'all') {
      //   data = await this.enhanceWithContributorData(data, filters.contributorFriendly);
      // }

      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repositories with advanced filters');
    }
  },

  async enhanceWithContributorData(
    repoData: GitHubAPIResponse,
    contributorFilter: 'good-first-issues' | 'highly-active' | 'well-maintained'
  ): Promise<GitHubAPIResponse> {
    const enhancedRepos: GitHubRepo[] = [];

    // Process repositories in parallel with rate limiting
    const promises = repoData.items.map(async (repo) => {
      try {
        const [owner, repoName] = repo.full_name.split('/');
        let includeRepo = false;

        switch (contributorFilter) {
          case 'good-first-issues': {
            // Check if repository has good first issues
            const goodFirstIssues = await this.fetchGoodFirstIssues(owner, repoName, 1);
            includeRepo = goodFirstIssues.length > 0;
            break;
          }

          case 'highly-active': {
            // Check recent commit activity
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const recentCommits = await this.fetchRepoCommits(owner, repoName, oneWeekAgo, undefined, 10, 1);
            includeRepo = recentCommits.length >= 5; // 5+ commits in last week
            break;
          }

          case 'well-maintained': {
            // Check if repository has recent issues/PR activity and multiple contributors
            const [recentIssues, contributors] = await Promise.all([
              this.fetchRepoIssues(owner, repoName, 'all', undefined, 'updated', 'desc', 5, 1),
              this.fetchRepoContributors(owner, repoName, 10, 1)
            ]);

            const hasRecentActivity = recentIssues.some(issue => {
              const updatedAt = new Date(issue.updated_at);
              const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              return updatedAt >= thirtyDaysAgo;
            });

            includeRepo = hasRecentActivity && contributors.length >= 3; // Recent activity + multiple contributors
            break;
          }
        }

        return includeRepo ? repo : null;
      } catch (error) {
        // If we can't determine contributor-friendliness, exclude the repo to be safe
        console.warn(`Failed to check contributor data for ${repo.full_name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    enhancedRepos.push(...results.filter(repo => repo !== null) as GitHubRepo[]);

    return {
      total_count: enhancedRepos.length,
      items: enhancedRepos
    };
  },

  async fetchRepoDetails(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const url = `${BASE_URL}/repos/${owner}/${repo}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubRepo = await response.json();
      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repository details');
    }
  },

  async fetchRateLimit(): Promise<GitHubRateLimitResponse> {
    try {
      const url = `${BASE_URL}/rate_limit`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubRateLimitResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch rate limit information');
    }
  },

  async fetchRepoIssues(
    owner: string, 
    repo: string, 
    state: 'open' | 'closed' | 'all' = 'open',
    labels?: string[], // e.g., ['good first issue', 'help wanted']
    sort: 'created' | 'updated' | 'comments' = 'created',
    direction: 'asc' | 'desc' = 'desc',
    perPage = 30,
    page = 1
  ): Promise<GitHubIssue[]> {
    try {
      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: perPage.toString(),
        page: page.toString()
      });

      if (labels && labels.length > 0) {
        params.append('labels', labels.join(','));
      }

      const url = `${BASE_URL}/repos/${owner}/${repo}/issues?${params}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubIssue[] = await response.json();
      // Filter out pull requests (GitHub API includes PRs in issues endpoint)
      return data.filter(issue => !('pull_request' in issue));
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repository issues');
    }
  },

  async fetchRepoPullRequests(
    owner: string, 
    repo: string, 
    state: 'open' | 'closed' | 'all' = 'open',
    sort: 'created' | 'updated' | 'popularity' | 'long-running' = 'created',
    direction: 'asc' | 'desc' = 'desc',
    perPage = 30,
    page = 1
  ): Promise<GitHubPullRequest[]> {
    try {
      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: perPage.toString(),
        page: page.toString()
      });

      const url = `${BASE_URL}/repos/${owner}/${repo}/pulls?${params}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubPullRequest[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repository pull requests');
    }
  },

  async fetchRepoCommits(
    owner: string, 
    repo: string, 
    since?: string, // ISO 8601 date string
    until?: string, // ISO 8601 date string
    perPage = 30,
    page = 1
  ): Promise<GitHubCommit[]> {
    try {
      const params = new URLSearchParams({
        per_page: perPage.toString(),
        page: page.toString()
      });

      if (since) {
        params.append('since', since);
      }
      if (until) {
        params.append('until', until);
      }

      const url = `${BASE_URL}/repos/${owner}/${repo}/commits?${params}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubCommit[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repository commits');
    }
  },

  async fetchRepoContributors(
    owner: string, 
    repo: string, 
    perPage = 30,
    page = 1
  ): Promise<GitHubContributor[]> {
    try {
      const params = new URLSearchParams({
        per_page: perPage.toString(),
        page: page.toString()
      });

      const url = `${BASE_URL}/repos/${owner}/${repo}/contributors?${params}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GitHubApiError(
          errorData.message || `GitHub API error: ${response.status}`,
          response.status
        );
      }

      const data: GitHubContributor[] = await response.json();
      return data;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError('Failed to fetch repository contributors');
    }
  },

  // Convenience method to fetch "good first issues" specifically
  async fetchGoodFirstIssues(
    owner: string, 
    repo: string, 
    perPage = 10
  ): Promise<GitHubIssue[]> {
    return this.fetchRepoIssues(
      owner, 
      repo, 
      'open', 
      ['good first issue'], 
      'created', 
      'desc', 
      perPage
    );
  }
};

export type { 
  GitHubRepo, 
  GitHubAPIResponse, 
  GitHubRateLimit, 
  GitHubRateLimitResponse,
  GitHubUser,
  GitHubLabel,
  GitHubIssue,
  GitHubPullRequest,
  GitHubCommit,
  GitHubContributor,
  GitHubIssuesResponse
};
export { GitHubApiError }; 