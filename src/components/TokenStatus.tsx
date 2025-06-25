import React, { useState } from 'react';
import { useTokenValidation } from '../hooks/useTokenValidation';
import Button from './Button';

const TokenStatus: React.FC = () => {
  const { 
    isValid, 
    isLoading, 
    error, 
    rateLimit, 
    tokenInfo, 
    hasToken, 
    validateToken,
    clearToken 
  } = useTokenValidation();
  
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
      <div className="bg-ubuntu-orange-50 border border-ubuntu-orange-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-ubuntu-orange-100 rounded-full">
              🔧
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-ubuntu-orange-800 mb-2">
              Setup Required: GitHub API Token
            </h3>
            <p className="text-sm text-ubuntu-orange-700 mb-3">
              To fetch live data from Canonical repositories, you need to configure a GitHub API token. 
              Without it, API requests are limited to 60/hour and may fail.
            </p>
            <div className="text-sm text-ubuntu-orange-700">
              <p className="mb-2 font-medium">Quick Setup:</p>
              <ol className="ml-2 space-y-1 list-decimal list-inside mb-3">
                <li>Copy <code className="px-1 bg-ubuntu-orange-100 rounded">.env.example</code> to <code className="px-1 bg-ubuntu-orange-100 rounded">.env.local</code></li>
                <li>Get your token from <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">GitHub Settings</a></li>
                <li>Add token to <code className="px-1 bg-ubuntu-orange-100 rounded">.env.local</code></li>
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
      <div className="bg-ubuntu-grey-50 border border-ubuntu-grey-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin text-ubuntu-orange-500">⟳</div>
          <span className="text-sm text-ubuntu-cool-600">Validating GitHub token...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-red-500 text-lg">🚨</div>
            <div>
              <h3 className="font-medium text-red-800">Token Validation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-red-500 text-lg">❌</div>
          <div>
            <h3 className="font-medium text-red-800">Invalid GitHub Token</h3>
            <p className="text-sm text-red-700 mt-1">
              Your token appears to be expired or invalid. Please update your .env file with a fresh token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="text-green-600 text-lg">✅</div>
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
                <div className="flex items-center justify-between text-xs text-ubuntu-cool-600 mb-1">
                  <span>API Rate Limit</span>
                  <span>Resets at {formatResetTime(rateLimit.reset)}</span>
                </div>
                <div className="w-full bg-ubuntu-grey-200 rounded-full h-2">
                  <div 
                    className="bg-ubuntu-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRateLimitPercentage()}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isExpanded && tokenInfo && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Token Details</h4>
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
          className="text-green-600 hover:text-green-800 text-sm ml-2"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
};

export default TokenStatus; 