import { OnboardingFlow } from '../../types/onboarding';

const QUESTIONNAIRE_KEY = 'questionnaire';

export const saveQuestionnaire = (questionnaire: OnboardingFlow): void => {
  try {
    localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(questionnaire));
  } catch (error) {
    console.error('Error saving questionnaire to localStorage:', error);
  }
};

export const loadQuestionnaire = (): OnboardingFlow | null => {
  try {
    const stored = localStorage.getItem(QUESTIONNAIRE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading questionnaire from localStorage:', error);
    return null;
  }
};

export const clearQuestionnaire = (): void => {
  try {
    localStorage.removeItem(QUESTIONNAIRE_KEY);
  } catch (error) {
    console.error('Error clearing questionnaire from localStorage:', error);
  }
}; 