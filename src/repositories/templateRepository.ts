import { supabase } from '../lib/supabase';
import { Template } from '../types/onboarding';
import { DatabaseError } from './errors';

export const templateRepository = {
  async create(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to create template', error);
    }

    if (!data) {
      throw new DatabaseError('Failed to create template: No data returned');
    }

    return data as Template;
  },

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new DatabaseError('Failed to fetch template', error);
    }

    return data as Template | null;
  },

  async findByType(type: Template['type']): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select()
      .eq('type', type);

    if (error) {
      throw new DatabaseError('Failed to fetch templates', error);
    }

    return (data || []) as Template[];
  },

  async update(id: string, template: Partial<Template>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update({
        ...template,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to update template', error);
    }

    if (!data) {
      throw new DatabaseError(`Template with id ${id} not found`);
    }

    return data as Template;
  },
}; 