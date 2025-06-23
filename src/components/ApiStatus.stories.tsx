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
      description: 'Visual variant indicating the API status',
    },
    rateLimitRemaining: {
      control: 'number',
      description: 'Current rate limit remaining',
    },
    rateLimitMax: {
      control: 'number',
      description: 'Maximum rate limit',
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
    rateLimitRemaining: 4850,
    rateLimitMax: 5000,
  },
  parameters: {
    docs: {
      description: {
        story: 'API is working normally with plenty of rate limit remaining.',
      },
    },
  },
};

export const Warning: Story = {
  name: 'Rate Limit Low',
  args: {
    variant: 'warning',
    rateLimitRemaining: 245,
    rateLimitMax: 5000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Rate limit is running low, user should be aware of approaching limits.',
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

export const RateLimitExhausted: Story = {
  name: 'Rate Limit Exhausted',
  args: {
    variant: 'warning',
    rateLimitRemaining: 0,
    rateLimitMax: 5000,
  },
  parameters: {
    docs: {
      description: {
        story: 'All rate limit has been used up for this hour.',
      },
    },
  },
}; 