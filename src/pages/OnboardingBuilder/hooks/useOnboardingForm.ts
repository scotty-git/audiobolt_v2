import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingFlow, onboardingFlowSchema } from '../../../types/onboarding';
import { saveOnboardingFlow, loadOnboardingFlow } from '../../../utils/storage/supabaseStorage';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from '../../../repositories/errors';

export const useOnboardingForm = (flowId?: string) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showUnsavedPrompt = useUnsavedChanges(hasChanges);

  const form = useForm<OnboardingFlow>({
    resolver: zodResolver(onboardingFlowSchema),
    defaultValues: {
      id: flowId || `flow-${uuidv4()}`,
      title: '',
      type: 'onboarding',
      description: '',
      status: 'draft',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      sections: [],
      settings: {
        allowSkipSections: false,
        requireAllSections: true,
        showProgressBar: true,
        allowSaveProgress: true,
      },
    },
  });

  useEffect(() => {
    const loadForm = async () => {
      if (flowId) {
        try {
          setIsLoading(true);
          setError(null);
          const flow = await loadOnboardingFlow(flowId);
          if (flow) {
            form.reset(flow);
          }
        } catch (error) {
          console.error('Error loading onboarding flow:', error);
          if (error instanceof DatabaseError) {
            setError(error.message);
          } else {
            setError('Failed to load onboarding flow');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [flowId, form]);

  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      setError(null);
      const values = form.getValues();
      await saveOnboardingFlow({
        ...values,
        updatedAt: new Date().toISOString()
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving onboarding flow:', error);
      if (error instanceof DatabaseError) {
        setError(error.message);
      } else {
        setError('Failed to save onboarding flow');
      }
    }
  }, [form]);

  const formState = useMemo(() => ({
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    isLoading,
    error,
  }), [form.formState, isLoading, error]);

  return {
    form,
    formState,
    handleSave,
    showUnsavedPrompt,
    setHasChanges,
  };
};