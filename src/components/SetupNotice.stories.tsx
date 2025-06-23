import type { Meta, StoryObj } from '@storybook/react-vite';
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
        story: 'Shows the setup notice with step-by-step GitHub token configuration instructions.',
      },
    },
  },
  render: () => {
    // Render the component content directly for Storybook demonstration
    return (
      <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
              🔧
            </div>
          </div>
          <div className="flex-1 ml-3">
            <h3 className="mb-2 text-sm font-medium text-yellow-800">
              Setup Required: GitHub API Token
            </h3>
            <p className="mb-3 text-sm text-yellow-700">
              To fetch live data from Canonical repositories, you need to configure a GitHub API token. 
              Without it, API requests are limited to 60/hour and may fail.
            </p>
            <div className="text-sm text-yellow-700">
              <p className="mb-1 font-medium">Quick Setup:</p>
              <ol className="ml-2 space-y-1 list-decimal list-inside">
                <li>Copy <code className="px-1 bg-yellow-100 rounded">.env.example</code> to <code className="px-1 bg-yellow-100 rounded">.env.local</code></li>
                <li>Get your token from <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">GitHub Settings</a></li>
                <li>Add token to <code className="px-1 bg-yellow-100 rounded">.env.local</code></li>
                <li>Restart your development server</li>
              </ol>
            </div>
            <div className="mt-3 text-xs text-yellow-600">
              💡 With a token: 5,000 requests/hour vs 60 requests/hour without
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const TokenConfigured: Story = {
  parameters: {
    docs: {
      description: {
        story: 'When a GitHub token is properly configured, the component renders nothing (null). This story demonstrates the hidden state.',
      },
    },
  },
  render: () => {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600 italic">
          ✅ GitHub token is configured - SetupNotice component is hidden
        </p>
        <p className="text-xs text-gray-500 mt-2">
          (In the actual app, this component would return null and show nothing)
        </p>
      </div>
    );
  },
}; 