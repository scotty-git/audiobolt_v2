import { supabase, Response } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const responseRepository = {
  async create(response: Omit<Response, 'id' | 'started_at' | 'last_updated'>): Promise<Response> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newResponse = {
      id,
      ...response,
      started_at: now,
      last_updated: now,
    };

    const { data, error } = await supabase
      .from('responses')
      .insert(newResponse)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findAll(): Promise<Response[]> {
    const { data, error } = await supabase
      .from('responses')
      .select();

    if (error) throw error;
    return data;
  },

  async findByTemplateId(templateId: string): Promise<Response[]> {
    const { data, error } = await supabase
      .from('responses')
      .select()
      .eq('template_id', templateId);

    if (error) throw error;
    return data;
  },

  async findByUserId(userId: string): Promise<Response[]> {
    const { data, error } = await supabase
      .from('responses')
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async update(id: string, response: Partial<Response>): Promise<Response> {
    const { data, error } = await supabase
      .from('responses')
      .update({
        ...response,
        last_updated: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 