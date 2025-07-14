
import React from 'react';
import type { SearchResult } from '../types';
import { GithubIcon } from './IconComponents';

interface SearchResultsProps {
    results: SearchResult[];
    onAnalyze: (url: string) => void;
    analyzingUrl: string | null;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onAnalyze, analyzingUrl }) => {
    if (results.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <p>No repositories found. Try a different search term.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 max-w-2xl mx-auto space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-white text-left">Search Results</h2>
            {results.map((result) => {
                const isAnalyzing = analyzingUrl === result.url;
                return (
                    <div key={result.url} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                        <GithubIcon className="h-8 w-8 text-slate-300 flex-shrink-0 mt-1 sm:mt-0"/>
                        <div className="flex-grow">
                            <h3 className="font-bold text-pink-500">{result.name}</h3>
                            <p className="text-slate-200 text-sm mt-1">{result.description}</p>
                        </div>
                        <button
                            onClick={() => onAnalyze(result.url)}
                            disabled={isAnalyzing}
                            className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto flex-shrink-0"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};