import type { Meta, StoryObj } from '@storybook/react';
import ApiStatus from './ApiStatus';

const meta: Meta<typeof ApiStatus> = {
  title: 'Components/ApiStatus',
  component: ApiStatus,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows when GitHub token is properly configured. Displays green confirmation banner.',
      },
    },
  },
};

export const ConfiguredState: Story = {
  decorators: [
    (Story) => {
      // Mock environment with token to show the status
      const originalEnv = import.meta.env.VITE_GITHUB_TOKEN;
      // @ts-ignore - Mock having a token for demo
      import.meta.env.VITE_GITHUB_TOKEN = 'mock_token_for_demo';
      
      return (
        <div>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'This story simulates having a configured GitHub token to show the success state.',
      },
    },
  },
};

export const HiddenState: Story = {
  decorators: [
    (Story) => {
      // Mock environment without token (component should not render)
      const originalEnv = import.meta.env.VITE_GITHUB_TOKEN;
      // @ts-ignore - Clear token to hide component
      import.meta.env.VITE_GITHUB_TOKEN = '';
      
      return (
        <div>
          <p className="text-gray-500 italic">Component hidden when no token is configured</p>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'When no token is configured, this component returns null and is hidden.',
      },
    },
  },
}; 