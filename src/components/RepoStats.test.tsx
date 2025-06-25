import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RepoStats from './RepoStats';
import { useCanonicalRepos } from '../hooks/useCanonicalRepos';
import type { GitHubRepo } from '../services/githubApi';
import { githubApi } from '../services/githubApi';

// Mock the useCanonicalRepos hook
vi.mock('../hooks/useCanonicalRepos', () => ({
  useCanonicalRepos: vi.fn(),
}));

// Mock the GitHub API
vi.mock('../services/githubApi', () => ({
  githubApi: {
    fetchGoodFirstIssues: vi.fn(),
    fetchRepoPullRequests: vi.fn(),
    fetchRepoCommits: vi.fn(),
    fetchRepoContributors: vi.fn(),
  },
}));

const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'snapcraft',
    full_name: 'canonical/snapcraft',
    description: 'The command line tool for crafting snaps',
    stargazers_count: 1500,
    forks_count: 200,
    language: 'Python',
    updated_at: '2024-01-15T12:00:00Z',
    html_url: 'https://github.com/canonical/snapcraft'
  },
  {
    id: 2,
    name: 'juju',
    full_name: 'canonical/juju',
    description: 'Juju is a multi-cloud application management system',
    stargazers_count: 2300,
    forks_count: 350,
    language: 'Go',
    updated_at: '2024-01-10T10:00:00Z',
    html_url: 'https://github.com/canonical/juju'
  }
];

const mockHookData = {
  repos: mockRepos,
  filteredRepos: mockRepos,
  totalCount: 100,
  filteredCount: 2,
  currentPage: 1,
  totalPages: 4,
  loading: false,
  error: null,
  availableLanguages: ['Python', 'Go', 'TypeScript'],
  refetch: vi.fn(),
  goToPage: vi.fn(),
  nextPage: vi.fn(),
  prevPage: vi.fn(),
  hasNextPage: true,
  hasPrevPage: false,
};

describe('RepoStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup GitHub API mocks
    vi.mocked(githubApi.fetchGoodFirstIssues).mockResolvedValue([]);
    vi.mocked(githubApi.fetchRepoPullRequests).mockResolvedValue([]);
    vi.mocked(githubApi.fetchRepoCommits).mockResolvedValue([]);
    vi.mocked(githubApi.fetchRepoContributors).mockResolvedValue([]);
    
    // Setup default hook return
    vi.mocked(useCanonicalRepos).mockReturnValue(mockHookData);
  });

  it('renders repository statistics correctly', () => {
    render(<RepoStats />);

    // Check title
    expect(screen.getByText('Canonical Repositories')).toBeInTheDocument();
    expect(screen.getByText('2 of 100 repos')).toBeInTheDocument();

    // Check individual repositories
    expect(screen.getByText('snapcraft')).toBeInTheDocument();
    expect(screen.getByText('The command line tool for crafting snaps')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument(); // Stars count
    expect(screen.getByText('Python')).toBeInTheDocument();

    expect(screen.getByText('juju')).toBeInTheDocument();
    expect(screen.getByText('Juju is a multi-cloud application management system')).toBeInTheDocument();
    expect(screen.getByText('2,300')).toBeInTheDocument(); // Stars count
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useCanonicalRepos).mockReturnValue({
      ...mockHookData,
      loading: true,
      filteredRepos: [],
    });

    render(<RepoStats />);

    expect(screen.getByText('Canonical Repositories')).toBeInTheDocument();
    // Check for loading skeleton cards
    expect(screen.getAllByText('').filter(el => 
      el.className.includes('animate-pulse')
    )).toHaveLength(10);
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to fetch repositories';
    vi.mocked(useCanonicalRepos).mockReturnValue({
      ...mockHookData,
      error: errorMessage,
      filteredRepos: [],
    });

    render(<RepoStats />);

    expect(screen.getByText('Canonical Repositories')).toBeInTheDocument();
    expect(screen.getByText('Unable to load repositories')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('handles retry functionality', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useCanonicalRepos).mockReturnValue({
      ...mockHookData,
      error: 'Network error',
      filteredRepos: [],
      refetch: mockRefetch,
    });

    render(<RepoStats />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it('applies filters correctly', () => {
    const filters = {
      language: 'Python',
      minStars: 1000,
      sort: 'stars' as const,
    };

    render(<RepoStats filters={filters} />);

    expect(vi.mocked(useCanonicalRepos)).toHaveBeenCalledWith(30, filters);
  });

  it('shows empty state when no repositories match filters', () => {
    vi.mocked(useCanonicalRepos).mockReturnValue({
      ...mockHookData,
      filteredRepos: [],
      filteredCount: 0,
    });

    render(<RepoStats />);

    expect(screen.getByText('Canonical Repositories')).toBeInTheDocument();
    expect(screen.getByText('0 of 100 repos')).toBeInTheDocument();
    // When filteredRepos is empty, the grid will be empty (no error message shown)
  });

  it('displays repository cards as clickable', () => {
    render(<RepoStats />);

    // Find the outer repository card divs
    const allDivs = Array.from(document.querySelectorAll('div'));
    const clickableCards = allDivs.filter(div => 
      div.className.includes('cursor-pointer') && div.className.includes('bg-ubuntu-grey-50')
    );

    expect(clickableCards).toHaveLength(2); // One for each repo
  });

  it('opens repository detail view when card is clicked', async () => {
    render(<RepoStats />);

    // Find and click the first repository card
    const snapcraftCard = screen.getByText('snapcraft').closest('div');
    expect(snapcraftCard).toBeInTheDocument();
    
    fireEvent.click(snapcraftCard!);

    // Should now show the RepoDetail component
    await waitFor(() => {
      expect(screen.getByText('📊 Overview')).toBeInTheDocument(); // RepoDetail tab
      expect(screen.getByText('🌟 Good First Issues')).toBeInTheDocument();
      expect(screen.getByText('🔀 Pull Requests')).toBeInTheDocument();
      expect(screen.getByText('📈 Recent Activity')).toBeInTheDocument();
    });

    // The original repository list should be hidden
    expect(screen.queryByText('Canonical Repositories')).not.toBeInTheDocument();
  });

  it('returns to repository list when close button is clicked in detail view', async () => {
    render(<RepoStats />);

    // Click on a repository to open detail view
    const snapcraftCard = screen.getByText('snapcraft').closest('div');
    fireEvent.click(snapcraftCard!);

    // Wait for detail view to open
    await waitFor(() => {
      expect(screen.getByText('📊 Overview')).toBeInTheDocument();
    });

    // Find and click the close button (✕)
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    // Should return to repository list
    await waitFor(() => {
      expect(screen.getByText('Canonical Repositories')).toBeInTheDocument();
      expect(screen.queryByText('📊 Overview')).not.toBeInTheDocument();
    });
  });

  it('shows visual indicator for clickable repository cards', () => {
    render(<RepoStats />);

    // Find the actual repository card elements
    const allDivs = Array.from(document.querySelectorAll('div'));
    const repoCards = allDivs.filter(div => 
      div.className.includes('cursor-pointer') && div.className.includes('bg-ubuntu-grey-50')
    );

    expect(repoCards).toHaveLength(2);
    repoCards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('hover:border-ubuntu-orange-300');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  it('formats large numbers correctly', () => {
    const repoWithLargeNumbers: GitHubRepo = {
      ...mockRepos[0],
      stargazers_count: 15000,
      forks_count: 3500,
    };

    vi.mocked(useCanonicalRepos).mockReturnValue({
      ...mockHookData,
      filteredRepos: [repoWithLargeNumbers],
      filteredCount: 1,
    });

    render(<RepoStats />);

    expect(screen.getByText('15,000')).toBeInTheDocument(); // Stars are displayed with toLocaleString
  });

  it('handles repositories without language', () => {
    const repoWithoutLanguage: GitHubRepo = {
      ...mockRepos[0],
      language: null,
    };

    vi.mocked(useCanonicalRepos).mockReturnValue({
      ...mockHookData,
      filteredRepos: [repoWithoutLanguage],
      filteredCount: 1,
    });

    render(<RepoStats />);

    // Should still render without errors
    expect(screen.getByText('snapcraft')).toBeInTheDocument();
    // Language badge should not be present
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('displays "GitHub" links in bottom right of cards', () => {
    render(<RepoStats />);

    const githubLinks = screen.getAllByText('GitHub');
    expect(githubLinks).toHaveLength(2);

    githubLinks.forEach((link, index) => {
      const anchor = link.closest('a');
      expect(anchor).toHaveAttribute('href', mockRepos[index].html_url);
      expect(anchor).toHaveAttribute('target', '_blank');
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('does not show Deep Dive buttons (simplified UI)', () => {
    render(<RepoStats />);

    // Deep Dive buttons should not be present - cards are clickable instead
    const deepDiveButtons = screen.queryAllByText(/Deep Dive/);
    expect(deepDiveButtons).toHaveLength(0);
  });
}); 