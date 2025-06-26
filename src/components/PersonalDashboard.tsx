import React, { useState } from 'react';
import { githubApi } from '../services/githubApi';
import type { GitHubRepo, GitHubIssue, GitHubCommit, GitHubUser } from '../services/githubApi';
import Button from './Button';

interface PersonalDashboardProps {
  onClose: () => void;
}

interface UserContributions {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  reposContributedTo: GitHubRepo[];
  recentActivity: GitHubCommit[];
}

interface UserRecommendations {
  languageBasedIssues: GitHubIssue[];
  starredRepoIssues: GitHubIssue[];
  similarContributorRepos: GitHubRepo[];
}

type UserProfile = GitHubUser & {
  bio: string | null;
  blog: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [recommendations, setRecommendations] = useState<UserRecommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'analytics'>('overview');

  const handleLoadProfile = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [userProfile, userContributions, userRecommendations] = await Promise.all([
        githubApi.fetchUserProfile(username.trim()),
        githubApi.fetchUserContributions(username.trim()),
        githubApi.fetchUserRecommendations(username.trim())
      ]);

      setProfile(userProfile);
      setContributions(userContributions);
      setRecommendations(userRecommendations);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
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

  const getAccountAge = () => {
    if (!profile?.created_at) return '';
    const years = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} year${years !== 1 ? 's' : ''} on GitHub`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-ubuntu-grey-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ubuntu-cool-500">
              🎯 Personal Contribution Dashboard
            </h2>
            <Button variant="secondary" onClick={onClose} className="bg-white border border-ubuntu-grey-300 hover:border-ubuntu-orange-500 hover:shadow-md transition-all">
              ✕ Close
            </Button>
          </div>
          
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLoadProfile()}
              className="flex-1 px-4 py-2 border border-ubuntu-grey-300 rounded-lg focus:ring-2 focus:ring-ubuntu-orange-500 focus:border-transparent"
            />
            <Button 
              variant="secondary" 
              onClick={handleLoadProfile}
              disabled={loading}
              className="bg-white border border-ubuntu-grey-300 hover:border-ubuntu-orange-500 hover:shadow-md transition-all"
            >
              {loading ? '⟳ Loading...' : '🔍 Load Profile'}
            </Button>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {profile && contributions && recommendations && (
          <div className="p-6">
            {/* Profile Header */}
            <div className="bg-ubuntu-grey-50 rounded-lg p-6 mb-6 border border-ubuntu-grey-200">
              <div className="flex items-start gap-4">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-ubuntu-cool-500">
                      {profile.login}
                    </h3>
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ubuntu-orange-600 hover:text-ubuntu-orange-700 text-sm"
                    >
                      GitHub Profile ↗
                    </a>
                  </div>
                  {profile.bio && (
                    <p className="text-ubuntu-cool-600 mb-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-ubuntu-grey-600">
                    {profile.location && <span>📍 {profile.location}</span>}
                    {profile.company && <span>🏢 {profile.company}</span>}
                    <span>📅 {getAccountAge()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-ubuntu-grey-600 mt-2">
                    <span>👥 {profile.followers} followers</span>
                    <span>📂 {profile.public_repos} repositories</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-ubuntu-grey-200 mb-6">
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'recommendations', label: '🎯 Recommendations' },
                { id: 'analytics', label: '📈 Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'recommendations' | 'analytics')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-ubuntu-orange-600 border-b-2 border-ubuntu-orange-600'
                      : 'text-ubuntu-grey-600 hover:text-ubuntu-cool-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contribution Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-ubuntu-accent-50 rounded-lg p-4 border border-ubuntu-accent-200">
                    <div className="text-2xl font-bold text-ubuntu-accent-700">
                      {contributions.totalCommits}
                    </div>
                    <div className="text-ubuntu-accent-600 text-sm">
                      Canonical Commits
                    </div>
                  </div>
                  <div className="bg-ubuntu-purple-50 rounded-lg p-4 border border-ubuntu-purple-200">
                    <div className="text-2xl font-bold text-ubuntu-purple-700">
                      {contributions.totalPRs}
                    </div>
                    <div className="text-ubuntu-purple-600 text-sm">
                      Pull Requests
                    </div>
                  </div>
                  <div className="bg-ubuntu-orange-50 rounded-lg p-4 border border-ubuntu-orange-200">
                    <div className="text-2xl font-bold text-ubuntu-orange-700">
                      {contributions.totalIssues}
                    </div>
                    <div className="text-ubuntu-orange-600 text-sm">
                      Issues Created
                    </div>
                  </div>
                </div>

                {/* Contributed Repositories */}
                {contributions.reposContributedTo.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-ubuntu-cool-500 mb-4">
                      🎯 Your Canonical Contributions ({contributions.reposContributedTo.length} repos)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contributions.reposContributedTo.map((repo) => (
                        <div
                          key={repo.id}
                          className="bg-white border border-ubuntu-grey-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-ubuntu-cool-600">
                              {repo.name}
                            </h5>
                            <div className="flex items-center gap-1 text-sm text-ubuntu-grey-600">
                              ⭐ {repo.stargazers_count}
                            </div>
                          </div>
                          {repo.description && (
                            <p className="text-sm text-ubuntu-grey-600 mb-2 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {repo.language && (
                              <span className="px-2 py-1 bg-ubuntu-grey-100 text-ubuntu-grey-700 rounded text-xs">
                                {repo.language}
                              </span>
                            )}
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ubuntu-orange-600 hover:text-ubuntu-orange-700 text-xs"
                            >
                              View Repo ↗
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {contributions.recentActivity.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-ubuntu-cool-500 mb-4">
                      ⚡ Recent Activity
                    </h4>
                    <div className="space-y-3">
                      {contributions.recentActivity.slice(0, 5).map((commit) => (
                        <div
                          key={commit.sha}
                          className="bg-white border border-ubuntu-grey-200 rounded-lg p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-ubuntu-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm text-ubuntu-cool-600 font-medium mb-1">
                                {commit.commit.message.split('\n')[0]}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-ubuntu-grey-600">
                                <span>{formatDate(commit.commit.author.date)}</span>
                                <a
                                  href={commit.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-ubuntu-orange-600 hover:text-ubuntu-orange-700"
                                >
                                  View Commit ↗
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                {/* Language-based Issues */}
                {recommendations.languageBasedIssues.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-ubuntu-cool-500 mb-4">
                      🎯 Issues in Your Favorite Languages
                    </h4>
                    <div className="space-y-3">
                      {recommendations.languageBasedIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="bg-white border border-ubuntu-grey-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-ubuntu-cool-600">
                              {issue.title}
                            </h5>
                            <span className="bg-ubuntu-accent-100 text-ubuntu-accent-700 px-2 py-1 rounded text-xs">
                              Good First Issue
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-ubuntu-grey-600 mb-2">
                            <span>💬 {issue.comments} comments</span>
                            <span>📅 {formatDate(issue.created_at)}</span>
                          </div>
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ubuntu-orange-600 hover:text-ubuntu-orange-700 text-sm"
                          >
                            View Issue ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Contributor Repos */}
                {recommendations.similarContributorRepos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-ubuntu-cool-500 mb-4">
                      🌟 Repos You Might Like
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.similarContributorRepos.map((repo) => (
                        <div
                          key={repo.id}
                          className="bg-white border border-ubuntu-grey-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-ubuntu-cool-600">
                              {repo.name}
                            </h5>
                            <div className="flex items-center gap-1 text-sm text-ubuntu-grey-600">
                              ⭐ {repo.stargazers_count}
                            </div>
                          </div>
                          {repo.description && (
                            <p className="text-sm text-ubuntu-grey-600 mb-2 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {repo.language && (
                              <span className="px-2 py-1 bg-ubuntu-grey-100 text-ubuntu-grey-700 rounded text-xs">
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
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-ubuntu-grey-50 rounded-lg p-6 border border-ubuntu-grey-200 text-center">
                  <h4 className="text-lg font-semibold text-ubuntu-cool-500 mb-2">
                    📈 Analytics Coming Soon
                  </h4>
                  <p className="text-ubuntu-grey-600">
                    Contribution trends, productivity insights, and goal tracking will be added here!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!profile && !loading && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-ubuntu-cool-500 mb-2">
              Discover Your Canonical Impact
            </h3>
            <p className="text-ubuntu-grey-600 max-w-md mx-auto">
              Enter your GitHub username above to see your contribution history, 
              get personalized issue recommendations, and track your progress 
              across the Canonical ecosystem.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDashboard; 