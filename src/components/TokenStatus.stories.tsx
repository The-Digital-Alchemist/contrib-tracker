import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import Button from './Button';

interface MockRateLimit {
  limit: number;
  remaining: number;
  used: number;
  reset: number;
}

interface MockTokenInfo {
  scopes: string[];
}

interface MockTokenValidationData {
  isValid: boolean | null;
  isLoading: boolean;
  error: string | null;
  rateLimit: MockRateLimit | null;
  tokenInfo: MockTokenInfo | null;
  hasToken: boolean;
  validateToken: () => void;
  clearToken: () => void;
}

// Create a testable version of TokenStatus that accepts mock data
const TokenStatusStorybook: React.FC<{ mockData?: MockTokenValidationData }> = ({ mockData }) => {
  // Use mock data if provided, otherwise use default values
  const {
    isValid = null,
    isLoading = false,
    error = null,
    rateLimit = null,
    tokenInfo = null,
    hasToken = false,
    validateToken = () => console.log('Validate token clicked'),
    clearToken = () => console.log('Clear token clicked')
  } = mockData || {};
  
  const [isExpanded, setIsExpanded] = useState(false);

  const formatResetTime = (resetTimestamp: number) => {
    const resetDate = new Date(resetTimestamp * 1000);
    return resetDate.toLocaleTimeString();
  };

  const getRateLimitPercentage = () => {
    if (!rateLimit) return 0;
    return (rateLimit.remaining / rateLimit.limit) * 100;
  };

  const getRateLimitColor = () => {
    const percentage = getRateLimitPercentage();
    if (percentage > 50) return 'text-green-600 bg-green-100';
    if (percentage > 20) return 'text-ubuntu-orange-600 bg-ubuntu-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (!hasToken) {
    return (
      <div className="p-4 mb-4 border rounded-lg bg-ubuntu-orange-50 border-ubuntu-orange-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ubuntu-orange-100">
              🔧
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 font-medium text-ubuntu-orange-800">
              Setup Required: GitHub API Token
            </h3>
            <p className="mb-3 text-sm text-ubuntu-orange-700">
              To fetch live data from Canonical repositories, you need to configure a GitHub API token. 
              Without it, API requests are limited to 60/hour and may fail.
            </p>
            <div className="text-sm text-ubuntu-orange-700">
              <p className="mb-2 font-medium">Quick Setup:</p>
              <ol className="mb-3 ml-2 space-y-1 list-decimal list-inside">
                <li>Copy <code className="px-1 rounded bg-ubuntu-orange-100">.env.example</code> to <code className="px-1 rounded bg-ubuntu-orange-100">.env.local</code></li>
                <li>Get your token from <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">GitHub Settings</a></li>
                <li>Add token to <code className="px-1 rounded bg-ubuntu-orange-100">.env.local</code></li>
                <li>Restart your development server</li>
              </ol>
            </div>
            <div className="text-xs text-ubuntu-orange-600">
              💡 With a token: 5,000 requests/hour vs 60 requests/hour without
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 mb-4 border rounded-lg bg-ubuntu-grey-50 border-ubuntu-grey-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin text-ubuntu-orange-500">⟳</div>
          <span className="text-sm text-ubuntu-cool-600">Validating GitHub token...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-lg text-red-500">🚨</div>
            <div>
              <h3 className="font-medium text-red-800">Token Validation Failed</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="flex gap-2 mt-3">
                <Button size="small" variant="secondary" onClick={validateToken}>
                  Retry Validation
                </Button>
                <Button size="small" variant="negative" onClick={clearToken}>
                  Clear Token
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-start gap-3">
          <div className="text-lg text-red-500">❌</div>
          <div>
            <h3 className="font-medium text-red-800">Invalid GitHub Token</h3>
            <p className="mt-1 text-sm text-red-700">
              Your token appears to be expired or invalid. Please update your .env file with a fresh token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="text-lg text-green-600">✅</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-green-800">GitHub Token Active</h3>
              {rateLimit && (
                <span className={`text-xs px-2 py-1 rounded-full ${getRateLimitColor()}`}>
                  {rateLimit.remaining}/{rateLimit.limit} calls remaining
                </span>
              )}
            </div>
            
            {rateLimit && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1 text-xs text-ubuntu-cool-600">
                  <span>API Rate Limit</span>
                  <span>Resets at {formatResetTime(rateLimit.reset)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-ubuntu-grey-200">
                  <div 
                    className="h-2 transition-all duration-300 rounded-full bg-ubuntu-orange-500"
                    style={{ width: `${getRateLimitPercentage()}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isExpanded && tokenInfo && (
              <div className="pt-3 mt-3 border-t border-green-200">
                <h4 className="mb-2 text-sm font-medium text-green-800">Token Details</h4>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-ubuntu-cool-600">Scopes: </span>
                    <span className="text-ubuntu-cool-700">
                      {tokenInfo.scopes.length > 0 ? tokenInfo.scopes.join(', ') : 'public_repo (default)'}
                    </span>
                  </div>
                  {rateLimit && (
                    <div>
                      <span className="text-ubuntu-cool-600">Used: </span>
                      <span className="text-ubuntu-cool-700">{rateLimit.used} calls this hour</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-sm text-green-600 hover:text-green-800"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
};

const meta = {
  title: 'Components/TokenStatus',
  component: TokenStatusStorybook,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The TokenStatus component provides comprehensive GitHub token management and monitoring.

**Key Features:**
- Real-time token validation
- Visual rate limit monitoring
- Automatic token health checks
- Clear error states and recovery options
- Expandable token details

**Visual States:**
- 🟢 **Valid Token**: Green background with rate limit progress bar
- 🟡 **Warning**: Orange when rate limits are low (20-50%)
- 🔴 **Critical**: Red when rate limits are very low (<20%)
- ⚠️ **No Token**: Orange notification with setup instructions
- 🚨 **Invalid/Expired**: Red error state with retry options
- ⏳ **Loading**: Grey state during validation

The component automatically validates tokens every 5 minutes to ensure they remain valid.
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TokenStatusStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story for when no token is configured
export const NoToken: Story = {
  args: {
    mockData: {
      isValid: false,
      isLoading: false,
      error: null,
      rateLimit: null,
      tokenInfo: null,
      hasToken: false,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**No Token Configured**

Shows detailed setup instructions when no GitHub token is configured in the environment.
Includes step-by-step setup guide and rate limit comparison.
        `,
      },
    },
  },
};

// Story for loading state
export const Loading: Story = {
  args: {
    mockData: {
      isValid: null,
      isLoading: true,
      error: null,
      rateLimit: null,
      tokenInfo: null,
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Loading State**

Shows the loading indicator while validating a GitHub token.
        `,
      },
    },
  },
};

// Story for valid token with high rate limit
export const ValidTokenHighRateLimit: Story = {
  args: {
    mockData: {
      isValid: true,
      isLoading: false,
      error: null,
      rateLimit: {
        limit: 5000,
        remaining: 4250,
        used: 750,
        reset: Math.floor(Date.now() / 1000) + 3600 
      },
      tokenInfo: {
        scopes: ['repo', 'user:email', 'read:org']
      },
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Valid Token - High Rate Limit**

Shows a healthy token state with plenty of API calls remaining (85% available).
Rate limit bar shows green indicating good health.
        `,
      },
    },
  },
};

// Story for valid token with medium rate limit
export const ValidTokenMediumRateLimit: Story = {
  args: {
    mockData: {
      isValid: true,
      isLoading: false,
      error: null,
      rateLimit: {
        limit: 5000,
        remaining: 1500,
        used: 3500,
        reset: Math.floor(Date.now() / 1000) + 2400 
      },
      tokenInfo: {
        scopes: ['public_repo']
      },
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Valid Token - Medium Rate Limit**

Shows a token with moderate usage (30% remaining).
Rate limit bar shows orange indicating caution.
        `,
      },
    },
  },
};

// Story for valid token with low rate limit
export const ValidTokenLowRateLimit: Story = {
  args: {
    mockData: {
      isValid: true,
      isLoading: false,
      error: null,
      rateLimit: {
        limit: 5000,
        remaining: 250,
        used: 4750,
        reset: Math.floor(Date.now() / 1000) + 900 // 15 minutes from now
      },
      tokenInfo: {
        scopes: ['repo', 'user:email', 'read:org', 'write:repo_hook']
      },
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Valid Token - Low Rate Limit**

Shows a token with high usage (5% remaining).
Rate limit bar shows red indicating critical state.
        `,
      },
    },
  },
};

// Story for invalid token
export const InvalidToken: Story = {
  args: {
    mockData: {
      isValid: false,
      isLoading: false,
      error: null,
      rateLimit: null,
      tokenInfo: null,
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Invalid Token**

Shows state when a token is configured but is expired or invalid.
        `,
      },
    },
  },
};

// Story for validation error
export const ValidationError: Story = {
  args: {
    mockData: {
      isValid: false,
      isLoading: false,
      error: 'Network error: Unable to reach GitHub API. Please check your internet connection.',
      rateLimit: null,
      tokenInfo: null,
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Validation Error**

Shows error state when token validation fails due to network issues or API problems.
Includes retry and clear token action buttons.
        `,
      },
    },
  },
};

// Story showing expanded token details
export const ExpandedDetails: Story = {
  args: {
    mockData: {
      isValid: true,
      isLoading: false,
      error: null,
      rateLimit: {
        limit: 5000,
        remaining: 3200,
        used: 1800,
        reset: Math.floor(Date.now() / 1000) + 1800 // 30 minutes from now
      },
      tokenInfo: {
        scopes: ['repo', 'user:email', 'read:org', 'gist']
      },
      hasToken: true,
      validateToken: () => console.log('Validate token clicked'),
      clearToken: () => console.log('Clear token clicked')
    }
  },
  play: async ({ canvasElement }) => {
    // Auto-expand the details section for this story
    const canvas = canvasElement;
    const expandButton = canvas.querySelector('button[class*="text-green-600"]');
    if (expandButton) {
      (expandButton as HTMLButtonElement).click();
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
**Expanded Token Details**

Shows the component with token details expanded to display scopes and usage information.
This story automatically expands the details section.
        `,
      },
    },
  },
};

// Import the actual component for live testing
import ActualTokenStatus from './TokenStatus';

export const LiveDemo: Story = {
  render: () => <ActualTokenStatus />,
  parameters: {
    docs: {
      description: {
        story: `
**Live Demo**

This shows the actual TokenStatus component behavior based on your current environment:
- If you have a valid GitHub token in your .env file, you'll see the token validation status
- If no token is configured, you'll see setup instructions
- If the token is expired/invalid, you'll see error states

The component performs real API calls to validate your token and show current rate limits.
        `,
      },
    },
  },
}; 