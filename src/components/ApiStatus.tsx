import React from 'react';

const ApiStatus: React.FC = () => {
  const tokenValue = import.meta.env.VITE_GITHUB_TOKEN;
  const hasToken = tokenValue && tokenValue !== 'your_github_token_here' && tokenValue.trim() !== '';

  if (!hasToken) {
    return null; // SetupNotice will handle this case
  }

  return (
    <div className="p-3 mb-6 border border-green-200 rounded-lg bg-green-50">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
            ✅
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-800">
            <span className="font-medium">GitHub API configured</span> - Full access to Canonical repositories (5,000 requests/hour)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus; 