import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import type { GitHubRepo, GitHubIssue, GitHubCommit } from '../services/githubApi';

// Mock data for personal dashboard
const mockRepos: GitHubRepo[] = [
  {
    id: 123456789,
    name: 'snapcraft',
    full_name: 'canonical/snapcraft',
    description: 'The command line tool for crafting snaps, the universal Linux packages',
    stargazers_count: 1847,
    forks_count: 234,
    language: 'Python',
    updated_at: '2024-01-15T12:30:00Z',
    html_url: 'https://github.com/canonical/snapcraft'
  },
  {
    id: 987654321,
    name: 'juju',
    full_name: 'canonical/juju',
    description: 'Juju is a multi-cloud application management system for simplifying operations',
    stargazers_count: 2145,
    forks_count: 456,
    language: 'Go',
    updated_at: '2024-01-20T09:15:00Z',
    html_url: 'https://github.com/canonical/juju'
  }
];

const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 1234,
    title: 'Add dark mode support to the UI',
    body: 'We need to implement dark mode support across all components.',
    state: 'open',
    html_url: 'https://github.com/canonical/snapcraft/issues/1234',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    closed_at: null,
    labels: [
      { id: 1, name: 'good first issue', color: '0e8a16', description: 'Good for newcomers' }
    ],
    user: {
      id: 12345,
      login: 'johndoe',
      avatar_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2QjcyOEQiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEwIDEwQzEyLjIwOTEgMTAgMTQgMTIuMjA5MSAxNCAxNEMxNCAxNS42NTY5IDEyLjY1NjkgMTcgMTEgMTdDOS4zNDMxNSAxNyA4IDE1LjY1NjkgOCAxNEM4IDEyLjIwOTEgOS43OTA5IDEwIDEyIDEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDhDMTEuMTA0NiA4IDEyIDguODk1NDMgMTIgMTBDMTIgMTEuMTA0NiAxMS4xMDQ2IDEyIDEwIDEyQzguODk1NDMgMTIgOCAxMS4xMDQ2IDggMTBDOCA4Ljg5NTQzIDguODk1NDMgOCAxMCA4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=',
      html_url: 'https://github.com/johndoe',
      type: 'User' as const
    },
    assignees: [],
    comments: 5
  }
];

const mockCommits: GitHubCommit[] = [
  {
    sha: 'abc123def456',
    commit: {
      message: 'feat: add dark mode support',
      author: {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-20T14:30:00Z'
      }
    },
    author: {
      id: 12345,
      login: 'johndoe',
      avatar_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2QjcyOEQiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEwIDEwQzEyLjIwOTEgMTAgMTQgMTIuMjA5MSAxNCAxNEMxNCAxNS42NTY5IDEyLjY1NjkgMTcgMTEgMTdDOS4zNDMxNSAxNyA4IDE1LjY1NjkgOCAxNEM4IDEyLjIwOTEgOS43OTA5IDEwIDEyIDEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDhDMTEuMTA0NiA4IDEyIDguODk1NDMgMTIgMTBDMTIgMTEuMTA0NiAxMS4xMDQ2IDEyIDEwIDEyQzguODk1NDMgMTIgOCAxMS4xMDQ2IDggMTBDOCA4Ljg5NTQzIDguODk1NDMgOCAxMCA4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=',
      html_url: 'https://github.com/johndoe',
      type: 'User' as const
    },
    html_url: 'https://github.com/canonical/snapcraft/commit/abc123def456'
  }
];

interface MockPersonalDashboardData {
  username: string;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  reposContributedTo: GitHubRepo[];
  recentActivity: GitHubCommit[];
  recommendedIssues: GitHubIssue[];
  isLoading: boolean;
  error: string | null;
}

// Create a Storybook-specific wrapper component
const PersonalDashboardStorybook: React.FC<{ mockData?: MockPersonalDashboardData }> = ({ mockData }) => {
  const {
    username = 'johndoe',
    totalCommits = 42,
    totalPRs = 15,
    totalIssues = 8,
    reposContributedTo = mockRepos,
    recentActivity = mockCommits,
    recommendedIssues = mockIssues,
    isLoading = false,
    error = null
  } = mockData || {};

  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-ubuntu-cool-600">
          <div className="animate-spin">⟳</div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-red-600">
          <span>🚨</span>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ubuntu-cool-900 mb-2">
          Personal Dashboard
        </h1>
        <p className="text-ubuntu-cool-600">
          Welcome back, {username}! Here's your contribution overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-ubuntu-grey-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ubuntu-cool-600">Total Commits</p>
              <p className="text-3xl font-bold text-ubuntu-cool-900">{totalCommits}</p>
            </div>
            <div className="text-2xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ubuntu-grey-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ubuntu-cool-600">Pull Requests</p>
              <p className="text-3xl font-bold text-ubuntu-cool-900">{totalPRs}</p>
            </div>
            <div className="text-2xl">🔀</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ubuntu-grey-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ubuntu-cool-600">Issues Created</p>
              <p className="text-3xl font-bold text-ubuntu-cool-900">{totalIssues}</p>
            </div>
            <div className="text-2xl">🐛</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-ubuntu-grey-200 mb-6">
        <div className="border-b border-ubuntu-grey-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'activity', label: 'Recent Activity', icon: '🕒' },
              { id: 'repos', label: 'Repositories', icon: '📁' },
              { id: 'recommendations', label: 'Recommendations', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-ubuntu-orange-500 text-ubuntu-orange-600'
                    : 'border-transparent text-ubuntu-cool-500 hover:text-ubuntu-cool-700 hover:border-ubuntu-grey-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-ubuntu-cool-900 mb-4">Contribution Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-ubuntu-grey-50 rounded-lg p-4">
                    <h4 className="font-medium text-ubuntu-cool-900 mb-2">Top Languages</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Python</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Go</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>JavaScript</span>
                        <span className="font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-ubuntu-grey-50 rounded-lg p-4">
                    <h4 className="font-medium text-ubuntu-cool-900 mb-2">This Month</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Commits</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PRs Merged</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issues Closed</span>
                        <span className="font-medium">5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-ubuntu-cool-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((commit) => (
                  <div key={commit.sha} className="flex items-start gap-4 p-4 bg-ubuntu-grey-50 rounded-lg">
                    <img
                      src={commit.author?.avatar_url}
                      alt={commit.author?.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-ubuntu-cool-900">
                        {commit.commit.message}
                      </p>
                      <p className="text-sm text-ubuntu-cool-600">
                        {commit.author?.login} • {formatDate(commit.commit.author.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repositories Tab */}
          {activeTab === 'repos' && (
            <div>
              <h3 className="text-lg font-semibold text-ubuntu-cool-900 mb-4">Repositories Contributed To</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reposContributedTo.map((repo) => (
                  <div key={repo.id} className="p-4 border border-ubuntu-grey-200 rounded-lg">
                    <h4 className="font-medium text-ubuntu-cool-900 mb-2">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-ubuntu-orange-600">
                        {repo.full_name}
                      </a>
                    </h4>
                    <p className="text-sm text-ubuntu-cool-600 mb-3">{repo.description}</p>
                    <div className="flex items-center gap-4 text-xs text-ubuntu-cool-500">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🔀 {repo.forks_count}</span>
                      <span>{repo.language}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div>
              <h3 className="text-lg font-semibold text-ubuntu-cool-900 mb-4">Recommended Issues</h3>
              <div className="space-y-4">
                {recommendedIssues.map((issue) => (
                  <div key={issue.id} className="p-4 border border-ubuntu-grey-200 rounded-lg">
                    <h4 className="font-medium text-ubuntu-cool-900 mb-2">
                      <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-ubuntu-orange-600">
                        #{issue.number} {issue.title}
                      </a>
                    </h4>
                    <p className="text-sm text-ubuntu-cool-600 mb-3">{issue.body}</p>
                    <div className="flex items-center gap-4 text-xs text-ubuntu-cool-500">
                      <span>📝 {issue.user.login}</span>
                      <span>💬 {issue.comments}</span>
                      {issue.labels.map((label) => (
                        <span
                          key={label.id}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            color: `#${label.color}`
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Components/PersonalDashboard',
  component: PersonalDashboardStorybook,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The PersonalDashboard component provides a comprehensive overview of a user\'s contributions to Canonical projects.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PersonalDashboardStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with user data
export const Default: Story = {
  args: {
    mockData: {
      username: 'johndoe',
      totalCommits: 42,
      totalPRs: 15,
      totalIssues: 8,
      reposContributedTo: mockRepos,
      recentActivity: mockCommits,
      recommendedIssues: mockIssues,
      isLoading: false,
      error: null
    }
  }
};

// Story for loading state
export const Loading: Story = {
  args: {
    mockData: {
      username: '',
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      reposContributedTo: [],
      recentActivity: [],
      recommendedIssues: [],
      isLoading: true,
      error: null
    }
  }
};

// Story for error state
export const Error: Story = {
  args: {
    mockData: {
      username: '',
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      reposContributedTo: [],
      recentActivity: [],
      recommendedIssues: [],
      isLoading: false,
      error: 'Failed to load user data. Please check your GitHub token and try again.'
    }
  }
};

// Story for new user
export const NewUser: Story = {
  args: {
    mockData: {
      username: 'newuser',
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      reposContributedTo: [],
      recentActivity: [],
      recommendedIssues: mockIssues,
      isLoading: false,
      error: null
    }
  }
}; 