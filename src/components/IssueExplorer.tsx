import React, { useState, useEffect } from 'react';
import { githubApi } from '../services/githubApi';
import type { GitHubIssue, GitHubRepo } from '../services/githubApi';
import Button from './Button';

interface IssueExplorerProps {
  onClose: () => void;
}

const IssueExplorer: React.FC<IssueExplorerProps> = ({ onClose }) => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [featuredRepos, setFeaturedRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'issues' | 'repos'>('issues');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load good first issues from popular Canonical repos
      const popularRepos = [
        'snapcraft', 'ubuntu-image', 'multipass', 'juju', 'lxd',
        'snapd', 'ubuntu-core-desktop', 'microk8s', 'charmed-kubernetes'
      ];

      const issuePromises = popularRepos.map(async (repoName) => {
        try {
          const repoIssues = await githubApi.fetchGoodFirstIssues('canonical', repoName, 5);
          return repoIssues;
        } catch (error) {
          console.warn(`Failed to fetch issues for ${repoName}:`, error);
          return [];
        }
      });

      const allIssuesArrays = await Promise.all(issuePromises);
      const allIssues = allIssuesArrays.flat();
      
      // Sort by creation date (newest first)
      allIssues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setIssues(allIssues);

      // Also load featured repositories for exploration
      const repoData = await githubApi.fetchCanonicalRepos(1, 12, '', 'stars', 'desc');
      setFeaturedRepos(repoData.items);

    } catch (err) {
      console.error('Error loading issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-ubuntu-grey-100 text-ubuntu-grey-700';
    
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
    
    return colors[language] || 'bg-ubuntu-grey-100 text-ubuntu-grey-700';
  };

  const getDifficultyFromLabels = (issue: GitHubIssue) => {
    const labels = issue.labels.map(l => l.name.toLowerCase());
    if (labels.some(l => l.includes('easy') || l.includes('beginner'))) return 'easy';
    if (labels.some(l => l.includes('hard') || l.includes('complex'))) return 'hard';
    return 'medium';
  };

  const filteredIssues = issues.filter(issue => {
    // Extract repo language from the issue URL
    const repoName = issue.html_url.split('/')[4];
    const repo = featuredRepos.find(r => r.name === repoName);
    const repoLanguage = repo?.language;

    if (selectedLanguage !== 'all' && repoLanguage !== selectedLanguage) {
      return false;
    }

    if (selectedDifficulty !== 'all') {
      const difficulty = getDifficultyFromLabels(issue);
      if (difficulty !== selectedDifficulty) return false;
    }

    return true;
  });

  const availableLanguages: string[] = Array.from(new Set(
    featuredRepos.map(repo => repo.language).filter((lang): lang is string => lang !== null)
  )).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-ubuntu-grey-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ubuntu-cool-500">
              🔍 Issue Explorer
            </h2>
            <Button variant="secondary" onClick={onClose}>
              ✕ Close
            </Button>
          </div>

          <p className="text-ubuntu-grey-600 mb-4">
            Discover contribution opportunities across the Canonical ecosystem. 
            Find issues that match your skills and interests.
          </p>

          {/* Tab Navigation */}
          <div className="flex border-b border-ubuntu-grey-200 mb-4">
            {[
              { id: 'issues', label: '🎯 Good First Issues', count: filteredIssues.length },
              { id: 'repos', label: '📂 Featured Repositories', count: featuredRepos.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'issues' | 'repos')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-ubuntu-orange-600 border-b-2 border-ubuntu-orange-600'
                    : 'text-ubuntu-grey-600 hover:text-ubuntu-cool-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Filters (only show for issues tab) */}
          {activeTab === 'issues' && (
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-ubuntu-grey-700 mb-1">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 border border-ubuntu-grey-300 rounded-lg focus:ring-2 focus:ring-ubuntu-orange-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Languages</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ubuntu-grey-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 border border-ubuntu-grey-300 rounded-lg focus:ring-2 focus:ring-ubuntu-orange-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="secondary" onClick={loadData} disabled={loading}>
                  {loading ? '⟳' : '🔄'} Refresh
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⟳</div>
              <p className="text-ubuntu-grey-600">Loading contribution opportunities...</p>
            </div>
          ) : activeTab === 'issues' ? (
            <div className="space-y-4">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-ubuntu-cool-500 mb-2">
                    No issues found
                  </h3>
                  <p className="text-ubuntu-grey-600">
                    Try adjusting your filters or check back later for new opportunities.
                  </p>
                </div>
              ) : (
                filteredIssues.map((issue) => {
                  const repoName = issue.html_url.split('/')[4];
                  const repo = featuredRepos.find(r => r.name === repoName);
                  const difficulty = getDifficultyFromLabels(issue);

                  return (
                    <div
                      key={issue.id}
                      className="bg-white border border-ubuntu-grey-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-ubuntu-cool-600 pr-4">
                              {issue.title}
                            </h3>
                            <div className="flex gap-2 flex-shrink-0">
                              <span className="bg-ubuntu-accent-100 text-ubuntu-accent-700 px-2 py-1 rounded text-xs">
                                Good First Issue
                              </span>
                              {difficulty !== 'medium' && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  difficulty === 'easy' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {difficulty === 'easy' ? 'Easy' : 'Hard'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-ubuntu-grey-600 mb-3">
                            <span className="font-medium text-ubuntu-cool-600">
                              📂 canonical/{repoName}
                            </span>
                            {repo?.language && (
                              <span className={`px-2 py-1 rounded text-xs ${getLanguageColor(repo.language)}`}>
                                {repo.language}
                              </span>
                            )}
                            <span>💬 {issue.comments} comments</span>
                            <span>📅 {formatDate(issue.created_at)}</span>
                          </div>

                          {issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {issue.labels.slice(0, 5).map((label) => (
                                <span
                                  key={label.id}
                                  className="px-2 py-1 rounded text-xs border"
                                                                     style={{
                                     backgroundColor: `#${label.color}20`,
                                     borderColor: `#${label.color}40`,
                                     color: `#${label.color}` 
                                   } as React.CSSProperties}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-ubuntu-grey-600">
                              Opened by {issue.user.login}
                            </div>
                            <a
                              href={issue.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ubuntu-orange-600 hover:text-ubuntu-orange-700 text-sm font-medium"
                            >
                              View Issue ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-white border border-ubuntu-grey-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-ubuntu-cool-500">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-ubuntu-grey-600">
                      ⭐ {repo.stargazers_count}
                    </div>
                  </div>
                  
                  {repo.description && (
                    <p className="text-sm text-ubuntu-grey-600 mb-4 line-clamp-3">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {repo.language && (
                      <span className={`px-2 py-1 rounded text-xs ${getLanguageColor(repo.language)}`}>
                        {repo.language}
                      </span>
                    )}
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ubuntu-orange-600 hover:text-ubuntu-orange-700 text-xs"
                    >
                      Explore ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueExplorer; 