import React from 'react';
import { WarningIcon } from './IconComponents';

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg relative max-w-2xl mx-auto mb-8" role="alert">
      <div className="flex items-center">
        <WarningIcon className="h-5 w-5 mr-3 text-red-500" />
        <div>
          <span className="block sm:inline font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};
