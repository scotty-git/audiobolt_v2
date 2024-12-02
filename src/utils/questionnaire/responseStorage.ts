import { Response } from '../../types';

const STORAGE_KEY = 'questionnaire_responses';

export const saveResponse = (response: Partial<Response>): void => {
  try {
    const responses = getResponses();
    const existingIndex = responses.findIndex(r => r.id === response.id);
    
    if (existingIndex >= 0) {
      responses[existingIndex] = { ...responses[existingIndex], ...response };
    } else {
      responses.push(response as Response);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  } catch (error) {
    console.error('Failed to save response:', error);
  }
};

export const getResponses = (): Response[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get responses:', error);
    return [];
  }
};

export const getResponseById = (id: string): Response | null => {
  try {
    const responses = getResponses();
    return responses.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Failed to get response by ID:', error);
    return null;
  }
};

export const deleteResponse = (id: string): void => {
  try {
    const responses = getResponses();
    const filtered = responses.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete response:', error);
  }
};

export const clearResponses = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear responses:', error);
  }
}; 