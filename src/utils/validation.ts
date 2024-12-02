import { z } from 'zod';
import { onboardingFlowSchema, questionSchema } from '../schemas/onboarding';

export const emailSchema = z.string().email('Please enter a valid email address');

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const result = emailSchema.safeParse(email);
  return {
    isValid: result.success,
    error: result.success ? undefined : 'Please enter a valid email address'
  };
};

export type ValidationResult = {
  success: boolean;
  errors?: string[];
};

export const validateTemplate = (template: unknown): ValidationResult => {
  try {
    const result = onboardingFlowSchema.safeParse(template);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(e => e.message),
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid template format'],
    };
  }
};

export const validateQuestion = (question: unknown): ValidationResult => {
  try {
    const result = questionSchema.safeParse(question);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(e => e.message),
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid question format'],
    };
  }
};

export const clearOnboardingData = () => {
  const keys = Object.keys(localStorage);
  const onboardingKeys = keys.filter(key => 
    key.startsWith('onboarding_') || 
    key.startsWith('user_progress_')
  );
  onboardingKeys.forEach(key => localStorage.removeItem(key));
  return onboardingKeys.length;
};