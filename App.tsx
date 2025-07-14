
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProjectAnalysis, SearchResult, CodeQuality, ProjectStats } from './types';
import { RepoSearchForm } from './components/RepoSearchForm';
import { SearchResults } from './components/SearchResults';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ArrowLeftIcon, CheckCircleIcon, InformationCircleIcon, ExternalLinkIcon, GithubIcon, GithubOctocatIcon, RectangleGroupIcon, StarIcon, ForkIcon, ExclamationCircleIcon, ScaleIcon, XMarkIcon, DocumentTextIcon, SparklesIcon, CpuChipIcon, CommandLineIcon, ClipboardIcon, ClipboardCheckIcon, GlobeAltIcon, SearchIcon, CodeBracketIcon, ChevronDownIcon, LinkIcon, ArchiveBoxIcon } from './components/IconComponents';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

// Helper function to safely parse JSON from a string, even if it's wrapped in text or markdown code blocks.
const safeJsonParse = (text: string): any => {
  // Find the first '{' and the last '}' to handle cases where the AI wraps the JSON in text.
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    // Fallback for when the response is just the JSON without any wrappers
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("No valid JSON object found in the string, and direct parse failed.");
      return null;
    }
  }
  
  const jsonString = text.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse extracted JSON:", e, "Original text:", text);
    return null;
  }
};


// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (typeof num !== 'number') return 'N/A';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string }> = ({ icon, value, label }) => (
    <div className="relative overflow-hidden rounded-2xl p-px bg-gradient-to-b from-slate-700 to-slate-950/50 shadow-lg transition-transform duration-300 hover:-translate-y-1">
        <div className="bg-slate-900/80 backdrop-blur-sm p-4 h-full w-full rounded-[15px] flex flex-col items-center justify-center text-center">
          <div className="text-pink-500 mb-2">{icon}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-slate-300 font-medium">{label}</div>
        </div>
    </div>
);

const Gauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" />
                    <circle
                        cx="50" cy="50" r={radius}
                        className={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold text-white`}>{score}</span>
                </div>
            </div>
            <span className="text-sm text-slate-300 font-medium mt-2">{label}</span>
        </div>
    );
};

const ReadmeModal: React.FC<{ isOpen: boolean; onClose: () => void; initialContent: string; repoUrl: string; }> = ({ isOpen, onClose, initialContent, repoUrl }) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullLoaded, setIsFullLoaded] = useState(false);

  useEffect(() => {
    // Reset on close or when initial content changes
    setContent(initialContent);
    setIsFullLoaded(false);
    setError(null);
  }, [isOpen, initialContent]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleLoadFullReadme = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [owner, repo] = repoUrl.replace(/^https?:\/\/github.com\//, '').replace(/\.git$/, '').split('/');
      
      // Step 1: Get README metadata to find the download URL, avoiding API content limits.
      const metaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
      if (!metaResponse.ok) {
        const errorData = await metaResponse.json().catch(() => null);
        if (metaResponse.status === 404) {
             throw new Error('README.md not found in this repository.');
        }
        throw new Error(errorData?.message || 'Could not fetch README metadata from GitHub.');
      }
      const metaData = await metaResponse.json();
      const downloadUrl = metaData.download_url;

      if (!downloadUrl) {
          throw new Error('Could not find a download URL for the README file.');
      }
      
      // Step 2: Fetch the raw content from the download URL
      const contentResponse = await fetch(downloadUrl);
      if (!contentResponse.ok) {
        throw new Error('Could not download the full README content.');
      }
      
      const fullContent = await contentResponse.text();
      setContent(fullContent);
      setIsFullLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="readme-title"
    >
      <div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <h2 id="readme-title" className="text-xl font-bold text-white">README.md</h2>
          <div className="flex items-center gap-2">
            <a href={repoUrl.replace('.git', '')} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white text-sm font-medium p-2 rounded-lg hover:bg-slate-700/60 transition-colors inline-flex items-center gap-2" aria-label="View on GitHub">
              <GithubIcon className="h-5 w-5" /> View on GitHub
            </a>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Close README"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="p-6 overflow-y-auto prose-dark min-h-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </main>
        {!isFullLoaded && (
          <footer className="p-4 border-t border-slate-800 flex-shrink-0">
              {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
              <button
                onClick={handleLoadFullReadme}
                disabled={isLoading}
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? 'Loading...' : 'Load Full README'}
              </button>
          </footer>
        )}
      </div>
    </div>
  );
};

const FooterWave: React.FC = () => (
    <div className="fixed bottom-0 left-0 w-full z-10 pointer-events-none opacity-60">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
                <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(236, 72, 153, 0.25)" />
                <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(236, 72, 153, 0.15)" />
                <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(249, 115, 22, 0.1)" />
                <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(236, 72, 153, 0.05)" />
            </g>
        </svg>
    </div>
);


export const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<Partial<ProjectAnalysis>>({});
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<{ searching: boolean, analyzing: boolean }>({ searching: false, analyzing: false });
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isReadmeVisible, setIsReadmeVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);
  const [view, setView] = useState<'landing' | 'results' | 'analysis' | 'privacy' | 'terms'>('landing');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreSimilarTools, setHasMoreSimilarTools] = useState(true);
  const [isCodeDropdownOpen, setIsCodeDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const codeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (codeDropdownRef.current && !codeDropdownRef.current.contains(event.target as Node)) {
        setIsCodeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (query: string) => {
    setAnalysisData({});
    setSearchResults(null);
    setError(null);
    setIsLoading({ ...isLoading, searching: true });
    setCurrentQuery(query);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Find 5 relevant and popular public GitHub repositories related to the query: "${query}". Return ONLY a raw JSON object with a "results" key containing an array of objects. Each object must have "name" (e.g., 'facebook/react'), "url" (the full .git URL), and "description" (a one-sentence summary).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
          responseMimeType: "application/json", 
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                results: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            url: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ['name', 'url', 'description']
                    }
                }
            },
            required: ['results']
          } 
        },
      });

      const parsedData = safeJsonParse(response.text);
      setSearchResults(parsedData?.results || []);
      setView('results');

    } catch (e) {
      console.error(e);
      setError("Failed to search for repositories. Please try another query.");
    } finally {
      setIsLoading({ ...isLoading, searching: false });
    }
  };

  const handleAnalyzeRepo = async (url: string) => {
    setView('analysis');
    setIsLoading({ searching: false, analyzing: true });
    setAnalyzingUrl(url);
    setError(null);
    setAnalysisData({});
    setHasMoreSimilarTools(true); // Reset for new analysis

    try {
      // Step 1: Fetch real-time stats from GitHub API for accuracy and speed
      const urlParts = url.replace(/^https?:\/\/github.com\//, '').replace(/\.git$/, '').split('/');
      const [owner, repo] = urlParts;

      if (!owner || !repo) {
        throw new Error("Invalid GitHub repository URL.");
      }
      
      const githubApiResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!githubApiResponse.ok) {
        if (githubApiResponse.status === 404) {
          throw new Error("Repository not found on GitHub. Check the URL or if it's a private repository.");
        }
        throw new Error(`Failed to fetch data from GitHub API (Status: ${githubApiResponse.status}).`);
      }
      const repoData = await githubApiResponse.json();
      
      const stats: ProjectStats = {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          openIssues: repoData.open_issues_count,
          license: repoData.license?.name || 'N/A',
          defaultBranch: repoData.default_branch,
      };

      // Immediately update the UI with the project name, URL, and stats
      setAnalysisData({
          projectName: repoData.full_name,
          repoUrl: repoData.html_url,
          stats: stats,
      });

      // Step 2: Get qualitative analysis from Gemini in a single, reliable call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a deep analysis of the GitHub repository: ${repoData.full_name} (${repoData.html_url}).
Based on its public information, generate a comprehensive overview.
Do NOT include project name, URL, or stats like stars, forks, issues, or license. I already have that data.
For similarTools, provide exactly 3 relevant alternatives.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "A concise, one-paragraph summary of the project." },
              keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of the most important features or capabilities." },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of key technologies, languages, and frameworks used." },
              usageInstructions: { type: Type.STRING, description: "A string containing simplified setup and basic usage commands, formatted for a terminal." },
              readmeContent: { type: Type.STRING, description: "A comprehensive summary of the README.md file, preserving markdown formatting." },
              similarTools: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ['name', 'description', 'url']
                },
                description: "An array of objects for 3 similar or alternative tools."
              },
              codeQuality: {
                type: Type.OBJECT,
                properties: {
                  qualityScore: { type: Type.NUMBER, description: "A score from 0-100 for overall code quality." },
                  maintainabilityScore: { type: Type.NUMBER, description: "A score from 0-100 for code maintainability." },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of positive aspects of the codebase." },
                  areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of actionable suggestions for improvement." }
                },
                required: ['qualityScore', 'maintainabilityScore', 'strengths', 'areasForImprovement']
              }
            }
          }
        }
      });
      
      const analysisJson = safeJsonParse(response.text);
      if (analysisJson) {
        setAnalysisData(prev => ({ ...prev, ...analysisJson }));
      } else {
        throw new Error("The AI returned an invalid analysis format. Please try again.");
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(errorMessage);
    } finally {
        setIsLoading({ searching: false, analyzing: false });
        setAnalyzingUrl(null);
    }
  };

  const handleLoadMoreSimilarTools = async () => {
    if (!analysisData.projectName || !analysisData.similarTools) return;
    
    setIsLoadingMore(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const existingTools = analysisData.similarTools.map(t => t.name).join(', ');
      const prompt = `Find 3 more open-source tools similar to ${analysisData.projectName}. Do not include any of these already listed tools: ${existingTools}. Provide a brief, one-sentence description for each. Return ONLY a raw JSON object with a "tools" key containing an array of objects. Each object must have "name", "description", and "url".`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tools: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ['name', 'description', 'url']
                }
              }
            },
            required: ['tools']
          }
        }
      });

      const parsedData = safeJsonParse(response.text);
      const newTools = parsedData?.tools || [];

      if (newTools.length > 0) {
        setAnalysisData(prev => ({
          ...prev,
          similarTools: [...(prev.similarTools || []), ...newTools]
        }));
      }

      if (newTools.length < 3) {
        setHasMoreSimilarTools(false);
      }

    } catch (e) {
      console.error(e);
      setError("Failed to load more similar tools.");
    } finally {
      setIsLoadingMore(false);
    }
  };


  const handleReset = () => {
    setView('landing');
    setAnalysisData({});
    setSearchResults(null);
    setError(null);
  };
  
  const handleBackToSearch = () => {
    setView('results');
    setAnalysisData({});
    setError(null);
  }

  const handleCopyUsage = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleCopyUrl = () => {
    if (!analysisData.repoUrl) return;
    const cloneUrl = analysisData.repoUrl.replace(/\/?$/, '.git');
    navigator.clipboard.writeText(cloneUrl);
    setIsUrlCopied(true);
    setTimeout(() => {
      setIsUrlCopied(false);
      setIsCodeDropdownOpen(false);
    }, 2000);
  };

  const renderContent = () => {
    switch(view) {
      case 'privacy':
        return <PrivacyPolicy onBack={() => setView('landing')} />;
      case 'terms':
        return <TermsOfService onBack={() => setView('landing')} />;
      case 'analysis':
        return (
          <div>
            {isLoading.analyzing && <LoadingIndicator />}
            
            {Object.keys(analysisData).length > 0 && 
            <div className="animate-fade-in">
             {searchResults && (
                <div className="mb-6">
                    <button
                        onClick={handleBackToSearch}
                        className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Search Results
                    </button>
                </div>
            )}
            {analysisData.projectName && (
              <header className="mb-8 text-center relative">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{analysisData.projectName}</h1>
                <a href={analysisData.repoUrl} target="_blank" rel="noopener noreferrer" className="text-lg text-pink-500/80 font-medium hover:underline inline-flex items-center justify-center gap-2">
                  <GithubIcon className="h-5 w-5" />
                  <span>{analysisData.repoUrl?.replace(/^https?:\/\/github.com\//, '')}</span>
               </a>
              </header>
            )}

            {analysisData.stats && (
              <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <StatCard icon={<StarIcon className="h-7 w-7" />} value={formatNumber(analysisData.stats.stars)} label="Stars" />
                  <StatCard icon={<ForkIcon className="h-7 w-7" />} value={formatNumber(analysisData.stats.forks)} label="Forks" />
                  <StatCard icon={<ExclamationCircleIcon className="h-7 w-7" />} value={formatNumber(analysisData.stats.openIssues)} label="Open Issues" />
                  <StatCard icon={<ScaleIcon className="h-7 w-7" />} value={analysisData.stats.license} label="License" />
              </div>
            )}
            
            <div className="flex flex-col gap-8">
                {analysisData.description && (
                  <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center"><DocumentTextIcon className="h-6 w-6 mr-3 text-pink-500"/>Project Summary</h2>
                      <p className="text-lg leading-relaxed">{analysisData.description}</p>
                  </section>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {analysisData.keyFeatures && (
                      <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                          <h2 className="text-xl font-bold text-white mb-4 flex items-center"><SparklesIcon className="h-6 w-6 mr-3 text-pink-500"/>Key Features</h2>
                          <ul className="space-y-3">
                              {analysisData.keyFeatures?.map((feature, index) => (
                              <li key={index} className="flex items-start text-base">
                                  <CheckCircleIcon className="text-pink-500 mr-3 mt-1 flex-shrink-0 h-5 w-5" />
                                  <span>{feature}</span>
                              </li>
                              ))}
                          </ul>
                      </section>
                    )}
                    {analysisData.techStack && (
                      <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                          <h2 className="text-xl font-bold text-white mb-4 flex items-center"><CpuChipIcon className="h-6 w-6 mr-3 text-pink-500"/>Technology Stack</h2>
                          <ul className="flex flex-wrap gap-2">
                              {analysisData.techStack?.map((tech) => (
                              <li key={tech} className="bg-slate-700 text-slate-200 text-sm font-medium px-3 py-1 rounded-full transition-colors hover:bg-slate-600">{tech}</li>
                              ))}
                          </ul>
                      </section>
                    )}
                </div>
                
                {analysisData.usageInstructions && (
                  <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center"><CommandLineIcon className="h-6 w-6 mr-3 text-pink-500"/>Getting Started</h2>
                      <div className="bg-slate-950/70 rounded-lg border border-slate-800 overflow-hidden mb-4 shadow-inner relative group">
                          <div className="bg-slate-800/50 px-4 py-2 text-xs text-slate-300 font-mono select-none flex justify-between items-center">
                              <span>/bin/bash</span>
                              <button
                                onClick={() => handleCopyUsage(analysisData.usageInstructions ?? '')}
                                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors disabled:cursor-not-allowed"
                                aria-label={isCopied ? "Copied!" : "Copy code"}
                              >
                                {isCopied ? <ClipboardCheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                                {isCopied ? 'Copied!' : 'Copy'}
                              </button>
                          </div>
                          <pre className="p-4 text-slate-200 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                              <code>{analysisData.usageInstructions}</code>
                          </pre>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        {analysisData.readmeContent && (
                          <button
                              onClick={() => setIsReadmeVisible(true)}
                              className="flex-1 text-center bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                          >
                              View README.md
                          </button>
                        )}
                        {analysisData.repoUrl && analysisData.stats?.defaultBranch && (
                          <div ref={codeDropdownRef} className="relative flex-1">
                              <button
                                  onClick={() => setIsCodeDropdownOpen(prev => !prev)}
                                  className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                              >
                                  <CodeBracketIcon className="h-5 w-5" />
                                  Code
                                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${isCodeDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {isCodeDropdownOpen && (
                                  <div className="absolute bottom-full mb-2 right-0 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl animate-fade-in-fast z-10">
                                      <div className="p-2 space-y-1">
                                          <button
                                              onClick={handleCopyUrl}
                                              disabled={isUrlCopied}
                                              className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-70"
                                          >
                                              <LinkIcon className="h-5 w-5 text-slate-400 flex-shrink-0"/>
                                              <div>
                                                  <p className="font-semibold text-white">{isUrlCopied ? 'Copied!' : 'Copy HTTPS URL'}</p>
                                              </div>
                                          </button>
                                          <a
                                              href={`${analysisData.repoUrl}/archive/refs/heads/${analysisData.stats.defaultBranch}.zip`}
                                              download
                                              className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-slate-700 transition-colors"
                                          >
                                              <ArchiveBoxIcon className="h-5 w-5 text-slate-400 flex-shrink-0"/>
                                              <div>
                                                  <p className="font-semibold text-white">Download ZIP</p>
                                              </div>
                                          </a>
                                      </div>
                                  </div>
                              )}
                          </div>
                        )}
                      </div>
                  </section>
                )}
                
                {analysisData.codeQuality && (
                  <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                      <h2 className="text-xl font-bold text-white mb-6">Code Quality Analysis</h2>
                      <div className="flex justify-around items-center mb-8 flex-wrap gap-4">
                          <Gauge score={analysisData.codeQuality.qualityScore} label="Quality" />
                          <Gauge score={analysisData.codeQuality.maintainabilityScore} label="Maintainability" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <h3 className="font-bold text-white mb-3 flex items-center">
                                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400"/> Strengths
                              </h3>
                              <ul className="space-y-2 text-slate-200 text-sm list-disc list-inside">
                                  {analysisData.codeQuality.strengths?.map((item, index) => <li key={index}>{item}</li>)}
                              </ul>
                          </div>
                          <div>
                              <h3 className="font-bold text-white mb-3 flex items-center">
                                  <InformationCircleIcon className="h-5 w-5 mr-2 text-yellow-400"/> Areas for Improvement
                              </h3>
                              <ul className="space-y-2 text-slate-200 text-sm list-disc list-inside">
                                  {analysisData.codeQuality.areasForImprovement?.map((item, index) => <li key={index}>{item}</li>)}
                              </ul>
                          </div>
                      </div>
                  </section>
                )}
              
                {analysisData.similarTools && analysisData.similarTools.length > 0 && (
                  <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <RectangleGroupIcon className="h-5 w-5 mr-3 text-pink-500" />
                        Similar Tools
                    </h2>
                    <ul className="space-y-2">
                        {analysisData.similarTools.map((tool) => (
                          <li key={tool.name}>
                          <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-slate-200 group block p-3 -m-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <h3 className="font-bold text-slate-200 group-hover:text-pink-500 transition-colors flex items-center">
                              {tool.name}
                              <ExternalLinkIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-sm text-slate-300 mt-1">{tool.description}</p>
                          </a>
                        </li>
                        ))}
                    </ul>
                    {hasMoreSimilarTools && (
                        <div className="mt-4">
                          <button
                            onClick={handleLoadMoreSimilarTools}
                            disabled={isLoadingMore}
                            className="w-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                          >
                            {isLoadingMore ? 'Loading More...' : 'Load More'}
                          </button>
                        </div>
                    )}
                  </section>
                )}
            </div>
            
            {analysisData?.readmeContent && analysisData?.repoUrl && (
              <ReadmeModal
                isOpen={isReadmeVisible}
                onClose={() => setIsReadmeVisible(false)}
                initialContent={analysisData.readmeContent}
                repoUrl={analysisData.repoUrl}
              />
            )}
            </div>
            }
          </div>
        );
      case 'results':
      case 'landing':
      default:
        return (
          <div className="text-center">
            {view === 'landing' && (
              <header className="my-12">
                <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500" style={{textShadow: '0 0 20px rgba(236,72,153,0.5)'}}>Deep Dive into Any GitHub Repo</h1>
                <p className="text-xl text-slate-300 font-medium">Get a complete analysis—from tech stack to code quality—in seconds.</p>
              </header>
            )}
            <RepoSearchForm ref={searchInputRef} onSubmit={handleSearchSubmit} loading={isLoading.searching} initialQuery={currentQuery} />
            <ErrorMessage message={error} />
            {isLoading.searching && <div className="text-white mt-8">Searching...</div>}
            {searchResults && <SearchResults results={searchResults} onAnalyze={handleAnalyzeRepo} analyzingUrl={analyzingUrl} />}
          </div>
        );
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col">
        <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <GithubOctocatIcon className="h-8 w-8 text-white"/>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500">
                            GitHub Project Analyzer
                        </h1>
                    </div>
                    {view !== 'landing' && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30"
                        aria-label="Start a new search"
                      >
                        <SearchIcon className="h-4 w-4" />
                        New Search
                      </button>
                    )}
                </div>
            </div>
        </header>
        
        <main className="relative z-20 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-grow">
          {renderContent()}
        </main>
      </div>
      
      <footer className="relative z-20 text-center py-6 px-4 text-sm text-slate-400/80 mt-auto flex-shrink-0">
        <p className="mb-2">
          Made with ❤️ by <a href="https://www.guyc.dev" target="_blank" rel="noopener noreferrer" className="font-medium text-pink-400 hover:underline">Guy Chenya</a> for educational purposes.
        </p>
        <div className="flex justify-center items-center gap-x-4">
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <span className="text-slate-600">&bull;</span>
            <button onClick={() => setView('terms')} className="hover:text-white transition-colors">Terms of Service</button>
        </div>
      </footer>

      <FooterWave />
      
      <style>
      {`
        .prose-dark { color: #f1f5f9; line-height: 1.75; }
        .prose-dark p { font-size: 1.125rem; margin-bottom: 1.25em; }
        .prose-dark h1, .prose-dark h2, .prose-dark h3, .prose-dark h4, .prose-dark h5, .prose-dark h6 { color: #ffffff; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.75em; letter-spacing: -0.02em; }
        .prose-dark h1 { font-size: 2.25rem; } .prose-dark h2 { font-size: 1.875rem; } .prose-dark h3 { font-size: 1.5rem; }
        .prose-dark a { color: #f472b6; text-decoration: none; }
        .prose-dark a:hover { text-decoration: underline; }
        .prose-dark strong { color: #ffffff; font-weight: 600; }
        .prose-dark blockquote { margin: 1.5em 0; padding-left: 1em; border-left: 4px solid #475569; color: #cbd5e1; font-style: italic; }
        .prose-dark ul, .prose-dark ol { margin: 1em 0; padding-left: 2em; font-size: 1.125rem;}
        .prose-dark ul { list-style-type: disc; } .prose-dark ol { list-style-type: decimal; }
        .prose-dark li { margin-bottom: 0.5em; }
        .prose-dark code { background-color: #374151; color: #f9a8d4; padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .prose-dark pre { background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1em; overflow-x: auto; margin: 1.5em 0; white-space: pre-wrap; word-break: break-word; }
        .prose-dark pre code { background-color: transparent; color: inherit; padding: 0; margin: 0; font-size: inherit; border-radius: 0; }
        .prose-dark hr { border-color: #4b5563; margin: 2em 0; }
        .prose-dark table { width: 100%; margin: 1.5em 0; border-collapse: collapse; }
        .prose-dark th, .prose-dark td { border: 1px solid #4b5563; padding: 0.5em 1em; }
        .prose-dark th { font-weight: 600; background-color: #374151; }
        .prose-dark img { max-width: 100%; border-radius: 8px; margin: 1.5em 0; }
      `}
      </style>
    </div>
  );
};
