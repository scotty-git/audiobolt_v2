import { supabase, Template } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const templateRepository = {
  async create(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTemplate = {
      id,
      ...template,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('templates')
      .insert(newTemplate)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByType(type: Template['type']): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select()
      .eq('type', type);

    if (error) throw error;
    return data;
  },

  async findAll(): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select();

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getDefaultTemplate(type: Template['type']): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select()
      .eq('type', type)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },

  async setDefault(id: string): Promise<Template> {
    const template = await this.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Start a transaction using RPC (you'll need to create this function in Supabase)
    const { data, error } = await supabase.rpc('set_default_template', {
      template_id: id,
      template_type: template.type
    });

    if (error) throw error;
    return data;
  }
}; 