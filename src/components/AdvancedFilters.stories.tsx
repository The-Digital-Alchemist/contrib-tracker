import type { Meta, StoryObj } from '@storybook/react-vite';
import AdvancedFilters from './AdvancedFilters';
import type { FilterOptions } from '../hooks/useCanonicalRepos';

const meta: Meta<typeof AdvancedFilters> = {
  title: 'Components/AdvancedFilters',
  component: AdvancedFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Advanced filtering component for repository discovery with contributor-focused filters.',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the filters are disabled',
    },
  },
  args: {
    onFiltersChange: () => {},
    availableLanguages: ['TypeScript', 'Python', 'Go', 'JavaScript', 'Rust', 'C++', 'Shell'],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultFilters: FilterOptions = {
  search: '',
  language: '',
  sortBy: 'updated',
  sortOrder: 'desc',
  activityFilter: 'all',
  contributorFriendly: 'all',
  repositorySize: 'all',
  minStars: 0,
  hasRecentActivity: false,
};

export const Default: Story = {
  args: {
    filters: defaultFilters,
  },
};

export const WithSearch: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: 'snapcraft',
    },
  },
};

export const ContributorFriendly: Story = {
  args: {
    filters: {
      ...defaultFilters,
      contributorFriendly: 'good-first-issues',
      activityFilter: 'recent',
      language: 'Python',
    },
  },
};

export const AdvancedFiltering: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: 'ubuntu',
      language: 'Go',
      activityFilter: 'active',
      contributorFriendly: 'well-maintained',
      repositorySize: 'medium',
      minStars: 100,
      hasRecentActivity: true,
      sortBy: 'stars',
      sortOrder: 'desc',
    },
  },
};

export const StaleRepositories: Story = {
  args: {
    filters: {
      ...defaultFilters,
      activityFilter: 'stale',
      repositorySize: 'large',
      minStars: 500,
    },
  },
};

export const BeginnerFriendly: Story = {
  args: {
    filters: {
      ...defaultFilters,
      contributorFriendly: 'good-first-issues',
      repositorySize: 'small',
      activityFilter: 'recent',
      minStars: 10,
    },
  },
};

export const Disabled: Story = {
  args: {
    filters: defaultFilters,
    disabled: true,
  },
};

export const HighlyActive: Story = {
  args: {
    filters: {
      ...defaultFilters,
      contributorFriendly: 'highly-active',
      hasRecentActivity: true,
      activityFilter: 'recent',
      sortBy: 'updated',
    },
  },
}; 