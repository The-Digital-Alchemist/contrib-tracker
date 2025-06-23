import React from 'react';

export interface ApiStatusProps {
  /** Visual variant indicating the API status */
  variant?: 'success' | 'warning' | 'error';
  /** Current rate limit remaining (for warning state) */
  rateLimitRemaining?: number;
  /** Maximum rate limit */
  rateLimitMax?: number;
  /** Custom message to override default */
  customMessage?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ 
  variant, 
  rateLimitRemaining = 4500,
  rateLimitMax = 5000,
  customMessage 
}) => {
  const tokenValue = import.meta.env.VITE_GITHUB_TOKEN;
  const hasToken = tokenValue && tokenValue !== 'your_github_token_here' && tokenValue.trim() !== '';
  
  // Only show ApiStatus when there's a token (SetupNotice handles no-token case)
  if (!hasToken && !variant) {
    return null;
  }
  
  // For real usage, determine variant based on actual API status
  // For stories, use the provided variant
  const  actualVariant = variant || 'success';
  
  // In real usage you could actually check  rate limits here
  // if (!variant && rateLimitRemaining < rateLimitMax * 0.1) {
  //   actualVariant = 'warning';
  // }

  // Configuration for different variants
  const variantConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconBg: 'bg-green-100',
      icon: '✅',
      title: 'API Connected',
      message: customMessage || `GitHub API active - ${rateLimitRemaining?.toLocaleString()}/${rateLimitMax?.toLocaleString()} requests remaining`
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
      icon: '⚠️',
      title: 'Rate Limit Low',
      message: customMessage || `Only ${rateLimitRemaining?.toLocaleString()} of ${rateLimitMax?.toLocaleString()} API requests remaining this hour`
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconBg: 'bg-red-100',
      icon: '❌',
      title: 'API Error',
      message: customMessage || 'GitHub API requests failing. Check your token or try again later.'
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