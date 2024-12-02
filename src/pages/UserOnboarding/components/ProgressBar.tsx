import React from 'react';

interface ProgressBarProps {
  currentSection: number;
  totalSections: number;
  completedSections: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentSection,
  totalSections,
  completedSections,
}) => {
  const progress = (completedSections.length / totalSections) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Section {currentSection} of {totalSections}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};