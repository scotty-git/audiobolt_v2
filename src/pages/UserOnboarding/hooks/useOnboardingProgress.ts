import { useState, useCallback, useEffect } from 'react';
import { Response, Section } from '../../../types/onboarding';
import { saveUserProgress, loadUserProgress } from '../../../utils/onboarding/progressStorage';

type ResponseMap = Record<string, Response>;

export const useOnboardingProgress = (flowId: string) => {
  const [responses, setResponses] = useState<ResponseMap>({});
  const [progress, setProgress] = useState({
    completedSections: [] as string[],
    skippedSections: [] as string[],
    currentSectionId: undefined as string | undefined,
    lastUpdated: new Date().toISOString(),
  });
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await loadUserProgress('current-user', flowId);
        if (savedProgress) {
          setProgress({
            completedSections: savedProgress.progress.completedSections || [],
            skippedSections: savedProgress.progress.skippedSections || [],
            currentSectionId: savedProgress.progress.currentSectionId,
            lastUpdated: savedProgress.progress.lastUpdated,
          });
          
          const responsesMap: ResponseMap = {};
          savedProgress.responses.forEach(response => {
            responsesMap[response.questionId] = response;
          });
          setResponses(responsesMap);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [flowId]);

  const handleResponse = useCallback((questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        value,
        timestamp: new Date().toISOString(),
      },
    }));
  }, []);

  const skipSection = useCallback((sectionId: string, section?: Section) => {
    if (section && !section.isOptional) {
      return;
    }

    setProgress(prev => ({
      ...prev,
      skippedSections: [...prev.skippedSections, sectionId],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const completeSection = useCallback((sectionId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSections: [...prev.completedSections, sectionId],
      currentSectionId: sectionId,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setSaveStatus('saving');
      await saveUserProgress({
        userId: 'current-user',
        flowId,
        progress,
        responses: Object.values(responses),
        metadata: {
          startedAt: progress.lastUpdated,
          lastUpdated: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          deviceInfo: window.navigator.platform,
          userAgent: window.navigator.userAgent,
        },
      });
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSaveStatus('error');
    }
  }, [flowId, progress, responses]);

  const isCurrentSectionValid = useCallback((section: Section) => {
    if (!section) return false;
    if (progress.skippedSections.includes(section.id)) return true;
    
    return section.questions.every(q => 
      !q.required || responses[q.id]?.value !== undefined
    );
  }, [responses, progress.skippedSections]);

  // Autosave progress
  useEffect(() => {
    const saveProgress = async () => {
      try {
        setSaveStatus('saving');
        await saveUserProgress({
          userId: 'current-user',
          flowId,
          progress,
          responses: Object.values(responses),
          metadata: {
            startedAt: progress.lastUpdated,
            lastUpdated: new Date().toISOString(),
            deviceInfo: window.navigator.platform,
            userAgent: window.navigator.userAgent,
          },
        });
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error saving progress:', error);
        setSaveStatus('error');
      }
    };

    const timer = setTimeout(saveProgress, 5000);
    return () => clearTimeout(timer);
  }, [flowId, progress, responses]);

  return {
    responses,
    progress,
    saveStatus,
    isLoading,
    handleResponse,
    skipSection,
    completeSection,
    completeOnboarding,
    isCurrentSectionValid,
  };
};