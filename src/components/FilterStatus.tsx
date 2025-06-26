import React from 'react';
import { rateLimiter } from '../services/rateLimiter';
import { repoCache } from '../services/repoCache';

interface FilterStatusProps {
  isAdvancedFiltering: boolean;
  isLoading: boolean;
}

const FilterStatus: React.FC<FilterStatusProps> = ({ isAdvancedFiltering, isLoading }) => {
  const rateLimitInfo = rateLimiter.getRateLimitInfo();
  const cacheStats = repoCache.getStats();

  if (!isAdvancedFiltering && !isLoading) return null;

  return (
    <div className="bg-ubuntu-grey-50 border border-ubuntu-grey-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-3">
        {isLoading && (
          <div className="animate-spin text-ubuntu-orange-500">⟳</div>
        )}
        
        <div className="flex-1">
          {isAdvancedFiltering && (
            <div className="text-sm">
              <span className="font-medium text-ubuntu-cool-600">
                🔍 Advanced filtering active
              </span>
              
              {rateLimitInfo && (
                <div className="text-xs text-ubuntu-grey-600 mt-1">
                  API: {rateLimitInfo.remaining}/{rateLimitInfo.limit} requests remaining
                </div>
              )}
              
              {cacheStats.valid > 0 && (
                <div className="text-xs text-ubuntu-grey-600">
                  Cache: {cacheStats.valid} entries loaded
                </div>
              )}
            </div>
          )}
          
          {isLoading && !isAdvancedFiltering && (
            <span className="text-sm text-ubuntu-cool-600">
              Loading repositories...
            </span>
          )}
        </div>

        {rateLimitInfo && rateLimitInfo.remaining < 50 && (
          <div className="text-xs text-ubuntu-orange-600 bg-ubuntu-orange-50 px-2 py-1 rounded">
            ⚠️ Low API quota
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterStatus; 