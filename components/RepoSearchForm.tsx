
import React, { useState, useEffect } from 'react';
import { SearchIcon } from './IconComponents';

interface RepoSearchFormProps {
  onSubmit: (query: string) => void;
  loading: boolean;
  initialQuery: string;
}

export const RepoSearchForm = React.forwardRef<HTMLInputElement, RepoSearchFormProps>(
  ({ onSubmit, loading, initialQuery }, ref) => {
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
      setQuery(initialQuery);
    }, [initialQuery]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (query && !loading) {
        onSubmit(query);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mb-12 w-full max-w-2xl mx-auto" aria-label="Search for GitHub Repositories">
        <div className="relative">
          <input
            ref={ref}
            id="github-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects (e.g., 'react') or press ⌘K"
            className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg py-3 pl-4 pr-48 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-lg"
            disabled={loading}
            aria-label="Repository search query"
            aria-describedby="submit-button"
            required
          />
          <div className="absolute top-1/2 right-[150px] -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
            <kbd className="text-xs font-sans text-slate-400 border border-slate-600 rounded-md px-1.5 py-0.5">⌘K</kbd>
          </div>
          <button
            id="submit-button"
            type="submit"
            disabled={loading || !query}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40"
          >
            <SearchIcon className="h-5 w-5 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    );
  }
);
