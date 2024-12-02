import { useState, useCallback, useMemo } from 'react';
import { OnboardingFlow, UserProgress, Section, Response } from '../../../types/onboarding';
import { saveUserProgress, createNewUserProgress } from '../../../utils/onboardingStorage';
import { useAutosave } from '../../../hooks/useAutosave';
import { isSectionComplete } from '../../../utils/progressCalculation';

export const useOnboardingProgress = (flowId: string) => {
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [progress, setProgress] = useState(() => {
    const initialProgress = createNewUserProgress('user-1', flowId);
    return initialProgress.progress;
  });
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  const userProgress: UserProgress = useMemo(() => ({
    userId: 'user-1',
    flowId,
    progress,
    responses: Object.entries(responses).map(([questionId, response]) => ({
      questionId,
      value: response.value,
      timestamp: response.timestamp
    })),
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      deviceInfo: window.navigator.platform,
      userAgent: window.navigator.userAgent
    }
  }), [flowId, progress, responses]);

  const handleResponse = useCallback((questionId: string, value: any) => {
    setSaveStatus('saving');
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        value,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  const handleSkipSection = useCallback((sectionId: string) => {
    setSaveStatus('saving');
    setProgress(prev => ({
      ...prev,
      skippedSections: [...prev.skippedSections, sectionId],
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const handleComplete = useCallback(() => {
    setSaveStatus('saving');
    const updatedProgress = {
      ...progress,
      lastUpdated: new Date().toISOString()
    };
    setProgress(updatedProgress);

    const finalUserProgress: UserProgress = {
      ...userProgress,
      progress: updatedProgress,
      metadata: {
        ...userProgress.metadata,
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };

    try {
      saveUserProgress(finalUserProgress);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving final progress:', error);
      setSaveStatus('error');
    }
  }, [progress, userProgress]);

  const isCurrentSectionValid = useCallback((section: Section): boolean => {
    if (!section || progress.skippedSections.includes(section.id)) {
      return true;
    }
    return isSectionComplete(section, responses);
  }, [progress.skippedSections, responses]);

  useAutosave(userProgress, {
    interval: 5000,
    onSave: () => {
      try {
        saveUserProgress(userProgress);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Autosave failed:', error);
        setSaveStatus('error');
      }
    }
  });

  return {
    responses,
    progress,
    saveStatus,
    handleResponse,
    handleSkipSection,
    handleComplete,
    isCurrentSectionValid,
  };
};