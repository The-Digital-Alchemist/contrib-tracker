import Button from './components/Button';
import './App.css'

function App() {
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
