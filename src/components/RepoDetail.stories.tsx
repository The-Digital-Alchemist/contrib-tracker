import type { Meta, StoryObj } from '@storybook/react-vite';
import RepoDetail from './RepoDetail';
import type { GitHubRepo } from '../services/githubApi';

// Mock repository data based on real Canonical repositories
const mockSnapcraftRepo: GitHubRepo = {
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

const mockJujuRepo: GitHubRepo = {
  id: 987654321,
  name: 'juju',
  full_name: 'canonical/juju',
  description: 'Juju is a multi-cloud application management system for simplifying operations',
  stargazers_count: 2145,
  forks_count: 456,
  language: 'Go',
  updated_at: '2024-01-20T09:15:00Z',
  html_url: 'https://github.com/canonical/juju'
};

const mockUbuntuRepo: GitHubRepo = {
  id: 192837465,
  name: 'ubuntu-desktop-installer',
  full_name: 'canonical/ubuntu-desktop-installer',
  description: 'The Ubuntu Desktop Installer',
  stargazers_count: 512,
  forks_count: 89,
  language: 'Dart',
  updated_at: '2024-01-18T16:45:00Z',
  html_url: 'https://github.com/canonical/ubuntu-desktop-installer'
};

const meta: Meta<typeof RepoDetail> = {
  title: 'Components/RepoDetail',
  component: RepoDetail,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive repository detail view that displays repository information, good first issues, pull requests, recent activity, and contributor insights. Perfect for showcasing contribution opportunities in Canonical projects.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    repo: {
      description: 'GitHub repository object containing repository metadata',
    },
    onClose: {
      description: 'Optional callback function when close button is clicked',
      action: 'closed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Snapcraft: Story = {
  name: 'Snapcraft Repository',
  args: {
    repo: mockSnapcraftRepo,
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository detail view for Canonical\'s Snapcraft project. Shows real-time data including good first issues, pull requests, recent commits, and top contributors. This demonstrates the full repository deep dive experience.',
      },
    },
  },
};

export const Juju: Story = {
  name: 'Juju Repository',
  args: {
    repo: mockJujuRepo,
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository detail view for Canonical\'s Juju project written in Go. Showcases how the component adapts to different programming languages and project scales.',
      },
    },
  },
};

export const UbuntuDesktopInstaller: Story = {
  name: 'Ubuntu Desktop Installer',
  args: {
    repo: mockUbuntuRepo,
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository detail view for the Ubuntu Desktop Installer written in Dart. Demonstrates the component\'s flexibility across different technology stacks.',
      },
    },
  },
};

export const WithCloseButton: Story = {
  name: 'With Close Button',
  args: {
    repo: mockSnapcraftRepo,
    onClose: undefined, // Will be handled by argTypes action
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository detail view with a close button, useful when displayed as a modal or overlay. Click the X button in the top-right corner to trigger the close action.',
      },
    },
  },
};

export const OverviewTab: Story = {
  name: 'Overview Tab Focus',
  args: {
    repo: mockSnapcraftRepo,
  },
  parameters: {
    docs: {
      description: {
        story: 'Highlights the Overview tab which provides a quick summary of repository health including good first issues count, open PRs, recent commits, and top contributors preview.',
      },
    },
  },
};

export const ContributionFocused: Story = {
  name: 'Contribution Opportunities',
  args: {
    repo: {
      ...mockSnapcraftRepo,
      description: 'Perfect for new contributors! This repository has good first issues and welcoming community.',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Emphasizes the contribution aspect of the repository detail view. The "Good First Issues" tab is particularly valuable for onboarding new contributors to Canonical projects.',
      },
    },
  },
}; 