
import React, { useState, useEffect, useRef } from 'react';
import { Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProjectAnalysis, SearchResult, CodeQuality, ProjectStats } from './types';
import { RepoSearchForm } from './components/RepoSearchForm';
import { SearchResults } from './components/SearchResults';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ArrowLeftIcon, CheckCircleIcon, InformationCircleIcon, ExternalLinkIcon, GithubIcon, GithubOctocatIcon, RectangleGroupIcon, StarIcon, ForkIcon, ExclamationCircleIcon, ScaleIcon, XMarkIcon, DocumentTextIcon, SparklesIcon, CpuChipIcon, CommandLineIcon, ClipboardIcon, ClipboardCheckIcon, GlobeAltIcon, SearchIcon, CodeBracketIcon, ChevronDownIcon, LinkIcon, ArchiveBoxIcon, CogIcon } from './components/IconComponents';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ApiKeyConfig } from './components/ApiKeyConfig';
import { CollapsibleSection } from './components/CollapsibleSection';
import { FeatureCard } from './components/FeatureCard';
import { Tooltip } from './components/Tooltip';
import { Chat } from './components/Chat';
import { generateContent, getActiveProvider, setApiKeys, getApiKeys } from './llm-service';

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

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; tooltip?: string }> = ({ icon, value, label, tooltip }) => (
    <div className="relative overflow-hidden rounded-xl p-px bg-gradient-to-b from-slate-700 to-slate-950/50 shadow-lg transition-transform duration-300 hover:-translate-y-1">
        <div className="bg-slate-900/80 backdrop-blur-sm p-3 h-full w-full rounded-[14px] flex flex-col items-center justify-center text-center">
          <div className="text-pink-500 mb-1.5 flex items-center gap-1">
            {icon}
            {tooltip && <Tooltip content={tooltip} />}
          </div>
          <div className="text-xl font-bold text-white">{value}</div>
          <div className="text-xs text-slate-300 font-medium">{label}</div>
        </div>
    </div>
);

const Gauge: React.FC<{ score: number; label: string; tooltip?: string }> = ({ score, label, tooltip }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} className="text-slate-700" strokeWidth="8" stroke="currentColor" fill="transparent" />
                    <circle
                        cx="50" cy="50" r={radius}
                        className={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold text-white`}>{score}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-xs text-slate-300 font-medium">{label}</span>
              {tooltip && <Tooltip content={tooltip} />}
            </div>
        </div>
    );
};

const ReadmeModal: React.FC<{ isOpen: boolean; onClose: () => void; initialContent: string; repoUrl: string; }> = ({ isOpen, onClose, initialContent, repoUrl }) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  useEffect(() => {
    // Reset on close or when initial content changes
    setContent(initialContent);
    setIsFullLoaded(false);
    setError(null);
    
    // Auto-load full README if initial content is empty or too short
    if (isOpen && initialContent.trim().length < 50) {
      handleLoadFullReadme();
    }
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center z-50 p-4 animate-fade-in-fast overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="readme-title"
    >
      <div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8 flex flex-col relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
      >
        <header className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0 sticky top-0 bg-slate-900/95 backdrop-blur-xl rounded-t-2xl z-10">
          <h2 id="readme-title" className="text-xl font-bold text-white">README.md</h2>
          <div className="flex items-center gap-2">
            <a href={repoUrl.replace('.git', '')} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white text-sm font-medium p-2 rounded-lg hover:bg-slate-700/60 transition-colors inline-flex items-center gap-2" aria-label="View on GitHub">
              <GithubIcon className="h-5 w-5" /> View on GitHub
            </a>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Close README"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="p-6 overflow-y-auto prose-dark flex-grow">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({node, inline, className, children, ...props}) => {
                  const codeString = String(children).replace(/\n$/, '');
                  return inline ? (
                    <code className={className} {...props}>{children}</code>
                  ) : (
                    <div className="relative group">
                      <button
                        onClick={() => handleCopyCode(codeString)}
                        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy code"
                      >
                        {copiedCode === codeString ? (
                          <ClipboardCheckIcon className="h-4 w-4 text-green-400" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4 text-slate-300" />
                        )}
                      </button>
                      <pre><code className={className} {...props}>{children}</code></pre>
                    </div>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
        </main>
        {!isFullLoaded && (
          <footer className="p-4 border-t border-slate-800 flex-shrink-0 sticky bottom-0 bg-slate-900/95 backdrop-blur-xl rounded-b-2xl">
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
  const [isApiKeyConfigOpen, setIsApiKeyConfigOpen] = useState(false);
  const [showAllSimilarTools, setShowAllSimilarTools] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const codeDropdownRef = useRef<HTMLDivElement>(null);

  // Check API key on app load
  useEffect(() => {
    const provider = getActiveProvider();
    if (!provider) {
      setError("No API key configured. Please add at least one API key (GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY) to your .env.local file.");
    } else {
      console.log(`Using ${provider.toUpperCase()} as LLM provider`);
    }
  }, []);

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
      const prompt = `Find 5 relevant and popular public GitHub repositories related to the query: "${query}". Return ONLY a raw JSON object with a "results" key containing an array of objects. Each object must have "name" (e.g., 'facebook/react'), "url" (the full .git URL), and "description" (a one-sentence summary).`;
      
      const schema = {
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
      };

      const responseText = await generateContent(prompt, schema);
      const parsedData = safeJsonParse(responseText);
      setSearchResults(parsedData?.results || []);
      setView('results');

    } catch (e) {
      console.error("Search error:", e);
      let errorMessage = "Failed to search for repositories. Please try another query.";
      
      if (e instanceof Error) {
        if (e.message.includes("API key") || e.message.includes("No API key")) {
          errorMessage = "⚠️ No valid API key found. Please click Settings (⚙️) to add your API key.";
        } else if (e.message.includes("403") || e.message.includes("401") || e.message.includes("INVALID") || e.message.includes("expired")) {
          errorMessage = "⚠️ Invalid or expired API key. Please click Settings (⚙️) to update your API key.";
        } else if (e.message.includes("quota")) {
          errorMessage = "API quota exceeded. Please try again later.";
        }
      }
      
      setError(errorMessage);
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

      // Step 2: Get qualitative analysis from LLM in a single, reliable call
      const prompt = `Perform a deep analysis of the GitHub repository: ${repoData.full_name} (${repoData.html_url}).
Based on its public information, generate a comprehensive overview.
Do NOT include project name, URL, or stats like stars, forks, issues, or license. I already have that data.
For similarTools, provide exactly 3 relevant alternatives.`;

      const schema = {
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
      };

      const responseText = await generateContent(prompt, schema);
      console.log("Raw AI response:", responseText);
      const analysisJson = safeJsonParse(responseText);
      console.log("Parsed analysis data:", analysisJson);
      
      if (analysisJson) {
        console.log("Setting analysis data...");
        setAnalysisData(prev => {
          const newData = { ...prev, ...analysisJson };
          console.log("New analysis data:", newData);
          return newData;
        });
      } else {
        throw new Error("The AI returned an invalid analysis format. Please try again.");
      }

    } catch (e) {
      console.error("Analysis error:", e);
      let errorMessage = "An unknown error occurred during analysis.";
      
      if (e instanceof Error) {
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);
        
        if (e.message.includes("API key") || e.message.includes("No API key")) {
          errorMessage = "⚠️ No valid API key found. Please click Settings (⚙️) to add your API key.";
        } else if (e.message.includes("403") || e.message.includes("401") || e.message.includes("INVALID") || e.message.includes("expired")) {
          errorMessage = "⚠️ Invalid or expired API key. Please click Settings (⚙️) to update your API key.";
        } else if (e.message.includes("quota")) {
          errorMessage = "API quota exceeded. Please try again later or use a different API key.";
        } else if (e.message.includes("404")) {
          errorMessage = e.message;
        } else {
          errorMessage = `Analysis failed: ${e.message}`;
        }
      }
      
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
      const existingTools = analysisData.similarTools.map(t => t.name).join(', ');
      const prompt = `Find 3 more open-source tools similar to ${analysisData.projectName}. Do not include any of these already listed tools: ${existingTools}. Provide a brief, one-sentence description for each. Return ONLY a raw JSON object with a "tools" key containing an array of objects. Each object must have "name", "description", and "url".`;

      const schema = {
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
      };

      const responseText = await generateContent(prompt, schema);
      const parsedData = safeJsonParse(responseText);
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

  const handleSaveApiKeys = (keys: { gemini?: string; groq?: string; openai?: string }) => {
    setApiKeys(keys);
    setError(null);
  };

  const handleChatMessage = async (message: string): Promise<string> => {
    const context = `Repository: ${analysisData.projectName}
Description: ${analysisData.description}
Tech Stack: ${analysisData.techStack?.join(', ')}
Key Features: ${analysisData.keyFeatures?.join(', ')}

User Question: ${message}

Provide a helpful, concise answer. Use markdown formatting, emojis, and code blocks where appropriate. Return ONLY the answer text, not JSON.`;

    try {
      const response = await generateContent(context);
      
      // Parse if it's JSON wrapped
      try {
        const parsed = JSON.parse(response);
        if (parsed.answer) return parsed.answer;
        if (parsed.response) return parsed.response;
        if (parsed.content) return parsed.content;
      } catch {
        // Not JSON, return as-is
      }
      
      return response;
    } catch (error) {
      throw new Error('Failed to get response');
    }
  };

  const renderContent = () => {
    switch(view) {
      case 'privacy':
        return <PrivacyPolicy onBack={() => setView('landing')} />;
      case 'terms':
        return <TermsOfService onBack={() => setView('landing')} />;
      case 'analysis':
        return (
          <div className="w-full">
            {isLoading.analyzing && <LoadingIndicator />}
            <ErrorMessage message={error} />
            
            {(analysisData.projectName || Object.keys(analysisData).length > 0) && 
            <div className="animate-fade-in w-full">
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
              <>
                <header className="mb-6 text-center relative">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{analysisData.projectName}</h1>
                  <a href={analysisData.repoUrl} target="_blank" rel="noopener noreferrer" className="text-base text-pink-500/80 font-medium hover:underline inline-flex items-center justify-center gap-2">
                    <GithubIcon className="h-5 w-5" />
                    <span>{analysisData.repoUrl?.replace(/^https?:\/\/github.com\//, '')}</span>
                  </a>
                </header>
                
                {/* Sticky Action Bar */}
                <div className="sticky top-16 z-20 mb-6 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl p-3 shadow-lg">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <a 
                      href={analysisData.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <GithubIcon className="h-4 w-4" />
                      View on GitHub
                    </a>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      Ask AI
                    </button>
                    {analysisData.readmeContent && (
                      <button
                        onClick={() => setIsReadmeVisible(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        View README
                      </button>
                    )}
                    {analysisData.repoUrl && analysisData.stats?.defaultBranch && (
                      <a
                        href={`${analysisData.repoUrl}/archive/refs/heads/${analysisData.stats.defaultBranch}.zip`}
                        download
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                        Download ZIP
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}

            {analysisData.stats && (
              <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <StatCard 
                    icon={<StarIcon className="h-7 w-7" />} 
                    value={formatNumber(analysisData.stats.stars)} 
                    label="Stars" 
                    tooltip="GitHub stars indicate popularity and community interest"
                  />
                  <StatCard 
                    icon={<ForkIcon className="h-7 w-7" />} 
                    value={formatNumber(analysisData.stats.forks)} 
                    label="Forks" 
                    tooltip="Number of times this repository has been forked"
                  />
                  <StatCard 
                    icon={<ExclamationCircleIcon className="h-7 w-7" />} 
                    value={formatNumber(analysisData.stats.openIssues)} 
                    label="Open Issues" 
                    tooltip="Currently open issues and pull requests"
                  />
                  <StatCard 
                    icon={<ScaleIcon className="h-7 w-7" />} 
                    value={analysisData.stats.license} 
                    label="License" 
                    tooltip="Software license type for this project"
                  />
              </div>
            )}
            
            <div className="flex flex-col gap-6">
                {analysisData.description && (
                  <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                      <h2 className="text-lg font-bold text-white mb-3 flex items-center"><DocumentTextIcon className="h-5 w-5 mr-2 text-pink-500"/>Project Summary</h2>
                      <p className="text-base leading-relaxed">{analysisData.description}</p>
                  </section>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisData.keyFeatures && (
                      <CollapsibleSection 
                        title="Key Features" 
                        icon={<SparklesIcon className="h-6 w-6" />}
                        defaultOpen={true}
                      >
                        <div className="grid gap-3">
                          {analysisData.keyFeatures?.map((feature, index) => (
                            <FeatureCard
                              key={index}
                              title={`Feature ${index + 1}`}
                              description={feature}
                            />
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}
                    {analysisData.techStack && (
                      <CollapsibleSection 
                        title="Technology Stack" 
                        icon={<CpuChipIcon className="h-6 w-6" />}
                        defaultOpen={true}
                      >
                        <div className="flex flex-wrap gap-2">
                          {analysisData.techStack?.map((tech) => (
                            <span key={tech} className="bg-slate-700 text-slate-200 text-sm font-medium px-3 py-2 rounded-full transition-all hover:bg-slate-600 hover:scale-105 cursor-default">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}
                </div>
                
                {analysisData.usageInstructions && (
                  <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                      <h2 className="text-lg font-bold text-white mb-3 flex items-center"><CommandLineIcon className="h-5 w-5 mr-2 text-pink-500"/>Getting Started</h2>
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
                                              href={`x-github-client://openRepo/${analysisData.repoUrl}`}
                                              className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-slate-700 transition-colors"
                                          >
                                              <GithubIcon className="h-5 w-5 text-slate-400 flex-shrink-0"/>
                                              <div>
                                                  <p className="font-semibold text-white">Open with GitHub Desktop</p>
                                              </div>
                                          </a>
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
                  <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-pink-500/10">
                      <h2 className="text-lg font-bold text-white mb-5">Code Quality Analysis</h2>
                      <div className="flex justify-around items-center mb-6 flex-wrap gap-4">
                          <Gauge 
                            score={analysisData.codeQuality.qualityScore} 
                            label="Quality" 
                            tooltip="Overall code quality score based on best practices, structure, and patterns"
                          />
                          <Gauge 
                            score={analysisData.codeQuality.maintainabilityScore} 
                            label="Maintainability" 
                            tooltip="How easy it is to maintain and update this codebase"
                          />
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
                  <CollapsibleSection 
                    title="Similar Tools & Alternatives" 
                    icon={<RectangleGroupIcon className="h-5 w-5" />}
                    defaultOpen={true}
                  >
                    <div className="space-y-2">
                        {(showAllSimilarTools ? analysisData.similarTools : analysisData.similarTools.slice(0, 3)).map((tool) => (
                          <a 
                            key={tool.name}
                            href={tool.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-200 group block p-4 rounded-lg hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700"
                          >
                            <h3 className="font-bold text-lg text-slate-200 group-hover:text-pink-500 transition-colors flex items-center">
                              {tool.name}
                              <ExternalLinkIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{tool.description}</p>
                          </a>
                        ))}
                    </div>
                    {analysisData.similarTools.length > 3 && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setShowAllSimilarTools(!showAllSimilarTools)}
                          className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        >
                          {showAllSimilarTools ? 'Show Less' : `Show ${analysisData.similarTools.length - 3} More`}
                        </button>
                        {hasMoreSimilarTools && (
                          <button
                            onClick={handleLoadMoreSimilarTools}
                            disabled={isLoadingMore}
                            className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                          >
                            {isLoadingMore ? 'Loading...' : 'Load More'}
                          </button>
                        )}
                      </div>
                    )}
                  </CollapsibleSection>
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
              <header className="my-10">
                <div className="mb-4 text-6xl animate-bounce">🔍</div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500" style={{textShadow: '0 0 20px rgba(236,72,153,0.5)'}}>Deep Dive into Any GitHub Repo</h1>
                <p className="text-lg text-slate-300 font-medium mb-2">Get a complete analysis—from tech stack to code quality—in seconds.</p>
                <p className="text-sm text-slate-400">✨ Powered by AI • 🚀 Lightning Fast • 🎯 Accurate Insights</p>
              </header>
            )}
            <RepoSearchForm ref={searchInputRef} onSubmit={handleSearchSubmit} loading={isLoading.searching} initialQuery={currentQuery} />
            <ErrorMessage message={error} />
            {isLoading.searching && (
              <div className="text-white mt-8 flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"></div>
                </div>
                <p className="text-lg font-medium">Searching repositories...</p>
              </div>
            )}
            {searchResults && <SearchResults results={searchResults} onAnalyze={handleAnalyzeRepo} analyzingUrl={analyzingUrl} />}
          </div>
        );
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col">
        <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <GithubOctocatIcon className="h-8 w-8 text-white"/>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500">
                            GitOptic
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsApiKeyConfigOpen(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-all duration-300"
                        aria-label="Configure API Keys"
                        title="Configure API Keys"
                      >
                        <CogIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Settings</span>
                      </button>
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
            </div>
        </header>
        
        <main className="relative z-20 max-w-6xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 flex-grow">
          {renderContent()}
        </main>
      </div>
      
      <footer className="relative z-20 text-center py-6 px-4 text-sm text-slate-400/80 mt-auto flex-shrink-0">
        <p className="mb-2">
          Made with ❤️ by <a href="https://www.linkedin.com/in/guychenya/" target="_blank" rel="noopener noreferrer" className="font-medium text-pink-400 hover:underline">Guy Chenya</a> for educational purposes.
        </p>
        <div className="flex justify-center items-center gap-x-4">
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <span className="text-slate-600">&bull;</span>
            <button onClick={() => setView('terms')} className="hover:text-white transition-colors">Terms of Service</button>
        </div>
      </footer>

      <FooterWave />
      
      <ApiKeyConfig
        isOpen={isApiKeyConfigOpen}
        onClose={() => setIsApiKeyConfigOpen(false)}
        onSave={handleSaveApiKeys}
        currentKeys={getApiKeys()}
      />

      {analysisData.projectName && (
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          repoName={analysisData.projectName}
          repoContext={JSON.stringify(analysisData)}
          onSendMessage={handleChatMessage}
        />
      )}
      
      <style>
      {`
        .prose-dark { color: #f1f5f9; line-height: 1.5; font-size: 0.8125rem; }
        .prose-dark p { margin-bottom: 0.5em; }
        .prose-dark h1, .prose-dark h2, .prose-dark h3, .prose-dark h4, .prose-dark h5, .prose-dark h6 { color: #ffffff; font-weight: 700; margin-top: 1em; margin-bottom: 0.4em; letter-spacing: -0.02em; }
        .prose-dark h1 { font-size: 1.25rem; } .prose-dark h2 { font-size: 1.125rem; } .prose-dark h3 { font-size: 1rem; }
        .prose-dark a { color: #f472b6; text-decoration: none; }
        .prose-dark a:hover { text-decoration: underline; }
        .prose-dark strong { color: #ffffff; font-weight: 600; }
        .prose-dark blockquote { margin: 0.75em 0; padding-left: 0.75em; border-left: 3px solid #475569; color: #cbd5e1; font-style: italic; }
        .prose-dark ul, .prose-dark ol { margin: 0.5em 0; padding-left: 1.5em; }
        .prose-dark ul { list-style-type: disc; } .prose-dark ol { list-style-type: decimal; }
        .prose-dark li { margin-bottom: 0.25em; }
        .prose-dark code { background-color: #374151; color: #f9a8d4; padding: 0.2em 0.4em; margin: 0; font-size: 0.75rem; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .prose-dark pre { background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 0.75em; overflow-x: auto; margin: 0.75em 0; white-space: pre-wrap; word-break: break-word; }
        .prose-dark pre code { background-color: transparent; color: inherit; padding: 0; margin: 0; font-size: inherit; border-radius: 0; }
        .prose-dark hr { border-color: #4b5563; margin: 1em 0; }
        .prose-dark table { width: 100%; margin: 0.75em 0; border-collapse: collapse; font-size: 0.75rem; }
        .prose-dark th, .prose-dark td { border: 1px solid #4b5563; padding: 0.4em 0.6em; }
        .prose-dark th { font-weight: 600; background-color: #374151; }
        .prose-dark img { max-width: 100%; border-radius: 8px; margin: 0.75em 0; }
      `}
      </style>
    </div>
  );
};
