import React from 'react';

const Icon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    {children}
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
);
export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></Icon>
);
export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></Icon>
);
export const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></Icon>
);
export const GithubOctocatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
    ></path>
  </svg>
);
export const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.75a.75.75 0 01.75-.75h3.75m-3.75 0l4.5 4.5" /></Icon>
);
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></Icon>
);
export const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></Icon>
);
export const RectangleGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v1.586a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 01-1.591.659H4.5A2.25 2.25 0 012.25 15V7.125z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 18v-3z" />
    </Icon>
);
export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></Icon>
);

export const ExclamationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></Icon>
);

export const InformationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
);

export const ScaleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.186 0-2.34-.312-3.37-1.009l-4.144-4.144M18.75 4.97L18.25 5.5m.5-.53l-2.62 10.726M3.75 4.97A48.416 48.416 0 0112 4.5c2.291 0 4.545.16 6.75.47m-13.5 0c-1.01.143-2.01.317-3 .52m3-.52l-2.62 10.726C.604 15.99 1.13 16.518 1.613 16.692c.484.174 1.017.174 1.5.002 1.187-.313 2.34-.313 3.37.986l4.144 4.144M3.75 4.97l.5.53m-.5-.53l2.62 10.726" />
    </Icon>
);

export const ForkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
      <circle cx="12" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15V6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></Icon>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18.259 15.715L18 14.75l-.259 1.035a3.375 3.375 0 00-2.455 2.456L14.25 18l1.036.259a3.375 3.375 0 002.455 2.456L18 21.75l.259-1.035a3.375 3.375 0 002.456-2.456L21.75 18l-1.035-.259a3.375 3.375 0 00-2.456-2.456z" /></Icon>
);

export const CpuChipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M19.5 8.25H21M19.5 12H21M19.5 15.75H21M15.75 21v-1.5M12 5.25v13.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15v10.5h-15z" />
    </Icon>
);

export const CommandLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5L3 12l3.75 4.5M12 19.5h9" /></Icon>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></Icon>
);

export const ClipboardCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></Icon>
);

export const GlobeAltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></Icon>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></Icon>
);

export const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5v-1.5A2.25 2.25 0 0018 3.75h-12A2.25 2.25 0 003.75 6v1.5z" />
  </Icon>
);