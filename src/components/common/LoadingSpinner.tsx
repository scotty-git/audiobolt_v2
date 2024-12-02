import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div 
        role="status"
        aria-label="Loading"
        className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}; 