import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
    from: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vi.fn().mockResolvedValue({ data: [], error: null }),
        delete: vi.fn().mockResolvedValue({ data: [], error: null })
    })),
    auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signOut: vi.fn().mockResolvedValue({ error: null })
    }
};

// Mock createClient function
export const mockCreateClient = vi.fn(() => mockSupabaseClient); 