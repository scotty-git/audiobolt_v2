import { v4 as uuidv4 } from 'uuid';
import { responseRepository } from '../../db/repositories';
import { storage } from '../storage';

export interface QuestionnaireResponse {
  id: string;
  templateId: string;
  templateTitle: string;
  answers: Record<string, string | string[]>;
  completedSections: string[];
  currentSectionIndex: number;
  completedAt?: string;
}

const RESPONSES_KEY = 'questionnaire_responses';

export const saveQuestionnaireResponse = async (response: QuestionnaireResponse) => {
  try {
    const timestamp = new Date().toISOString();
    const submissionId = uuidv4();

    // Save to IndexedDB
    await responseRepository.create({
      id: submissionId,
      template_id: response.templateId,
      user_id: 'anonymous',
      answers: JSON.stringify(response.answers),
      started_at: timestamp,
      completed_at: response.completedAt,
      last_updated: timestamp,
      metadata: JSON.stringify({
        templateTitle: response.templateTitle,
        completedSections: response.completedSections,
        currentSectionIndex: response.currentSectionIndex,
        deviceInfo: window.navigator.platform,
        userAgent: window.navigator.userAgent,
      }),
    });

    return { ...response, id: submissionId };
  } catch (error) {
    console.error('Error saving questionnaire response:', error);
    throw error;
  }
};

export const loadQuestionnaireResponses = async (): Promise<QuestionnaireResponse[]> => {
  try {
    const responses = await responseRepository.findAll();
    return responses.map(response => ({
      id: response.id,
      templateId: response.template_id,
      templateTitle: JSON.parse(response.metadata || '{}').templateTitle || 'Unknown Template',
      answers: JSON.parse(response.answers),
      completedSections: JSON.parse(response.metadata || '{}').completedSections || [],
      currentSectionIndex: JSON.parse(response.metadata || '{}').currentSectionIndex || 0,
      completedAt: response.completed_at,
    }));
  } catch (error) {
    console.error('Error loading questionnaire responses:', error);
    return [];
  }
};

export const deleteQuestionnaireResponse = async (responseId: string): Promise<void> => {
  try {
    await responseRepository.delete(responseId);
  } catch (error) {
    console.error('Error deleting questionnaire response:', error);
    throw error;
  }
};