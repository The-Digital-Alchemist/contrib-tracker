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

import { repoCache } from './repoCache';
import { rateLimiter } from './rateLimiter';

// DEVELOPMENT NOTES:
// ===================
// GitHub API Rate Limits:
// - Unauthenticated: 60 requests/hour
// - With token: 5,000 requests/hour
// - Search API: 30 requests/minute (authenticated)
//
// Optimization strategies implemented:
// - In-memory caching (5 min TTL)
// - Rate limiting with queue management
// - Smart batching for contributor friendly filters
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

      // Handle contributor-friendly filters with caching and rate limiting
      if (filters.contributorFriendly && filters.contributorFriendly !== 'all') {
        // Only process if we have reasonable rate limit remaining
        if (rateLimiter.canMakeRequest()) {
          const enhancedData = await this.enhanceWithContributorData(data, filters.contributorFriendly);
          return enhancedData;
        } else {
          console.warn('Skipping contributor-friendly filtering due to rate limit constraints');
        }
      }

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

    // Process repositories with caching and rate limiting
    for (const repo of repoData.items) {
      try {
        const [owner, repoName] = repo.full_name.split('/');
        const cacheKey = `contributor:${contributorFilter}:${repo.full_name}`;
        
        // Check cache first
        let includeRepo = repoCache.get<boolean>(cacheKey);
        
        if (includeRepo === null) {
          // Not in cache, check with API (if rate limit allows)
          if (!rateLimiter.canMakeRequest()) {
            console.warn(`Skipping ${repo.full_name} due to rate limit`);
            continue;
          }

          switch (contributorFilter) {
            case 'good-first-issues': {
              // Check if repository has good first issues
              const goodFirstIssues = await rateLimiter.enqueue(() => 
                this.fetchGoodFirstIssues(owner, repoName, 1)
              );
              includeRepo = goodFirstIssues.length > 0;
              break;
            }

            case 'highly-active': {
              // Use GitHub search API for recent commits (more efficient)
              const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              const commitsCacheKey = `commits:${repo.full_name}:${oneWeekAgo}`;
              
              let recentCommitCount = repoCache.get<number>(commitsCacheKey);
              if (recentCommitCount === null) {
                const recentCommits = await rateLimiter.enqueue(() => 
                  this.fetchRepoCommits(owner, repoName, oneWeekAgo, undefined, 10, 1)
                );
                recentCommitCount = recentCommits.length;
                repoCache.set(commitsCacheKey, recentCommitCount, 10 * 60 * 1000); // 10 minutes cache
              }
              
              includeRepo = recentCommitCount >= 3; // Lowered threshold for better results
              break;
            }

            case 'well-maintained': {
              // Simplified check using repo metadata (more efficient)
              // Look for repos with recent updates and reasonable activity
              const lastUpdated = new Date(repo.updated_at);
              const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              const hasRecentUpdate = lastUpdated >= thirtyDaysAgo;
              const hasMinimumStars = repo.stargazers_count >= 10;
              const hasMinimumForks = repo.forks_count >= 2;
              
              includeRepo = hasRecentUpdate && hasMinimumStars && hasMinimumForks;
              break;
            }
          }

          // Cache the result for 10 minutes
          repoCache.set(cacheKey, includeRepo, 10 * 60 * 1000);
        }

        if (includeRepo) {
          enhancedRepos.push(repo);
        }
      } catch (error) {
        // If we can't determine contributor-friendliness, exclude the repo to be safe
        console.warn(`Failed to check contributor data for ${repo.full_name}:`, error);
        continue;
      }
    }

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
    // Convenience method - use the search API for better results
    return this.fetchRepoIssues(owner, repo, 'open', ['good first issue'], 'created', 'desc', perPage);
  },

  // API for Personal Contribution Dashboard
  async fetchUserContributions(username: string): Promise<{
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    reposContributedTo: GitHubRepo[];
    recentActivity: GitHubCommit[];
  }> {
    try {
      // Search for the user's commits in Canonical org
      const commitsUrl = `${BASE_URL}/search/commits?q=author:${username}+org:canonical&sort=author-date&order=desc&per_page=100`;
      const commitsResponse = await rateLimiter.enqueue(() => fetch(commitsUrl, { headers }));
      
      if (!commitsResponse.ok) {
        throw new GitHubApiError(`Failed to fetch user commits: ${commitsResponse.statusText}`, commitsResponse.status);
      }
      
      const commitsData = await commitsResponse.json();
      const totalCommits = commitsData.total_count || 0;
      const recentActivity = commitsData.items?.slice(0, 10) || [];

      // Search for user's pull requests in Canonical org  
      const prsUrl = `${BASE_URL}/search/issues?q=author:${username}+org:canonical+type:pr&sort=created&order=desc&per_page=100`;
      const prsResponse = await rateLimiter.enqueue(() => fetch(prsUrl, { headers }));
      
      if (!prsResponse.ok) {
        throw new GitHubApiError(`Failed to fetch user PRs: ${prsResponse.statusText}`, prsResponse.status);
      }
      
      const prsData = await prsResponse.json();
      const totalPRs = prsData.total_count || 0;

      // Search for user's issues in Canonical org
      const issuesUrl = `${BASE_URL}/search/issues?q=author:${username}+org:canonical+type:issue&sort=created&order=desc&per_page=100`;
      const issuesResponse = await rateLimiter.enqueue(() => fetch(issuesUrl, { headers }));
      
      if (!issuesResponse.ok) {
        throw new GitHubApiError(`Failed to fetch user issues: ${issuesResponse.statusText}`, issuesResponse.status);
      }
      
      const issuesData = await issuesResponse.json();
      const totalIssues = issuesData.total_count || 0;

      // Get unique repositories user has contributed to
      const repoNames = new Set<string>();
      [...(prsData.items || []), ...(issuesData.items || [])].forEach((item: { repository_url: string }) => {
        repoNames.add(item.repository_url.split('/').slice(-2).join('/'));
      });

      const reposContributedTo: GitHubRepo[] = [];
      for (const repoName of Array.from(repoNames).slice(0, 10)) {
        try {
          const [owner, repo] = repoName.split('/');
          const repoData = await this.fetchRepoDetails(owner, repo);
          reposContributedTo.push(repoData);
        } catch (error) {
          console.warn(`Failed to fetch details for ${repoName}:`, error);
        }
      }

      return {
        totalCommits,
        totalPRs,
        totalIssues,
        reposContributedTo,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching user contributions:', error);
      throw error;
    }
  },

  async fetchUserRecommendations(username: string): Promise<{
    languageBasedIssues: GitHubIssue[];
    starredRepoIssues: GitHubIssue[];
    similarContributorRepos: GitHubRepo[];
  }> {
    try {
      // Get user's most used languages from their Canonical contributions
      const userContributions = await this.fetchUserContributions(username);
      const languageStats = new Map<string, number>();
      
      userContributions.reposContributedTo.forEach(repo => {
        if (repo.language) {
          languageStats.set(repo.language, (languageStats.get(repo.language) || 0) + 1);
        }
      });

      const topLanguages = Array.from(languageStats.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([lang]) => lang);

      // Find good first issues in user's preferred languages
      const languageBasedIssues: GitHubIssue[] = [];
      if (topLanguages.length > 0) {
        const langQuery = topLanguages.map(lang => `language:${lang}`).join(' OR ');
        const issuesUrl = `${BASE_URL}/search/issues?q=org:canonical+label:"good first issue"+state:open+(${langQuery})&sort=created&order=desc&per_page=10`;
        
        const response = await rateLimiter.enqueue(() => fetch(issuesUrl, { headers }));
        if (response.ok) {
          const data = await response.json();
          languageBasedIssues.push(...(data.items || []));
        }
      }

      // Get user's starred Canonical repos if they are publically available
      const starredUrl = `${BASE_URL}/users/${username}/starred?per_page=100`;
      const starredResponse = await rateLimiter.enqueue(() => fetch(starredUrl, { headers }));
      
      const starredRepoIssues: GitHubIssue[] = [];
      if (starredResponse.ok) {
        const starredRepos = await starredResponse.json();
        const canonicalStarred = starredRepos.filter((repo: { full_name: string }) => 
          repo.full_name.startsWith('canonical/')
        ).slice(0, 5);

        for (const repo of canonicalStarred) {
          try {
            const [owner, repoName] = repo.full_name.split('/');
            const issues = await this.fetchGoodFirstIssues(owner, repoName, 3);
            starredRepoIssues.push(...issues);
          } catch (error) {
            console.warn(`Failed to fetch issues for ${repo.full_name}:`, error);
          }
        }
      }

      // Find repos with similar contributors (simplified)
      const similarContributorRepos: GitHubRepo[] = [];
      if (userContributions.reposContributedTo.length > 0) {
        // Get a random sample of repos they haven't contributed to
        try {
          const canonicalRepos = await this.fetchCanonicalRepos(1, 20, '', 'updated', 'desc');
          const uncontributedRepos = canonicalRepos.items.filter(repo => 
            !userContributions.reposContributedTo.some(contributed => contributed.id === repo.id)
          );
          similarContributorRepos.push(...uncontributedRepos.slice(0, 5));
        } catch (error) {
          console.warn('Failed to fetch similar repos:', error);
        }
      }

      return {
        languageBasedIssues,
        starredRepoIssues,
        similarContributorRepos
      };
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      throw error;
    }
  },

  async fetchUserProfile(username: string): Promise<GitHubUser & {
    bio: string | null;
    blog: string | null;
    company: string | null;
    location: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  }> {
    try {
      const url = `${BASE_URL}/users/${username}`;
      const response = await rateLimiter.enqueue(() => fetch(url, { headers }));
      
      if (!response.ok) {
        throw new GitHubApiError(`Failed to fetch user profile: ${response.statusText}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
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