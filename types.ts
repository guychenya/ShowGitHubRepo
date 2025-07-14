export interface SearchResult {
  name: string;
  url: string;
  description: string;
}

export interface CodeQuality {
  qualityScore: number;
  maintainabilityScore: number;
  strengths: string[];
  areasForImprovement: string[];
}

export interface ProjectStats {
    stars: number;
    forks: number;
    openIssues: number;
    license: string;
    defaultBranch: string;
}

export interface ProjectAnalysis {
  projectName: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  usageInstructions: string;
  repoUrl: string;
  liveDemoUrl?: string | null;
  similarTools: {
    name: string;
    description: string;
    url: string;
  }[];
  stats: ProjectStats;
  readmeContent: string;
  codeQuality: CodeQuality;
}