# Canonical Contribution Tracker

A modern web application for tracking repository health, surfacing good first issues, and growing community contributions across Ubuntu, Snapcraft, and the Canonical ecosystem.

## 🛠️ Technology Stack

- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Storybook** for component development
- **GitHub API** integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contrib-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up GitHub API token (optional but recommended):
```bash
cp .env.example .env.local
# Edit .env.local and add your GitHub token
```

4. Start the development server:
```bash
npm run dev
```

## 📚 Storybook

This project uses Storybook for component development and documentation.

### Running Storybook

```bash
npm run storybook
```

This will start Storybook on http://localhost:6006

### Available Components

- **Button** - Primary, secondary, and outline variants
- **RepoStats** - Repository display with GitHub integration
- **SetupNotice** - GitHub token setup guidance
- **ApiStatus** - API configuration status

## 🎨 Development

### Component Development

1. Create your component in `src/components/`
2. Create a corresponding story file `ComponentName.stories.tsx`
3. Run Storybook to develop in isolation
4. Integrate into the main application

### Building

```bash
npm run build
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
