// Mock Vite's import.meta.env
import { vi } from 'vitest';

const env = {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-key',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false
};

// @ts-ignore - we're intentionally modifying the global object
global.import = {
    meta: {
        env
    }
}; 