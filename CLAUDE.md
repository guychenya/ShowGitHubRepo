# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Live Demo:** [Deployed on Netlify](https://showgithubrepo.netlify.app)

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server 
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build

## Environment Setup

This app requires a `GEMINI_API_KEY` environment variable to be set in `.env.local` for the Google Gemini AI integration.

## Architecture

This is a React TypeScript application built with Vite that analyzes GitHub repositories using the Google Gemini AI API. The app consists of:

### Core Components
- **App.tsx** - Main application component containing all state management and UI routing
- **RepoSearchForm** - Search input for finding GitHub repositories
- **SearchResults** - Displays search results with analyze buttons
- **ReadmeModal** - Modal for displaying README content with full content loading
- Various utility components (ErrorMessage, LoadingIndicator, etc.)

### Key Features
- GitHub repository search using AI
- Real-time repository analysis fetching live stats from GitHub API
- Code quality analysis with scoring gauges
- README content display with full loading capability
- Similar tools discovery
- Responsive design with animated UI elements

### Data Flow
1. User searches for repositories via AI-powered search
2. Results are displayed with analyze options
3. When analyzing, the app fetches real GitHub API data for accuracy
4. AI provides qualitative analysis (description, features, tech stack, code quality)
5. Additional similar tools can be loaded dynamically

### State Management
All state is managed in the main App component using React hooks. No external state management library is used.

### Styling
Uses Tailwind CSS classes with custom CSS for markdown rendering and wave animations. The design features a dark theme with pink/orange gradients.

### API Integration
- GitHub API for real repository statistics and metadata
- Google Gemini AI for repository analysis and search functionality
- Environment variable `GEMINI_API_KEY` is accessed via `process.env.API_KEY` through Vite config