import React from 'react';
import { useGitHubRateLimit } from '../hooks/useGitHubRateLimit';

export interface ApiStatusProps {
  /** Visual variant indicating the API status (overrides automatic detection) */
  variant?: 'success' | 'warning' | 'error';
  /** Custom message to override default */
  customMessage?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ 
  variant, 
  customMessage 
}) => {
  const tokenValue = import.meta.env.VITE_GITHUB_TOKEN;
  const hasToken = tokenValue && tokenValue !== 'your_github_token_here' && tokenValue.trim() !== '';
  
  // Fetch real rate limit data
  const { coreRateLimit, loading: rateLimitLoading, error: rateLimitError } = useGitHubRateLimit();
  
  // Only show ApiStatus when there's a token (SetupNotice handles no-token case)
  if (!hasToken && !variant) {
    return null;
  }
  
  // Determine variant based on actual rate limits (unless overridden)
  let actualVariant = variant || 'success';
  
  if (!variant && coreRateLimit && !rateLimitLoading) {
    const { remaining, limit } = coreRateLimit;
    const rateLimitPercentage = remaining / limit;
    
    if (rateLimitError) {
      actualVariant = 'error';
    } else if (rateLimitPercentage < 0.1) { // Less than 10% remaining
      actualVariant = 'warning';
    } else {
      actualVariant = 'success';
    }
  }

  // Get actual values for display
  const rateLimitRemaining = coreRateLimit?.remaining || 0;
  const rateLimitMax = coreRateLimit?.limit || 5000;

  // Configuration for different variants
  const variantConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconBg: 'bg-green-100',
      icon: '✅',
      title: 'API Connected',
      message: customMessage || `GitHub API active - ${rateLimitRemaining.toLocaleString()}/${rateLimitMax.toLocaleString()} requests remaining`
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
      icon: '⚠️',
      title: 'Rate Limit Low',
      message: customMessage || `Only ${rateLimitRemaining.toLocaleString()} of ${rateLimitMax.toLocaleString()} API requests remaining this hour`
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconBg: 'bg-red-100',
      icon: '❌',
      title: 'API Error',
      message: customMessage || rateLimitError || 'GitHub API requests failing. Check your token or try again later.'
    }
  };

  const config = variantConfig[actualVariant];

  return (
    <div className={`p-3 mb-6 border rounded-lg ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${config.iconBg}`}>
            {config.icon}
          </div>
        </div>
        <div className="ml-3">
          <p className={`text-sm ${config.textColor}`}>
            <span className="font-medium">{config.title}</span> - {config.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus; 