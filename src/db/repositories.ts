import { supabase } from './client';
import { Template, Response } from '../types';
import { defaultOnboardingFlow } from '../data/defaultOnboardingFlow';

class TemplateRepository {
  async create(template: Omit<Template, 'id'>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select()
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async findByType(type: 'onboarding' | 'questionnaire'): Promise<Template[]> {
    try {
      console.log('Fetching templates by type:', type);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('type', type);
      
      if (error) {
        console.error('Error fetching templates by type:', error);
        throw new Error(error.message);
      }

      console.log(`Templates of type ${type} fetched:`, data);
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch templates of type ${type}:`, error);
      return [];
    }
  }

  async findAll(): Promise<Template[]> {
    try {
      console.log('Fetching all templates...');
      const { data, error } = await supabase
        .from('templates')
        .select('*');
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw new Error(error.message);
      }

      console.log('Templates fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  async update(id: string, template: Partial<Template>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update(template)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  async findDefaultOnboarding(): Promise<Template | null> {
    try {
      console.log('Fetching default onboarding template...');
      const { data, error } = await supabase
        .from('templates')
        .select()
        .eq('type', 'onboarding')
        .eq('is_default', true)
        .single();
      
      if (error) {
        console.error('Error fetching default onboarding template:', error);
        throw error;
      }

      if (data) {
        // Ensure content is properly parsed
        try {
          const parsedContent = typeof data.content === 'string' 
            ? JSON.parse(data.content) 
            : data.content;
          
          return {
            ...data,
            content: parsedContent
          };
        } catch (parseError) {
          console.error('Error parsing template content:', parseError);
          throw parseError;
        }
      }

      console.log('Default onboarding template fetched:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch default onboarding template:', error);
      return null;
    }
  }

  async resetDefaultTemplate(): Promise<Template> {
    try {
      console.log('Resetting default template...');
      
      // First, delete any existing default templates
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('is_default', true)
        .eq('type', 'onboarding');

      if (deleteError) {
        console.error('Error deleting old default template:', deleteError);
        throw deleteError;
      }

      // Prepare the template data
      const templateData = {
        title: defaultOnboardingFlow.title,
        type: 'onboarding' as const,
        content: JSON.stringify(defaultOnboardingFlow), // Convert to JSON string
        is_default: true,
        status: 'published' as const,
        version: defaultOnboardingFlow.version,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving template with content:', JSON.parse(templateData.content));

      const { data, error } = await supabase
        .from('templates')
        .insert(templateData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting default template:', error);
        throw error;
      }

      console.log('Successfully reset default template:', data);
      
      // Parse the content back to an object before returning
      return {
        ...data,
        content: JSON.parse(data.content)
      };
    } catch (error) {
      console.error('Failed to reset default template:', error);
      throw error;
    }
  }
}

class ResponseRepository {
  async create(response: Partial<Response>): Promise<Response> {
    console.log('Creating response in Supabase:', response);
    
    // Ensure answers are stringified
    const preparedResponse = {
      ...response,
      answers: typeof response.answers === 'string' ? response.answers : JSON.stringify(response.answers)
    };

    const { data, error } = await supabase
      .from('responses')
      .insert([preparedResponse])
      .select()
      .single();

    if (error) {
      console.error('Error creating response:', error);
      throw error;
    }

    console.log('Successfully created response:', data);
    return data;
  }

  async findByTemplateAndUser(templateId: string, userId: string): Promise<Response | null> {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error finding response:', error);
      return null;
    }

    return data;
  }

  async findById(id: string): Promise<Response | null> {
    console.log('Finding response by id:', id);
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding response by id:', error);
      return null;
    }

    if (!data) {
      console.log('No response found with id:', id);
      return null;
    }

    console.log('Found response:', data);

    // Parse the answers if they're stored as a string
    return {
      ...data,
      answers: typeof data.answers === 'string' ? JSON.parse(data.answers) : data.answers,
      metadata: data.metadata || {}
    };
  }

  async findAll(): Promise<Response[]> {
    console.log('Finding all responses...');
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error finding responses:', error);
      return [];
    }

    console.log('Found responses:', data);

    // Parse answers for each response
    return (data || []).map(response => ({
      ...response,
      answers: typeof response.answers === 'string' ? JSON.parse(response.answers) : response.answers,
      metadata: response.metadata || {}
    }));
  }

  async update(id: string, response: Partial<Response>): Promise<Response> {
    try {
      const updateData = {
        ...response,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('responses')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          template_id,
          user_id,
          answers,
          started_at,
          completed_at,
          last_updated,
          metadata
        `)
        .single();
      
      if (error) {
        console.error('Error updating response:', error);
        throw new Error(error.message);
      }
      return data;
    } catch (error) {
      console.error('Failed to update response:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting response:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Failed to delete response:', error);
      throw error;
    }
  }
}

export const templateRepository = new TemplateRepository();
export const responseRepository = new ResponseRepository(); 