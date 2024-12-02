import { useEffect, useRef } from 'react';
import { OnboardingFlow, UserProgress } from '../types/onboarding';
import { saveOnboardingFlow, saveUserProgress } from '../utils/storage/supabaseStorage';
import { DatabaseError } from '../repositories/errors';

interface AutosaveConfig {
  interval?: number;
  onSave?: () => Promise<void>;
  onError?: (error: Error) => void;
}

export const useAutosave = (
  data: OnboardingFlow | UserProgress,
  config: AutosaveConfig = {}
) => {
  const { interval = 30000, onSave, onError } = config;
  const lastSaved = useRef<Date>(new Date());
  const isSaving = useRef(false);
  const pendingChanges = useRef(false);

  useEffect(() => {
    pendingChanges.current = true;
  }, [data]);

  useEffect(() => {
    const saveData = async () => {
      if (isSaving.current || !pendingChanges.current) {
        return; // Prevent multiple simultaneous saves or unnecessary saves
      }

      try {
        isSaving.current = true;
        if ('sections' in data) {
          await saveOnboardingFlow(data as OnboardingFlow);
        } else {
          await saveUserProgress(data as UserProgress);
        }
        lastSaved.current = new Date();
        pendingChanges.current = false;
        await onSave?.();
      } catch (error) {
        console.error('Autosave failed:', error);
        if (error instanceof DatabaseError) {
          onError?.(error);
        } else {
          onError?.(new DatabaseError('Autosave failed', error));
        }
      } finally {
        isSaving.current = false;
      }
    };

    const timer = setInterval(saveData, interval);
    return () => clearInterval(timer);
  }, [data, interval, onSave, onError]);

  return {
    lastSaved: lastSaved.current,
    isSaving: isSaving.current,
    hasPendingChanges: pendingChanges.current,
  };
};