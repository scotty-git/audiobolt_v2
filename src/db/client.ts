import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Template, Response } from './schema';
import { runInitialMigration } from './migrations/initial';

// Add global indexedDB for Node.js environment
if (typeof window === 'undefined') {
  const { indexedDB, IDBKeyRange } = await import('fake-indexeddb');
  global.indexedDB = indexedDB;
  global.IDBKeyRange = IDBKeyRange;
}

interface AppDB extends DBSchema {
  templates: {
    key: string;
    value: Template;
    indexes: {
      'by-type': string;
      'by-status': string;
    };
  };
  responses: {
    key: string;
    value: Response;
    indexes: {
      'by-template': string;
      'by-user': string;
    };
  };
}

let db: IDBPDatabase<AppDB>;

export const initializeDatabase = async () => {
  try {
    db = await openDB<AppDB>('audiobook-questionnaire', 1, {
      upgrade(db) {
        // Create stores if they don't exist
        // Delete existing stores to ensure clean upgrade
        if (db.objectStoreNames.contains('templates')) {
          db.deleteObjectStore('templates');
        }
        if (db.objectStoreNames.contains('responses')) {
          db.deleteObjectStore('responses');
        }
        if (db.objectStoreNames.contains('submissions')) {
          db.deleteObjectStore('submissions');
        }

        // Create templates store
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        templateStore.createIndex('by-type', 'type');
        templateStore.createIndex('by-status', 'status');

        // Create responses store
        const responseStore = db.createObjectStore('responses', { keyPath: 'id' });
        responseStore.createIndex('by-template', 'template_id');
        responseStore.createIndex('by-user', 'user_id');

        // Create submissions store
        const submissionStore = db.createObjectStore('submissions', { keyPath: 'id' });
        submissionStore.createIndex('by-template', 'template_id');
        submissionStore.createIndex('by-date', 'completed_at');
      },
    });

    // Run initial migration
    await runInitialMigration();
    
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};