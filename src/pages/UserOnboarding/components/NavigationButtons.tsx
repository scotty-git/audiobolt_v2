import React from 'react';

interface NavigationButtonsProps {
  canGoBack: boolean;
  canSkip: boolean;
  canGoNext: boolean;
  isLastSection: boolean;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  saveStatus: 'saving' | 'saved' | 'error';
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  canGoBack,
  canSkip,
  canGoNext,
  isLastSection,
  onBack,
  onSkip,
  onNext,
  saveStatus,
}) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <div>
        {canGoBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {canSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastSection ? 'Complete' : 'Next'}
        </button>
      </div>
      {saveStatus === 'saving' && (
        <span className="text-sm text-gray-500 ml-2">Saving...</span>
      )}
      {saveStatus === 'error' && (
        <span className="text-sm text-red-500 ml-2">Error saving</span>
      )}
    </div>
  );
}; 