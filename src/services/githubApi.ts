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
  async fetchCanonicalRepos(page = 1, perPage = 30): Promise<GitHubAPIResponse> {
    try {
      const url = `${BASE_URL}/search/repositories?q=org:canonical&sort=updated&order=desc&page=${page}&per_page=${perPage}`;
      
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
  }
};

export type { GitHubRepo, GitHubAPIResponse };
export { GitHubApiError }; 