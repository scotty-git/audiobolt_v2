import { Response } from '../../types';
import { saveResponse, getResponses, getResponseById, deleteResponse, clearResponses } from './responseStorage';
import { responseRepository } from '../../db/repositories';

export const saveQuestionnaireResponse = async (response: Partial<Response>): Promise<Response | null> => {
  try {
    console.log('Saving questionnaire response:', response);
    
    // Save to local storage first for immediate feedback
    saveResponse(response);
    
    // Prepare the response for Supabase
    const supabaseResponse = {
      template_id: response.template_id,
      user_id: response.user_id,
      // Ensure answers is a properly formatted JSON string
      answers: JSON.stringify(response.answers),
      metadata: {
        ...response.metadata,
        savedAt: new Date().toISOString()
      },
      started_at: response.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    console.log('Saving to Supabase:', supabaseResponse);
    const savedResponse = await responseRepository.create(supabaseResponse);
    console.log('Successfully saved to Supabase:', savedResponse);
    
    return savedResponse;
  } catch (error) {
    console.error('Failed to save questionnaire response:', error);
    throw error;
  }
};

export const getQuestionnaireResponse = async (id: string): Promise<Response | null> => {
  try {
    const response = await responseRepository.findById(id);
    if (response) {
      return {
        ...response,
        answers: typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get questionnaire response:', error);
    return null;
  }
};

export {
  getResponses as getQuestionnaireResponses,
  getResponseById as getQuestionnaireResponseById,
  deleteResponse as deleteQuestionnaireResponse,
  clearResponses as clearQuestionnaireResponses
};