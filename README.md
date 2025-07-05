# 🌟 Canonical Contribution Tracker

A dynamic, real-time GitHub repository explorer that helps you discover and analyze Canonical's open-source projects. Built with modern React and TypeScript, this tool provides deep insights into repository health, contributor activity, and community engagement.

> **🚀 Future Plan**: This tool will be expanded to support searching any GitHub organization, not just Canonical!

## 🎯 What This Does

Ever wondered which repositories in Canonical are most active? Or which ones have the most "good first issues" for new contributors? This tool answers those questions and more.

**Key Features:**
- 🔍 **Canonical Repository Search**: Explore all of Canonical's public repositories
- 📊 **Repository Health Metrics**: Stars, forks, activity levels, and more
- 🎯 **Contributor-Friendly Filtering**: Find projects perfect for new contributors
- 📱 **Responsive Design**: Works beautifully on desktop and mobile
- ⚡ **Real-time Data**: Live GitHub API integration with smart caching

## 🚀 Live Demo

https://contrib-tracker.vercel.app/


## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Ubuntu-inspired theme
- **API**: GitHub REST API v3 with rate limiting
- **Testing**: Vitest + React Testing Library
- **Documentation**: Storybook for component development
- **Build Tool**: Vite for lightning-fast development

## 📸 Screenshots

### Main Application Views

#### Main Page (No Token)
![Main Page - No Token](/contrib-tracker-screenshots/main-page-notoken.png)
*The main interface when no GitHub token is configured - shows basic repository browsing capabilities*

#### Main Page (With Token)
![Main Page - With Token](/contrib-tracker-screenshots/main-page-token.png)
*Enhanced view with GitHub token - provides higher rate limits and additional features*

### Core Features

#### Repository Statistics
![Repository Stats](/contrib-tracker-screenshots/repo-stats.png)
*Detailed repository statistics showing stars, forks, issues, and activity metrics*

#### Issue Explorer
![Issue Explorer](/contrib-tracker-screenshots/issue-explorer.png)
*Browse and filter issues across Canonical repositories to find contribution opportunities*

#### Advanced Filters
![Advanced Filters](/contrib-tracker-screenshots/advance-filters.png)
*Powerful filtering options to narrow down repositories by language, activity, and other criteria*

### Personal Dashboard

#### Personal Contribution Dashboard
![Personal Dashboard](/contrib-tracker-screenshots/personal-contribution-dashboard.png)
*Personalized dashboard showing your contribution history*

### ✅ Core Functionality
- **Canonical Repository Search**: Browse through all of Canonical's public repositories
- **Advanced Filtering**: Filter by language, activity level, repository size
- **Real-time Data**: Live repository information from GitHub API
- **Responsive Design**: Works on all devices and screen sizes

### ✅ Developer Experience
- **TypeScript**: Fully typed for better development experience
- **Component Library**: Storybook documentation for all components
- **Testing**: Comprehensive unit tests with Vitest
- **Error Handling**: Graceful error states and user feedback

### ✅ Performance
- **Smart Caching**: Reduces API calls with intelligent caching
- **Rate Limiting**: Respects GitHub API limits
- **Debounced Search**: Optimized search with debouncing
- **Lazy Loading**: Efficient data loading and pagination

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub account (optional, for higher API rate limits)

### Installation

```bash
# Clone the repository
git clone https://github.com/The-Digital-Alchemist/canonical-contribution-tracker.git
cd canonical-contribution-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Optional: GitHub Token Setup

For higher API rate limits, create a GitHub personal access token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Create a `.env.local` file in the project root:
   ```
   VITE_GITHUB_TOKEN=your_token_here
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Start Storybook
npm run storybook

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Use

1. **Explore Canonical Repositories**: Browse through all of Canonical's public repositories
2. **Apply Filters**: Use advanced filters to find specific types of projects
3. **View Details**: Click on any repository for detailed information
4. **Discover Opportunities**: Find repositories with "good first issues" for new contributors

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Storybook

View and interact with components in isolation:

```bash
npm run storybook
```

This opens Storybook at `http://localhost:6006` where you can explore all components and their variations.

## 🎨 Customization

### Styling
The app uses Tailwind CSS with a custom Ubuntu-inspired theme. You can customize colors and styling in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles
- Component-specific CSS classes

### Adding New Features
The modular architecture makes it easy to add new features:
- Components in `src/components/`
- Hooks in `src/hooks/`
- API services in `src/services/`
- Types in `src/services/githubApi.ts`

### Development Guidelines
- Write tests for new features
- Follow the existing code style
- Update Storybook stories for new components
- Add TypeScript types for new functionality

## 🚧 Roadmap

### Short Term
- [X] Deploy to production (Vercel/Netlify)
- [ ] Add repository analytics charts
- [ ] Implement dark mode
- [ ] Add user preferences storage

### Medium Term
- [ ] **🎯 General Organization Support**: Allow searching any GitHub organization
- [ ] Backend API for caching and rate limiting
- [ ] User authentication with GitHub OAuth
- [ ] Repository comparison features



## 💡 Why I Built This

I built this as my gateway into open source. Not by reading docs, but by solving a real contributor problem.
The goal: help devs instantly find high-value Canonical projects with open issues and active communities.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Canonical** for inspiring this project and providing amazing open-source software
- **GitHub** for their excellent API
- The React and TypeScript communities
- All the open-source contributors who inspire this project

## 📞 Get in Touch

- **GitHub**: [The-Digital-alchemist](https://github.com/The-Digital-Alchemist)
- **LinkedIn**: [Murad Al-Balushi](https://www.linkedin.com/in/muradalbalushi/)
- **Email**: Murad2000Balushi@gmail.com

Feel free to reach out with questions, suggestions, or just to chat about open source!

---

**Built with love and some suffering by Murad**

*If this project helps you discover great open-source opportunities, consider giving it a ⭐!*
