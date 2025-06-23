import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RepoDetail from './RepoDetail';
import { githubApi } from '../services/githubApi';
import type { GitHubRepo, GitHubIssue, GitHubPullRequest, GitHubCommit, GitHubContributor } from '../services/githubApi';

// Mock the GitHub API
vi.mock('../services/githubApi', () => ({
  githubApi: {
    fetchGoodFirstIssues: vi.fn(),
    fetchRepoPullRequests: vi.fn(),
    fetchRepoCommits: vi.fn(),
    fetchRepoContributors: vi.fn(),
  },
}));

const mockRepo: GitHubRepo = {
  id: 123456789,
  name: 'snapcraft',
  full_name: 'canonical/snapcraft',
  description: 'The command line tool for crafting snaps, the universal Linux packages',
  stargazers_count: 1847,
  forks_count: 234,
  language: 'Python',
  updated_at: '2024-01-15T12:30:00Z',
  html_url: 'https://github.com/canonical/snapcraft'
};

const mockIssues: GitHubIssue[] = [
  {
    id: 1,
    number: 123,
    title: 'Add better error handling',
    body: 'We need to improve error handling in the application',
    html_url: 'https://github.com/canonical/snapcraft/issues/123',
    user: { id: 1, login: 'contributor1', avatar_url: 'https://github.com/contributor1.png', html_url: 'https://github.com/contributor1', type: 'User' },
    labels: [
      { id: 1, name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
      { id: 2, name: 'bug', color: 'd73a4a', description: 'Something is not working' }
    ],
    state: 'open',
    assignees: [],
    comments: 5,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    closed_at: null
  }
];

const mockPRs: GitHubPullRequest[] = [
  {
    id: 1,
    number: 456,
    title: 'Fix typo in documentation',
    body: 'Fixes a small typo in the README',
    html_url: 'https://github.com/canonical/snapcraft/pull/456',
    user: { id: 2, login: 'contributor2', avatar_url: 'https://github.com/contributor2.png', html_url: 'https://github.com/contributor2', type: 'User' },
    state: 'open',
    draft: false,
    labels: [],
    assignees: [],
    created_at: '2024-01-12T14:30:00Z',
    updated_at: '2024-01-12T14:30:00Z',
    closed_at: null,
    merged_at: null,
    additions: 2,
    deletions: 1,
    changed_files: 1
  }
];

const mockCommits: GitHubCommit[] = [
  {
    sha: 'abc123def456',
    html_url: 'https://github.com/canonical/snapcraft/commit/abc123def456',
    commit: {
      message: 'Improve error handling for network requests',
      author: {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-14T16:20:00Z'
      }
    },
    author: {
      id: 3,
      login: 'johndoe',
      avatar_url: 'https://github.com/johndoe.png',
      html_url: 'https://github.com/johndoe',
      type: 'User'
    }
  }
];

const mockContributors: GitHubContributor[] = [
  {
    id: 1,
    login: 'maintainer1',
    avatar_url: 'https://github.com/maintainer1.png',
    html_url: 'https://github.com/maintainer1',
    contributions: 245,
    type: 'User'
  },
  {
    id: 2,
    login: 'contributor1',
    avatar_url: 'https://github.com/contributor1.png',
    html_url: 'https://github.com/contributor1',
    contributions: 89,
    type: 'User'
  }
];

describe('RepoDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    vi.mocked(githubApi.fetchGoodFirstIssues).mockResolvedValue(mockIssues);
    vi.mocked(githubApi.fetchRepoPullRequests).mockResolvedValue(mockPRs);
    vi.mocked(githubApi.fetchRepoCommits).mockResolvedValue(mockCommits);
    vi.mocked(githubApi.fetchRepoContributors).mockResolvedValue(mockContributors);
  });

  it('renders repository header information correctly', () => {
    render(<RepoDetail repo={mockRepo} />);

    expect(screen.getByText('snapcraft')).toBeInTheDocument();
    expect(screen.getByText('by canonical')).toBeInTheDocument();
    expect(screen.getByText('The command line tool for crafting snaps, the universal Linux packages')).toBeInTheDocument();
    expect(screen.getByText(/1\.8k.*stars/)).toBeInTheDocument();
    expect(screen.getByText(/234.*forks/)).toBeInTheDocument();
    expect(screen.getByText(/💻.*Python/)).toBeInTheDocument();
    expect(screen.getByText(/Updated.*Jan.*15.*2024/)).toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    const mockOnClose = vi.fn();
    render(<RepoDetail repo={mockRepo} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('does not render close button when onClose is not provided', () => {
    render(<RepoDetail repo={mockRepo} />);
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  it('fetches and displays data on mount', async () => {
    render(<RepoDetail repo={mockRepo} />);

    // Wait for API calls to be made and data to load
    await waitFor(() => {
      expect(githubApi.fetchGoodFirstIssues).toHaveBeenCalledWith('canonical', 'snapcraft', 5);
      expect(githubApi.fetchRepoPullRequests).toHaveBeenCalledWith('canonical', 'snapcraft', 'open', 'created', 'desc', 5);
      expect(githubApi.fetchRepoCommits).toHaveBeenCalledWith('canonical', 'snapcraft', undefined, undefined, 5);
      expect(githubApi.fetchRepoContributors).toHaveBeenCalledWith('canonical', 'snapcraft', 6);
    });

    // Wait for data to load and check overview stats  
    await waitFor(() => {
      // Check that specific stats are displayed correctly
      expect(screen.getByText('Good First Issues')).toBeInTheDocument();
      expect(screen.getByText('Open PRs')).toBeInTheDocument();
      expect(screen.getByText('Recent Commits')).toBeInTheDocument();
      expect(screen.getByText('Contributors')).toBeInTheDocument();
    });
  });

  it('displays loading states correctly', () => {
    // Mock API calls to never resolve
    vi.mocked(githubApi.fetchGoodFirstIssues).mockImplementation(() => new Promise(() => {}));
    vi.mocked(githubApi.fetchRepoPullRequests).mockImplementation(() => new Promise(() => {}));
    vi.mocked(githubApi.fetchRepoCommits).mockImplementation(() => new Promise(() => {}));
    vi.mocked(githubApi.fetchRepoContributors).mockImplementation(() => new Promise(() => {}));

    render(<RepoDetail repo={mockRepo} />);

    // Check loading indicators in overview stats
    expect(screen.getAllByText('...')).toHaveLength(4);
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'API rate limit exceeded';
    vi.mocked(githubApi.fetchGoodFirstIssues).mockRejectedValue(new Error(errorMessage));
    vi.mocked(githubApi.fetchRepoPullRequests).mockRejectedValue(new Error(errorMessage));
    vi.mocked(githubApi.fetchRepoCommits).mockRejectedValue(new Error(errorMessage));
    vi.mocked(githubApi.fetchRepoContributors).mockRejectedValue(new Error(errorMessage));

    render(<RepoDetail repo={mockRepo} />);

    // Wait for errors to appear and switch to issues tab to see error message
    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(4); // Four zeros for failed counts
    });

    // Switch to issues tab to see error
    fireEvent.click(screen.getByText('🌟 Good First Issues'));
    await waitFor(() => {
      expect(screen.getByText(`Failed to fetch issues: Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('navigates between tabs correctly', async () => {
    render(<RepoDetail repo={mockRepo} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Top Contributors')).toBeInTheDocument();
    });

    // Test Issues tab
    fireEvent.click(screen.getByText('🌟 Good First Issues'));
    await waitFor(() => {
      expect(screen.getByText('🌟 Good First Issues - Perfect for New Contributors!')).toBeInTheDocument();
      expect(screen.getByText(/Add better error handling/)).toBeInTheDocument();
    });

    // Test Pull Requests tab
    fireEvent.click(screen.getByText('🔀 Pull Requests'));
    await waitFor(() => {
      expect(screen.getByText('🔀 Recent Pull Requests')).toBeInTheDocument();
      expect(screen.getByText(/Fix typo in documentation/)).toBeInTheDocument();
    });

    // Test Activity tab - use getAllByText and target the button specifically
    const activityButtons = screen.getAllByText('📈 Recent Activity');
    fireEvent.click(activityButtons[0]); // Click the tab button, not the header
    await waitFor(() => {
      expect(screen.getAllByText('📈 Recent Activity')).toHaveLength(2); // Button and header
      expect(screen.getByText('Improve error handling for network requests')).toBeInTheDocument();
    });

    // Return to Overview tab
    fireEvent.click(screen.getByText('📊 Overview'));
    await waitFor(() => {
      expect(screen.getByText('Top Contributors')).toBeInTheDocument();
    });
  });

  it('displays good first issues with proper styling', async () => {
    render(<RepoDetail repo={mockRepo} />);

    // Switch to issues tab
    fireEvent.click(screen.getByText('🌟 Good First Issues'));

    await waitFor(() => {
      expect(screen.getByText(/Add better error handling/)).toBeInTheDocument();
      expect(screen.getByText(/contributor1/)).toBeInTheDocument();
      expect(screen.getByText(/5.*comments/)).toBeInTheDocument(); // Check for comment count
      expect(screen.getByText(/Jan.*10.*2024/)).toBeInTheDocument();
      expect(screen.getByText('good first issue')).toBeInTheDocument();
      expect(screen.getByText('bug')).toBeInTheDocument();
    });
  });

  it('displays pull requests with change statistics', async () => {
    render(<RepoDetail repo={mockRepo} />);

    // Switch to PRs tab
    fireEvent.click(screen.getByText('🔀 Pull Requests'));

    await waitFor(() => {
      expect(screen.getByText(/Fix typo in documentation/)).toBeInTheDocument();
      expect(screen.getByText(/contributor2/)).toBeInTheDocument();
      expect(screen.getByText(/\+.*2/)).toBeInTheDocument(); // Check for additions
      expect(screen.getByText(/-.*1/)).toBeInTheDocument(); // Check for deletions  
      expect(screen.getByText(/Jan.*12.*2024/)).toBeInTheDocument();
    });
  });

  it('displays commit activity with author information', async () => {
    render(<RepoDetail repo={mockRepo} />);

    // Switch to activity tab
    fireEvent.click(screen.getByText('📈 Recent Activity'));

    await waitFor(() => {
      expect(screen.getByText(/Improve error handling/)).toBeInTheDocument();
      expect(screen.getByText(/johndoe/)).toBeInTheDocument();
      expect(screen.getByText(/Jan.*14.*2024/)).toBeInTheDocument();
      expect(screen.getByText(/abc123d/)).toBeInTheDocument();
    });
  });

  it('displays contributors in overview', async () => {
    render(<RepoDetail repo={mockRepo} />);

    await waitFor(() => {
      expect(screen.getByText('maintainer1')).toBeInTheDocument();
      expect(screen.getByText('245 contributions')).toBeInTheDocument();
      expect(screen.getByText('contributor1')).toBeInTheDocument();
      expect(screen.getByText('89 contributions')).toBeInTheDocument();
    });
  });

  it('formats large numbers correctly', () => {
    const repoWithLargeNumbers: GitHubRepo = {
      ...mockRepo,
      stargazers_count: 12500,
      forks_count: 3400
    };

    render(<RepoDetail repo={repoWithLargeNumbers} />);

    expect(screen.getByText(/12\.5k.*stars/)).toBeInTheDocument();
    expect(screen.getByText(/3\.4k.*forks/)).toBeInTheDocument();
  });

  it('handles empty states correctly', async () => {
    vi.mocked(githubApi.fetchGoodFirstIssues).mockResolvedValue([]);
    vi.mocked(githubApi.fetchRepoPullRequests).mockResolvedValue([]);
    vi.mocked(githubApi.fetchRepoCommits).mockResolvedValue([]);

    render(<RepoDetail repo={mockRepo} />);

    // Switch to issues tab and check empty state
    fireEvent.click(screen.getByText('🌟 Good First Issues'));
    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('No "good first issue" labels found in this repository.')).toBeInTheDocument();
    });

    // Switch to PRs tab and check empty state
    fireEvent.click(screen.getByText('🔀 Pull Requests'));
    await waitFor(() => {
      expect(screen.getByText('No open pull requests found.')).toBeInTheDocument();
    });

    // Switch to activity tab and check empty state
    fireEvent.click(screen.getByText('📈 Recent Activity'));
    await waitFor(() => {
      expect(screen.getByText('No recent commits found.')).toBeInTheDocument();
    });
  });

  it('displays repository information correctly', async () => {
    render(<RepoDetail repo={mockRepo} />);

    // Check that repository title and owner are displayed
    expect(screen.getByText('snapcraft')).toBeInTheDocument();
    expect(screen.getByText('by canonical')).toBeInTheDocument();
    
    // Check that description is shown
    expect(screen.getByText('The command line tool for crafting snaps, the universal Linux packages')).toBeInTheDocument();
  });

  it('displays floating GitHub link in bottom right', () => {
    render(<RepoDetail repo={mockRepo} />);

    const githubLink = screen.getByText('View on GitHub');
    expect(githubLink).toBeInTheDocument();

    const anchor = githubLink.closest('a');
    expect(anchor).toHaveAttribute('href', mockRepo.html_url);
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Check that the container div has the fixed positioning
    const container = anchor?.parentElement;
    expect(container).toHaveClass('fixed', 'bottom-6', 'right-6');
  });
}); 