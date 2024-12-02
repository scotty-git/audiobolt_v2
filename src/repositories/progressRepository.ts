import { supabase, Progress } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const progressRepository = {
  async create(progress: Omit<Progress, 'id' | 'last_updated'>): Promise<Progress> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newProgress = {
      id,
      ...progress,
      last_updated: now,
    };

    const { data, error } = await supabase
      .from('progress')
      .insert(newProgress)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserAndTemplate(userId: string, templateId: string): Promise<Progress | null> {
    const { data, error } = await supabase
      .from('progress')
      .select()
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(id: string, progress: Partial<Progress>): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .update({
        ...progress,
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
      .from('progress')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 