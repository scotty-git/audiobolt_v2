import { supabase } from '../lib/supabase';
import { Response } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, NotFoundError, ValidationError } from './errors';
import { retry, validateRequired, validateUUID } from './utils';
import { PostgrestResponse } from '@supabase/supabase-js';

export const responseRepository = {
  async create(response: Omit<Response, 'id' | 'started_at' | 'last_updated'>): Promise<Response> {
    validateRequired(response.template_id, 'Template ID');
    validateRequired(response.user_id, 'User ID');
    validateUUID(response.template_id, 'Template ID');

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newResponse = {
      id,
      ...response,
      started_at: now,
      last_updated: now,
    };

    const { data, error } = await retry(() =>
      supabase
        .from('responses')
        .insert(newResponse)
        .select()
        .single()
    );

    if (error) throw new DatabaseError('Failed to create response', error);
    if (!data) throw new DatabaseError('No data returned after response creation');

    return data;
  },

  async findAll(): Promise<Response[]> {
    const { data, error } = await retry(() =>
      supabase
        .from('responses')
        .select()
    );

    if (error) throw new DatabaseError('Failed to fetch all responses', error);
    return data || [];
  },

  async findByTemplateId(templateId: string): Promise<Response[]> {
    validateRequired(templateId, 'Template ID');
    validateUUID(templateId, 'Template ID');

    const { data, error } = await retry(() =>
      supabase
        .from('responses')
        .select()
        .eq('template_id', templateId)
    );

    if (error) throw new DatabaseError('Failed to fetch responses by template', error);
    return data || [];
  },

  async findByUserId(userId: string): Promise<Response[]> {
    validateRequired(userId, 'User ID');

    const { data, error } = await retry(() =>
      supabase
        .from('responses')
        .select()
        .eq('user_id', userId)
    );

    if (error) throw new DatabaseError('Failed to fetch responses by user', error);
    return data || [];
  },

  async update(id: string, response: Partial<Response>): Promise<Response> {
    validateRequired(id, 'Response ID');
    validateUUID(id, 'Response ID');

    if (response.template_id) {
      validateUUID(response.template_id, 'Template ID');
    }

    const { data, error } = await retry(() =>
      supabase
        .from('responses')
        .update({
          ...response,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    );

    if (error) throw new DatabaseError('Failed to update response', error);
    if (!data) throw new NotFoundError('Response', id);

    return data;
  },

  async delete(id: string): Promise<void> {
    validateRequired(id, 'Response ID');
    validateUUID(id, 'Response ID');

    const { error } = await retry(() =>
      supabase
        .from('responses')
        .delete()
        .eq('id', id)
    );

    if (error) throw new DatabaseError('Failed to delete response', error);
  },

  async batchCreate(responses: Array<Omit<Response, 'id' | 'started_at' | 'last_updated'>>): Promise<Response[]> {
    responses.forEach((response, index) => {
      validateRequired(response.template_id, `Template ID at index ${index}`);
      validateRequired(response.user_id, `User ID at index ${index}`);
      validateUUID(response.template_id, `Template ID at index ${index}`);
    });

    const now = new Date().toISOString();
    const responsesWithIds = responses.map(response => ({
      ...response,
      id: uuidv4(),
      started_at: now,
      last_updated: now,
    }));

    const { data, error } = await retry(() =>
      supabase
        .from('responses')
        .insert(responsesWithIds)
        .select()
    );

    if (error) throw new DatabaseError('Failed to batch create responses', error);
    if (!data) throw new DatabaseError('No data returned after batch creation');

    return data;
  },

  async batchDelete(ids: string[]): Promise<void> {
    ids.forEach((id, index) => {
      validateRequired(id, `Response ID at index ${index}`);
      validateUUID(id, `Response ID at index ${index}`);
    });

    const { error } = await retry(() =>
      supabase
        .from('responses')
        .delete()
        .in('id', ids)
    );

    if (error) throw new DatabaseError('Failed to batch delete responses', error);
  }
}; 