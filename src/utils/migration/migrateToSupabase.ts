import { supabase } from '../../lib/supabase';
import { Template, Response, Progress } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

interface MigrationResult {
  templates: {
    migrated: number;
    failed: number;
    errors: Error[];
  };
  responses: {
    migrated: number;
    failed: number;
    errors: Error[];
  };
  progress: {
    migrated: number;
    failed: number;
    errors: Error[];
  };
}

// Helper function to read data from a JSON file
async function readJSONFile<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(process.cwd(), 'indexeddb-data', filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return [];
    }
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export async function migrateToSupabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    templates: { migrated: 0, failed: 0, errors: [] },
    responses: { migrated: 0, failed: 0, errors: [] },
    progress: { migrated: 0, failed: 0, errors: [] },
  };

  try {
    // Step 1: Migrate Templates
    const templates = await readJSONFile<Template>('templates.json');
    console.log(`Found ${templates.length} templates to migrate`);

    for (const template of templates) {
      try {
        const { error } = await supabase
          .from('templates')
          .upsert({
            id: template.id,
            title: template.title,
            type: template.type,
            content: template.content,
            is_default: template.is_default,
            status: template.status,
            version: template.version,
            category: template.category,
            tags: template.tags,
            created_at: template.created_at,
            updated_at: template.updated_at
          });

        if (error) {
          console.error('Error migrating template:', error);
          throw error;
        }
        result.templates.migrated++;
        console.log(`Migrated template: ${template.title}`);
      } catch (error) {
        console.error(`Failed to migrate template ${template.title}:`, error);
        result.templates.failed++;
        result.templates.errors.push(error as Error);
      }
    }

    // Step 2: Migrate Progress (if exists)
    const progress = await readJSONFile<Progress>('progress.json');
    console.log(`Found ${progress.length} progress records to migrate`);

    for (const item of progress) {
      try {
        const { error } = await supabase
          .from('progress')
          .upsert({
            id: item.id,
            user_id: item.user_id,
            template_id: item.template_id,
            completed_sections: item.completed_sections,
            skipped_sections: item.skipped_sections,
            current_section_id: item.current_section_id,
            last_updated: item.last_updated
          });

        if (error) throw error;
        result.progress.migrated++;
      } catch (error) {
        result.progress.failed++;
        result.progress.errors.push(error as Error);
      }
    }

    // Step 3: Migrate Responses (if exists)
    const responses = await readJSONFile<Response>('responses.json');
    console.log(`Found ${responses.length} responses to migrate`);

    for (const response of responses) {
      try {
        const { error } = await supabase
          .from('responses')
          .upsert({
            id: response.id,
            template_id: response.template_id,
            user_id: response.user_id,
            answers: response.answers,
            started_at: response.started_at,
            completed_at: response.completed_at,
            last_updated: response.last_updated,
            metadata: response.metadata
          });

        if (error) throw error;
        result.responses.migrated++;
      } catch (error) {
        result.responses.failed++;
        result.responses.errors.push(error as Error);
      }
    }

    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function verifyMigration(): Promise<boolean> {
  try {
    // Check if templates were migrated
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('id');
    
    if (templatesError) throw templatesError;
    
    // Check if progress was migrated
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('id');
    
    if (progressError) throw progressError;
    
    // Check if responses were migrated
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('id');
    
    if (responsesError) throw responsesError;

    const totalMigrated = (templates?.length || 0) + (progress?.length || 0) + (responses?.length || 0);
    return totalMigrated > 0;
  } catch (error) {
    console.error('Migration verification failed:', error);
    return false;
  }
}

export async function rollbackMigration(): Promise<void> {
  try {
    // Delete all records from each table
    const { error: templatesError } = await supabase
      .from('templates')
      .delete()
      .not('id', 'is', null); // Delete all records
    
    if (templatesError) throw templatesError;

    const { error: progressError } = await supabase
      .from('progress')
      .delete()
      .not('id', 'is', null); // Delete all records
    
    if (progressError) throw progressError;

    const { error: responsesError } = await supabase
      .from('responses')
      .delete()
      .not('id', 'is', null); // Delete all records
    
    if (responsesError) throw responsesError;

    console.log('Rollback complete');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
} 