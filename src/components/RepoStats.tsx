import React from 'react';
import { useCanonicalRepos } from '../hooks/useCanonicalRepos';
import Button from './Button';

const RepoStats: React.FC = () => {
  const { repos, totalCount, loading, error, refetch } = useCanonicalRepos(10);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Canonical Repositories
        </h3>
                 <div className="animate-pulse space-y-3">
           <div className="h-4 bg-gray-200 rounded w-1/4"></div>
           <div className="space-y-2">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
               <div key={i} className="h-3 bg-gray-200 rounded w-3/4"></div>
             ))}
           </div>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Canonical Repositories
        </h3>
        <div className="text-red-600 mb-4">
          <p className="text-sm">⚠️ {error}</p>
          {error.includes('rate limit') && (
            <p className="text-xs mt-2 text-gray-600">
              💡 Tip: Add a GitHub token to increase rate limits (see .env.example)
            </p>
          )}
          {!import.meta.env.VITE_GITHUB_TOKEN && (
            <p className="text-xs mt-2 text-gray-600">
              🔧 No GitHub token detected. Check .env.example for setup instructions.
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={refetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Canonical Repositories
        </h3>
        <span className="text-sm text-gray-500">
          Showing {repos.length} of {totalCount.toLocaleString()} repos
        </span>
      </div>
      
      <div className="space-y-3">
        {repos.map((repo) => (
          <div key={repo.id} className="border-l-4 border-blue-400 pl-4 py-2">
            <div className="flex items-center justify-between">
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {repo.name}
              </a>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {repo.language && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {repo.language}
                  </span>
                )}
                <span>⭐ {repo.stargazers_count}</span>
              </div>
            </div>
            {repo.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {repo.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={refetch}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default RepoStats; 