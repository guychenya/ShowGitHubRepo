import React from 'react';
import { GithubOctocatIcon } from './IconComponents';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center">
        <div className="absolute h-32 w-32 rounded-full bg-pink-500/30 blur-2xl animate-pulse"></div>
        <div className="absolute h-24 w-24 rounded-full animate-spin [animation-duration:3s]">
            <div className="absolute h-full w-full rounded-full bg-gradient-to-r from-pink-500 via-transparent to-transparent"></div>
        </div>
        <GithubOctocatIcon className="relative inline-flex rounded-full h-20 w-20 text-white" />
        <p className="mt-8 text-lg font-medium text-white tracking-widest animate-pulse">ANALYZING...</p>
      </div>
    </div>
  );
};