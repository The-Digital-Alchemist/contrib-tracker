import type { Meta, StoryObj } from '@storybook/react-vite';
import ApiStatus from './ApiStatus';

const meta: Meta<typeof ApiStatus> = {
  title: 'Components/ApiStatus',
  component: ApiStatus,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays the current status of the GitHub API connection and rate limits.',
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  name: 'API Connected',
  args: {
    variant: 'success',
  },
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
};

export const Warning: Story = {
  name: 'Rate Limited',
  args: {
    variant: 'warning',
  },
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
};

export const Error: Story = {
  name: 'No Token',
  args: {
    variant: 'error',
  },
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
}; 