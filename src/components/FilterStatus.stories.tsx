import type { Meta, StoryObj } from '@storybook/react-vite';
import FilterStatus from './FilterStatus';

const meta: Meta<typeof FilterStatus> = {
  title: 'Components/FilterStatus',
  component: FilterStatus,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Status indicator for filtering operations showing loading states, API quota information, and cache statistics. Provides real-time feedback on repository filtering performance and GitHub API usage.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isAdvancedFiltering: {
      control: 'boolean',
      description: 'Whether advanced filtering is currently active, showing detailed status information',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether a loading operation is in progress, displaying loading indicators',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default State',
  args: {
    isAdvancedFiltering: false,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state when no filtering is active and no loading operations are in progress. The component remains hidden.',
      },
    },
  },
};

export const Loading: Story = {
  name: 'Loading State',
  args: {
    isAdvancedFiltering: false,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading indicator when repositories are being fetched from GitHub API.',
      },
    },
  },
};

export const AdvancedFiltering: Story = {
  name: 'Advanced Filtering Active',
  args: {
    isAdvancedFiltering: true,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays status information when advanced filtering is active, including API quota and cache statistics.',
      },
    },
  },
};

export const FilteringWithLoading: Story = {
  name: 'Filtering with Loading',
  args: {
    isAdvancedFiltering: true,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows both advanced filtering status and loading spinner when filtering operations are in progress.',
      },
    },
  },
};

export const ApiQuotaWarning: Story = {
  name: 'API Quota Warning',
  args: {
    isAdvancedFiltering: true,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the warning state when GitHub API rate limit is running low, helping users understand API usage.',
      },
    },
  },
};

export const CacheStatistics: Story = {
  name: 'Cache Statistics',
  args: {
    isAdvancedFiltering: true,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows cache statistics when repository data is cached locally, improving performance insights.',
      },
    },
  },
};

export const CompleteStatus: Story = {
  name: 'Complete Status Information',
  args: {
    isAdvancedFiltering: true,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete status display showing all available information: loading state, API quota, cache statistics, and any warnings.',
      },
    },
  },
}; 