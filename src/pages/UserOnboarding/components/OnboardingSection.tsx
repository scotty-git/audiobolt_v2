import React from 'react';
import { Section, Response } from '../../../types/onboarding';
import { QuestionInput } from './QuestionInput';

interface OnboardingSectionProps {
  section: Section;
  responses: Record<string, Response>;
  onResponse: (questionId: string, value: any) => void;
}

export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  section,
  responses,
  onResponse,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {section.title}
      </h2>
      {section.description && (
        <p className="text-gray-600 mb-6">{section.description}</p>
      )}
      
      <div className="space-y-8">
        {section.questions.map((question) => (
          <QuestionInput
            key={question.id}
            question={question}
            value={responses[question.id]?.value}
            onChange={(value) => onResponse(question.id, value)}
          />
        ))}
      </div>
    </div>
  );
};