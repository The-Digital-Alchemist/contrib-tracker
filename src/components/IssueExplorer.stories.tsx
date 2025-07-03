import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { GitHubIssue, GitHubRepo } from '../services/githubApi';

// Mock data for issues
const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 1234,
    title: 'Add dark mode support to the UI',
    body: 'We need to implement dark mode support across all components. This should include proper color schemes and accessibility considerations.',
    state: 'open',
    html_url: 'https://github.com/canonical/snapcraft/issues/1234',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    closed_at: null,
    labels: [
      { id: 1, name: 'good first issue', color: '0e8a16', description: 'Good for newcomers' },
      { id: 2, name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
      { id: 3, name: 'ui/ux', color: 'd93f0b', description: 'User interface improvements' }
    ],
    user: {
      id: 12345,
      login: 'johndoe',
      avatar_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2QjcyOEQiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEwIDEwQzEyLjIwOTEgMTAgMTQgMTIuMjA5MSAxNCAxNEMxNCAxNS42NTY5IDEyLjY1NjkgMTcgMTEgMTdDOS4zNDMxNSAxNyA4IDE1LjY1NjkgOCAxNEM4IDEyLjIwOTEgOS43OTA5IDEwIDEyIDEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDhDMTEuMTA0NiA4IDEyIDguODk1NDMgMTIgMTBDMTIgMTEuMTA0NiAxMS4xMDQ2IDEyIDEwIDEyQzguODk1NDMgMTIgOCAxMS4xMDQ2IDggMTBDOCA4Ljg5NTQzIDguODk1NDMgOCAxMCA4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=',
      html_url: 'https://github.com/johndoe',
      type: 'User' as const
    },
    assignees: [
      {
        id: 67890,
        login: 'janedoe',
        avatar_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFOTM0N0YiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEwIDEwQzEyLjIwOTEgMTAgMTQgMTIuMjA5MSAxNCAxNEMxNCAxNS42NTY5IDEyLjY1NjkgMTcgMTEgMTdDOS4zNDMxNSAxNyA4IDE1LjY1NjkgOCAxNEM4IDEyLjIwOTEgOS43OTA5IDEwIDEyIDEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDhDMTEuMTA0NiA4IDEyIDguODk1NDMgMTIgMTBDMTIgMTEuMTA0NiAxMS4xMDQ2IDEyIDEwIDEyQzguODk1NDMgMTIgOCAxMS4xMDQ2IDggMTBDOCA4Ljg5NTQzIDguODk1NDMgOCAxMCA4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=',
        html_url: 'https://github.com/janedoe',
        type: 'User' as const
      }
    ],
    comments: 5
  }
];

// Mock repository data
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
  }
];

interface MockIssueExplorerData {
  issues: GitHubIssue[];
  repos: GitHubRepo[];
  isLoading: boolean;
  error: string | null;
}

// Create a Storybook-specific wrapper component
const IssueExplorerStorybook: React.FC<{ mockData?: MockIssueExplorerData }> = ({ mockData }) => {
  const {
    issues = mockIssues,
    isLoading = false,
    error = null
  } = mockData || {};

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-ubuntu-cool-600">
          <div className="animate-spin">⟳</div>
          <span>Loading issues...</span>
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
          Issue Explorer
        </h1>
        <p className="text-ubuntu-cool-600">
          Discover and contribute to Canonical projects
        </p>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-lg shadow-sm border border-ubuntu-grey-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-ubuntu-cool-900">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ubuntu-orange-600 transition-colors"
                    >
                      #{issue.number} {issue.title}
                    </a>
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    issue.state === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {issue.state}
                  </span>
                </div>

                <p className="text-ubuntu-cool-700 mb-3">
                  {issue.body}
                </p>

                <div className="flex items-center gap-4 text-sm text-ubuntu-cool-600">
                  <span>Opened by {issue.user.login}</span>
                  {issue.comments > 0 && (
                    <span>💬 {issue.comments} comments</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {issue.assignees.map((assignee) => (
                  <img
                    key={assignee.login}
                    src={assignee.avatar_url}
                    alt={assignee.login}
                    className="w-8 h-8 rounded-full"
                    title={assignee.login}
                  />
                ))}
              </div>
            </div>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `#${label.color}20`,
                      color: `#${label.color}`
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const meta = {
  title: 'Components/IssueExplorer',
  component: IssueExplorerStorybook,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The IssueExplorer component provides a comprehensive interface for discovering and filtering issues across Canonical repositories.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IssueExplorerStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with all issues
export const Default: Story = {
  args: {
    mockData: {
      issues: mockIssues,
      repos: mockRepos,
      isLoading: false,
      error: null
    }
  }
};

// Story for loading state
export const Loading: Story = {
  args: {
    mockData: {
      issues: [],
      repos: [],
      isLoading: true,
      error: null
    }
  }
};

// Story for error state
export const Error: Story = {
  args: {
    mockData: {
      issues: [],
      repos: [],
      isLoading: false,
      error: 'Failed to fetch issues. Please check your GitHub token and try again.'
    }
  }
}; 