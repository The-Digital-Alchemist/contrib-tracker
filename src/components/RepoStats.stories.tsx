import type { Meta, StoryObj } from '@storybook/react';
import RepoStats from './RepoStats';

const meta: Meta<typeof RepoStats> = {
  title: 'Components/RepoStats',
  component: RepoStats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays Canonical repositories from GitHub API with cards layout, loading states, and error handling.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows the RepoStats component with real API data. Note: This will make actual API calls to GitHub.',
      },
    },
  },
}; 