import { useState } from 'react';
import Button from './components/Button';
import RepoStats from './components/RepoStats';
import SetupNotice from './components/SetupNotice';
import ApiStatus from './components/ApiStatus';
import AdvancedFilters from './components/AdvancedFilters';
import { useCanonicalRepos } from './hooks/useCanonicalRepos';
import type { FilterOptions } from './hooks/useCanonicalRepos';
import './App.css'

function App() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    language: '',
    sortBy: 'updated',
    sortOrder: 'desc',
    activityFilter: 'all',
    contributorFriendly: 'all',
    repositorySize: 'all',
    minStars: 0,
    hasRecentActivity: false
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get available languages for the filter dropdown
  const { availableLanguages } = useCanonicalRepos(30, filters);

  const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌟 Canonical Contribution Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Track repository health, surface good first issues, and grow community contributions across Ubuntu, Snapcraft, and the Canonical ecosystem.
          </p>
        </header>

        <main className="max-w-2xl mx-auto">
          <SetupNotice />
          <ApiStatus />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Get Started
            </h2>
            <p className="text-gray-600 mb-6">
              Discover opportunities to contribute, monitor project health, and connect with the Canonical community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary">
                Explore Issues
              </Button>
              <Button variant="secondary">
                Analyze Repositories
              </Button>
              <Button variant="secondary">
                Join the Community
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  🔍 Discover Repositories
                </h2>
                <Button
                  variant={showAdvancedFilters ? "primary" : "secondary"}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                </Button>
              </div>
              
              {showAdvancedFilters && (
                <div className="mb-6">
                  <AdvancedFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    availableLanguages={availableLanguages}
                  />
                </div>
              )}
            </div>
            <RepoStats filters={filters} />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Empowering contributors across the Canonical ecosystem
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App
