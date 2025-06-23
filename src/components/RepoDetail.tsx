import React, { useState, useEffect } from 'react';
import { githubApi } from '../services/githubApi';
import type { 
  GitHubRepo, 
  GitHubIssue, 
  GitHubPullRequest, 
  GitHubCommit, 
  GitHubContributor 
} from '../services/githubApi';
import Button from './Button';

interface RepoDetailProps {
  repo: GitHubRepo;
  onClose?: () => void;
}

interface RepoDetailState {
  goodFirstIssues: GitHubIssue[];
  recentIssues: GitHubIssue[];
  recentPRs: GitHubPullRequest[];
  recentCommits: GitHubCommit[];
  topContributors: GitHubContributor[];
  loading: {
    issues: boolean;
    prs: boolean;
    commits: boolean;
    contributors: boolean;
  };
  errors: {
    issues: string | null;
    prs: string | null;
    commits: string | null;
    contributors: string | null;
  };
}

const RepoDetail: React.FC<RepoDetailProps> = ({ repo, onClose }) => {
  const [state, setState] = useState<RepoDetailState>({
    goodFirstIssues: [],
    recentIssues: [],
    recentPRs: [],
    recentCommits: [],
    topContributors: [],
    loading: {
      issues: true,
      prs: true,
      commits: true,
      contributors: true,
    },
    errors: {
      issues: null,
      prs: null,
      commits: null,
      contributors: null,
    },
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'prs' | 'activity'>('overview');

  // Extract owner and repo name from full_name
  const [owner, repoName] = repo.full_name.split('/');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch good first issues
      try {
        const goodFirstIssues = await githubApi.fetchGoodFirstIssues(owner, repoName, 5);
        setState(prev => ({ 
          ...prev, 
          goodFirstIssues,
          loading: { ...prev.loading, issues: false }
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          errors: { ...prev.errors, issues: `Failed to fetch issues: ${error}` },
          loading: { ...prev.loading, issues: false }
        }));
      }

      // Fetch recent PRs
      try {
        const recentPRs = await githubApi.fetchRepoPullRequests(owner, repoName, 'open', 'created', 'desc', 5);
        setState(prev => ({ 
          ...prev, 
          recentPRs,
          loading: { ...prev.loading, prs: false }
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          errors: { ...prev.errors, prs: `Failed to fetch PRs: ${error}` },
          loading: { ...prev.loading, prs: false }
        }));
      }

      // Fetch recent commits
      try {
        const recentCommits = await githubApi.fetchRepoCommits(owner, repoName, undefined, undefined, 5);
        setState(prev => ({ 
          ...prev, 
          recentCommits,
          loading: { ...prev.loading, commits: false }
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          errors: { ...prev.errors, commits: `Failed to fetch commits: ${error}` },
          loading: { ...prev.loading, commits: false }
        }));
      }

      // Fetch top contributors
      try {
        const topContributors = await githubApi.fetchRepoContributors(owner, repoName, 6);
        setState(prev => ({ 
          ...prev, 
          topContributors,
          loading: { ...prev.loading, contributors: false }
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          errors: { ...prev.errors, contributors: `Failed to fetch contributors: ${error}` },
          loading: { ...prev.loading, contributors: false }
        }));
      }
    };

    fetchData();
  }, [owner, repoName]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{repo.name}</h1>
              <span className="text-sm text-gray-500">by {owner}</span>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>
            {repo.description && (
              <p className="text-gray-600 mb-4">{repo.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                ⭐ {formatNumber(repo.stargazers_count)} stars
              </span>
              <span className="flex items-center">
                🔀 {formatNumber(repo.forks_count)} forks
              </span>
              {repo.language && (
                <span className="flex items-center">
                  💻 {repo.language}
                </span>
              )}
              <span className="flex items-center">
                📅 Updated {formatDate(repo.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="px-6">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'issues', label: 'Good First Issues', icon: '🌟' },
              { key: 'prs', label: 'Pull Requests', icon: '🔀' },
              { key: 'activity', label: 'Recent Activity', icon: '📈' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">
                  {state.loading.issues ? '...' : state.goodFirstIssues.length}
                </div>
                <div className="text-sm text-green-600">Good First Issues</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {state.loading.prs ? '...' : state.recentPRs.length}
                </div>
                <div className="text-sm text-blue-600">Open PRs</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {state.loading.commits ? '...' : state.recentCommits.length}
                </div>
                <div className="text-sm text-purple-600">Recent Commits</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-800">
                  {state.loading.contributors ? '...' : state.topContributors.length}
                </div>
                <div className="text-sm text-indigo-600">Contributors</div>
              </div>
            </div>

            {/* Top Contributors Preview */}
            {state.topContributors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Contributors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {state.topContributors.slice(0, 6).map(contributor => (
                    <div key={contributor.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <img 
                        src={contributor.avatar_url} 
                        alt={contributor.login}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <a 
                          href={contributor.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                        >
                          {contributor.login}
                        </a>
                        <div className="text-xs text-gray-500">
                          {contributor.contributions} contributions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌟 Good First Issues - Perfect for New Contributors!
            </h3>
            
            {state.loading.issues ? (
              <div className="text-center py-8 text-gray-500">Loading good first issues...</div>
            ) : state.errors.issues ? (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {state.errors.issues}
              </div>
            ) : state.goodFirstIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <div>No "good first issue" labels found in this repository.</div>
                <div className="text-sm mt-2">This might be a great opportunity to suggest adding some!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {state.goodFirstIssues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a 
                          href={issue.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          #{issue.number}: {issue.title}
                        </a>
                        {issue.body && (
                          <p className="text-gray-600 mt-2 line-clamp-2">
                            {issue.body.slice(0, 200)}...
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            👤 {issue.user.login}
                          </span>
                          <span className="flex items-center">
                            💬 {issue.comments} comments
                          </span>
                          <span className="flex items-center">
                            📅 {formatDate(issue.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {issue.labels.map(label => (
                            <span 
                              key={label.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`,
                                border: `1px solid #${label.color}40`
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'prs' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔀 Recent Pull Requests
            </h3>
            
            {state.loading.prs ? (
              <div className="text-center py-8 text-gray-500">Loading pull requests...</div>
            ) : state.errors.prs ? (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {state.errors.prs}
              </div>
            ) : state.recentPRs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No open pull requests found.</div>
            ) : (
              <div className="space-y-4">
                {state.recentPRs.map(pr => (
                  <div key={pr.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a 
                          href={pr.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          #{pr.number}: {pr.title}
                        </a>
                        {pr.body && (
                          <p className="text-gray-600 mt-2 line-clamp-2">
                            {pr.body.slice(0, 200)}...
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            👤 {pr.user.login}
                          </span>
                          <span className="flex items-center">
                            +{pr.additions} -{pr.deletions}
                          </span>
                          <span className="flex items-center">
                            📁 {pr.changed_files} files
                          </span>
                          <span className="flex items-center">
                            📅 {formatDate(pr.created_at)}
                          </span>
                          {pr.draft && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Recent Activity
            </h3>
            
            {state.loading.commits ? (
              <div className="text-center py-8 text-gray-500">Loading recent activity...</div>
            ) : state.errors.commits ? (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {state.errors.commits}
              </div>
            ) : state.recentCommits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent commits found.</div>
            ) : (
              <div className="space-y-4">
                {state.recentCommits.map(commit => (
                  <div key={commit.sha} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      {commit.author && (
                        <img 
                          src={commit.author.avatar_url} 
                          alt={commit.author.login}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <a 
                          href={commit.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-base font-medium text-gray-900 hover:text-blue-600 block"
                        >
                          {commit.commit.message.split('\n')[0]}
                        </a>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            👤 {commit.author?.login || commit.commit.author.name}
                          </span>
                          <span className="flex items-center">
                            📅 {formatDate(commit.commit.author.date)}
                          </span>
                          <span className="flex items-center font-mono text-xs">
                            🔗 {commit.sha.slice(0, 7)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Floating GitHub Link */}
      <div className="fixed bottom-6 right-6 z-10">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
          </svg>
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default RepoDetail; 