import type { Meta, StoryObj } from '@storybook/react-vite';
import ApiStatus from './ApiStatus';

const meta: Meta<typeof ApiStatus> = {
  title: 'Components/ApiStatus',
  component: ApiStatus,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays the current status of the GitHub API connection, rate limits, and any API-related issues.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error'],
      description: 'Visual variant indicating the API status (overrides automatic detection)',
    },
    customMessage: {
      control: 'text',
      description: 'Custom message to override default',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  name: 'API Healthy',
  args: {
    variant: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'API is working normally with real-time rate limit data displayed.',
      },
    },
  },
};

export const Warning: Story = {
  name: 'Rate Limit Low',
  args: {
    variant: 'warning',
  },
  parameters: {
    docs: {
      description: {
        story: 'Forced warning state to show how low rate limits are displayed.',
      },
    },
  },
};

export const Error: Story = {
  name: 'API Failure',
  args: {
    variant: 'error',
    customMessage: 'Invalid token or network error. Please check your configuration.',
  },
  parameters: {
    docs: {
      description: {
        story: 'API requests are failing, possibly due to invalid token or network issues.',
      },
    },
  },
};

export const AutoDetection: Story = {
  name: 'Automatic Detection',
  args: {
    // No variant specified - will auto-detect based on real rate limits
  },
  parameters: {
    docs: {
      description: {
        story: 'Automatically detects API status and rate limits from GitHub API. Status will change based on actual usage.',
      },
    },
  },
}; 