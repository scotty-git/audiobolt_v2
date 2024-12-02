import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OnboardingFlow as OnboardingFlowType } from '../../../types/onboarding';
import { loadOnboardingFlow } from '../../../utils/onboarding/flowStorage';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { LoadingSpinner, ErrorMessage } from '../../../components/common';
import { OnboardingSection } from './OnboardingSection';
import { ProgressBar } from './ProgressBar';
import { NavigationButtons } from './NavigationButtons';

export const OnboardingFlow: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const [flow, setFlow] = useState<OnboardingFlowType | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    responses,
    progress,
    saveStatus,
    isLoading: isProgressLoading,
    handleResponse,
    handleSkipSection,
    handleComplete,
    isCurrentSectionValid,
  } = useOnboardingProgress(flowId || '');

  useEffect(() => {
    const loadFlow = async () => {
      if (!flowId) {
        setError('No flow ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const loadedFlow = await loadOnboardingFlow(flowId);
        if (!loadedFlow) {
          setError('Onboarding flow not found');
          return;
        }
        setFlow(loadedFlow);

        // Set initial section based on progress
        if (progress.currentSectionId) {
          const sectionIndex = loadedFlow.sections.findIndex(
            s => s.id === progress.currentSectionId
          );
          if (sectionIndex !== -1) {
            setCurrentSectionIndex(sectionIndex);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding flow:', error);
        setError('Failed to load onboarding flow');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlow();
  }, [flowId, progress.currentSectionId]);

  if (isLoading || isProgressLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!flow) {
    return <ErrorMessage message="No onboarding flow found" />;
  }

  const currentSection = flow.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === flow.sections.length - 1;

  const handleNext = async () => {
    if (isLastSection) {
      await handleComplete();
    } else {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentSectionIndex(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    if (currentSection.isOptional) {
      handleSkipSection(currentSection.id);
      if (!isLastSection) {
        setCurrentSectionIndex(prev => prev + 1);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{flow.title}</h1>
      {flow.description && (
        <p className="text-gray-600">{flow.description}</p>
      )}

      {flow.settings.showProgressBar && (
        <ProgressBar
          currentSection={currentSectionIndex + 1}
          totalSections={flow.sections.length}
          completedSections={progress.completedSections}
        />
      )}

      <OnboardingSection
        section={currentSection}
        responses={responses}
        onResponse={handleResponse}
      />

      <NavigationButtons
        canGoBack={currentSectionIndex > 0}
        canSkip={currentSection.isOptional}
        canGoNext={isCurrentSectionValid(currentSection)}
        isLastSection={isLastSection}
        onBack={handleBack}
        onSkip={handleSkip}
        onNext={handleNext}
        saveStatus={saveStatus}
      />
    </div>
  );
}; 