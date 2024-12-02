import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadOnboardingFlow } from '../../utils/onboarding/flowStorage';
import { OnboardingFlow } from '../../types/onboarding';
import { OnboardingSection } from './components/OnboardingSection';
import { SectionProgress } from '../../components/Onboarding/SectionProgress';
import { Navigation } from './components/Navigation';
import { CompletionModal } from './components/CompletionModal';
import { StartOverButton } from './components/StartOverButton';
import { useOnboardingProgress } from './hooks/useOnboardingProgress';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';

export const UserOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [flow, setFlow] = useState<OnboardingFlow | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    responses,
    progress,
    handleResponse,
    handleSkipSection,
    handleComplete,
    isCurrentSectionValid,
  } = useOnboardingProgress(flow?.id || '');

  useEffect(() => {
    const loadFlow = async () => {
      try {
        setIsLoading(true);
        const loadedFlow = loadOnboardingFlow();
        if (!loadedFlow) {
          setFlow(null);
        } else {
          setFlow(loadedFlow);
        }
      } catch (error) {
        console.error('Error loading onboarding flow:', error);
        setFlow(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlow();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Onboarding Flow Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we set up your onboarding experience.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const currentSection = flow.sections[currentSectionIndex];
  const totalSections = flow.sections.length;

  if (!currentSection) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No sections found in this onboarding flow.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{flow.title}</h1>
          <p className="text-lg text-gray-600">{flow.description}</p>
        </div>
        <StartOverButton />
      </div>

      <SectionProgress
        sections={flow.sections}
        currentSectionIndex={currentSectionIndex}
        completedSections={progress.completedSections}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <OnboardingSection
          section={currentSection}
          responses={responses}
          onResponse={handleResponse}
        />
      </div>

      <Navigation
        currentIndex={currentSectionIndex}
        totalSections={totalSections}
        canProceed={isCurrentSectionValid(currentSection)}
        isOptional={currentSection.isOptional}
        onNext={() => {
          if (currentSectionIndex < totalSections - 1) {
            setCurrentSectionIndex(prev => prev + 1);
          } else {
            handleComplete();
            setShowCompletion(true);
          }
        }}
        onBack={() => {
          if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
          }
        }}
        onSkip={() => {
          handleSkipSection(currentSection.id);
          if (currentSectionIndex < totalSections - 1) {
            setCurrentSectionIndex(prev => prev + 1);
          } else {
            handleComplete();
            setShowCompletion(true);
          }
        }}
      />

      {showCompletion && (
        <CompletionModal
          onClose={() => {
            setShowCompletion(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};