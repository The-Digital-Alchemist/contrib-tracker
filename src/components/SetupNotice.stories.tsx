import type { Meta, StoryObj } from '@storybook/react';
import SetupNotice from './SetupNotice';

const meta: Meta<typeof SetupNotice> = {
  title: 'Components/SetupNotice',
  component: SetupNotice,
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
        story: 'Shows when no GitHub token is configured. Provides step-by-step setup instructions.',
      },
    },
  },
};

export const WithMockEnvironment: Story = {
  parameters: {
    docs: {
      description: {
        story: 'This story simulates the environment when no GitHub token is set.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the environment to show the setup notice
      const originalEnv = import.meta.env.VITE_GITHUB_TOKEN;
      // @ts-ignore - Temporarily clearing the token for demo
      import.meta.env.VITE_GITHUB_TOKEN = '';
      
      return (
        <div>
          <Story />
        </div>
      );
    },
  ],
}; 