import React from 'react';
import { useCanonicalRepos, type FilterOptions } from '../hooks/useCanonicalRepos';
import Button from './Button';

interface RepoStatsProps {
  filters?: Partial<FilterOptions>;
}

const RepoStats: React.FC<RepoStatsProps> = ({ filters }) => {
  const { repos, filteredRepos, totalCount, filteredCount, loading, error, refetch } = useCanonicalRepos(30, filters);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Canonical Repositories
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Canonical Repositories
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-red-500 text-lg">⚠️</div>
            <div>
              <p className="text-red-800 font-medium mb-1">Unable to load repositories</p>
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('rate limit') && (
                <p className="text-red-600 text-xs mt-2">
                  💡 Tip: Add a GitHub token to increase rate limits (see .env.example)
                </p>
              )}
              {!import.meta.env.VITE_GITHUB_TOKEN && (
                <p className="text-red-600 text-xs mt-2">
                  🔧 No GitHub token detected. Check .env.example for setup instructions.
                </p>
              )}
            </div>
          </div>
        </div>
        <Button variant="secondary" onClick={refetch}>
          Try Again
        </Button>
      </div>
    );
  }

  // Language color mapping for badges
  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-100 text-gray-700';
    
    const colors: { [key: string]: string } = {
      'TypeScript': 'bg-blue-100 text-blue-700',
      'JavaScript': 'bg-yellow-100 text-yellow-700',
      'Python': 'bg-green-100 text-green-700',
      'Go': 'bg-cyan-100 text-cyan-700',
      'Rust': 'bg-orange-100 text-orange-700',
      'C': 'bg-gray-100 text-gray-700',
      'C++': 'bg-purple-100 text-purple-700',
      'Shell': 'bg-green-100 text-green-700',
      'HTML': 'bg-red-100 text-red-700',
      'CSS': 'bg-blue-100 text-blue-700',
    };
    
    return colors[language] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Canonical Repositories
        </h3>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {filteredCount} of {totalCount.toLocaleString()} repos
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRepos.map((repo) => (
          <div 
            key={repo.id} 
            className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2 group"
              >
                {repo.name}
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {repo.stargazers_count.toLocaleString()}
              </div>
            </div>
            
            {repo.description && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                {repo.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {repo.language && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(repo.language)}`}>
                  {repo.language}
                </span>
              )}
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
              >
                View on GitHub
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
        <Button variant="secondary" onClick={refetch}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default RepoStats; 