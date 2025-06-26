import React, { useState } from 'react';
import { useCanonicalRepos, type FilterOptions } from '../hooks/useCanonicalRepos';
import type { GitHubRepo } from '../services/githubApi';
import Button from './Button';
import RepoDetail from './RepoDetail';
import Pagination from './Pagination';
import FilterStatus from './FilterStatus';

interface RepoStatsProps {
  filters?: Partial<FilterOptions>;
}

const RepoStats: React.FC<RepoStatsProps> = ({ filters }) => {
  const { 
    filteredRepos, 
    totalCount, 
    filteredCount, 
    currentPage,
    totalPages,
    loading, 
    error, 
    refetch,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = useCanonicalRepos(30, filters);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  // Check if advanced filtering is active
  const isAdvancedFiltering = filters && (
    filters.activityFilter !== 'all' ||
    filters.contributorFriendly !== 'all' ||
    filters.repositorySize !== 'all' ||
    (filters.minStars && filters.minStars > 0) ||
    filters.hasRecentActivity
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-ubuntu-grey-200">
        <h3 className="text-xl font-bold text-ubuntu-cool-500 mb-6">
          Canonical Repositories
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-ubuntu-grey-50 rounded-lg border border-ubuntu-grey-200 p-4">
                <div className="h-5 bg-ubuntu-grey-300 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-ubuntu-grey-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-ubuntu-grey-300 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-ubuntu-grey-300 rounded w-16"></div>
                  <div className="h-4 bg-ubuntu-grey-300 rounded w-12"></div>
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
      <div className="bg-white rounded-lg shadow-md p-6 border border-ubuntu-grey-200">
        <h3 className="text-xl font-bold text-ubuntu-cool-500 mb-6">
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

  // Ubuntu-themed language color mapping for badges
  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-ubuntu-grey-100 text-ubuntu-cool-600';
    
    const colors: { [key: string]: string } = {
      'TypeScript': 'bg-ubuntu-purple-100 text-ubuntu-purple-700',
      'JavaScript': 'bg-ubuntu-orange-100 text-ubuntu-orange-700',
      'Python': 'bg-ubuntu-accent-100 text-ubuntu-accent-700',
      'Go': 'bg-ubuntu-grey-200 text-ubuntu-cool-700',
      'Rust': 'bg-ubuntu-orange-100 text-ubuntu-orange-700',
      'C': 'bg-ubuntu-grey-200 text-ubuntu-cool-700',
      'C++': 'bg-ubuntu-purple-100 text-ubuntu-purple-700',
      'Shell': 'bg-ubuntu-accent-100 text-ubuntu-accent-700',
      'HTML': 'bg-ubuntu-orange-100 text-ubuntu-orange-700',
      'CSS': 'bg-ubuntu-purple-100 text-ubuntu-purple-700',
    };
    
    return colors[language] || 'bg-ubuntu-grey-100 text-ubuntu-cool-600';
  };

  // Show repository detail if one is selected
  if (selectedRepo) {
    return (
      <RepoDetail 
        repo={selectedRepo} 
        onClose={() => setSelectedRepo(null)} 
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-ubuntu-grey-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-ubuntu-cool-500">
          Canonical Repositories
        </h3>
        <div className="text-sm text-ubuntu-cool-600 bg-ubuntu-grey-50 px-3 py-1 rounded-full border border-ubuntu-grey-200">
          {filteredCount} of {totalCount.toLocaleString()} repos
        </div>
      </div>
      
      <FilterStatus isAdvancedFiltering={!!isAdvancedFiltering} isLoading={loading} />
      
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRepos.map((repo) => (
          <div 
            key={repo.id} 
            className="bg-ubuntu-grey-50 rounded-lg border border-ubuntu-grey-200 p-4 hover:shadow-md hover:border-ubuntu-orange-300 hover:bg-white transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => setSelectedRepo(repo)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-ubuntu-cool-500">
                {repo.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-ubuntu-grey-600">
                <svg className="w-4 h-4 text-ubuntu-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {repo.stargazers_count.toLocaleString()}
              </div>
            </div>
            
            {repo.description && (
              <p className="text-sm text-ubuntu-cool-600 mb-4 leading-relaxed line-clamp-2">
                {repo.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {repo.language && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(repo.language)}`}>
                    {repo.language}
                  </span>
                </div>
              )}
              <a 
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-ubuntu-grey-600 hover:text-ubuntu-orange-600 transition-colors duration-200 flex items-center gap-1 ml-auto"
              >
                GitHub
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onNext={nextPage}
        onPrev={prevPage}
        totalCount={totalCount}
        pageSize={30}
      />
    </div>
  );
};

export default RepoStats; 