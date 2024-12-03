import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '../../lib/supabaseClient';

describe('User Profile Integration Tests', () => {
    const testUser = {
        email: 'test@example.com',
        role: 'user'
    };

    let userId: string;

    // Before each test, create a test user
    beforeEach(async () => {
        // Clean up any existing test user
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', testUser.email)
            .single();

        if (existingUser) {
            await supabase
                .from('users')
                .delete()
                .eq('id', existingUser.id);
        }

        // Create a new test user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([testUser])
            .select()
            .single();

        if (error) throw error;
        userId = newUser.id;
    });

    // After each test, clean up
    afterEach(async () => {
        if (userId) {
            await supabase
                .from('users')
                .delete()
                .eq('id', userId);
        }
    });

    it('should store and retrieve simple key-value data', async () => {
        const simpleData = {
            name: 'John Doe',
            age: 30,
            isActive: true
        };

        const { error: updateError } = await supabase
            .from('users')
            .update({ profile_data: simpleData })
            .eq('id', userId);

        expect(updateError).toBeNull();

        const { data: result } = await supabase
            .from('users')
            .select('profile_data')
            .eq('id', userId)
            .single();

        expect(result?.profile_data).toEqual(simpleData);
    });

    it('should store and retrieve nested objects', async () => {
        const nestedData = {
            personal: {
                name: 'John Doe',
                contact: {
                    email: 'john@example.com',
                    phone: '1234567890'
                }
            },
            preferences: {
                theme: 'dark',
                notifications: {
                    email: true,
                    push: false
                }
            }
        };

        const { error: updateError } = await supabase
            .from('users')
            .update({ profile_data: nestedData })
            .eq('id', userId);

        expect(updateError).toBeNull();

        const { data: result } = await supabase
            .from('users')
            .select('profile_data')
            .eq('id', userId)
            .single();

        expect(result?.profile_data).toEqual(nestedData);
    });

    it('should store and retrieve arrays and mixed data', async () => {
        const mixedData = {
            tags: ['user', 'premium', 'active'],
            scores: [1, 2, 3, 4, 5],
            history: [
                { date: '2023-01-01', action: 'login' },
                { date: '2023-01-02', action: 'update_profile' }
            ],
            metadata: {
                lastLogin: new Date().toISOString(),
                loginCount: 42,
                settings: {
                    language: 'en',
                    timezone: 'UTC'
                }
            }
        };

        const { error: updateError } = await supabase
            .from('users')
            .update({ profile_data: mixedData })
            .eq('id', userId);

        expect(updateError).toBeNull();

        const { data: result } = await supabase
            .from('users')
            .select('profile_data')
            .eq('id', userId)
            .single();

        expect(result?.profile_data).toEqual(mixedData);
    });

    it('should handle partial updates correctly', async () => {
        // Initial data
        const initialData = {
            name: 'John',
            settings: {
                theme: 'light'
            }
        };

        // First update
        await supabase
            .from('users')
            .update({ profile_data: initialData })
            .eq('id', userId);

        // Partial update
        const partialUpdate = {
            name: 'John Doe',
            age: 30,
            settings: {
                theme: 'dark',
                notifications: true
            }
        };

        const { error: updateError } = await supabase
            .from('users')
            .update({ profile_data: partialUpdate })
            .eq('id', userId);

        expect(updateError).toBeNull();

        const { data: result } = await supabase
            .from('users')
            .select('profile_data')
            .eq('id', userId)
            .single();

        expect(result?.profile_data).toEqual(partialUpdate);
    });

    it('should handle empty and null values', async () => {
        const testCases = [
            {},
            { emptyObject: {} },
            { nullValue: null },
            { emptyArray: [] },
            { mixedEmpty: { nested: {}, arr: [], null: null } }
        ];

        for (const testData of testCases) {
            const { error: updateError } = await supabase
                .from('users')
                .update({ profile_data: testData })
                .eq('id', userId);

            expect(updateError).toBeNull();

            const { data: result } = await supabase
                .from('users')
                .select('profile_data')
                .eq('id', userId)
                .single();

            expect(result?.profile_data).toEqual(testData);
        }
    });
}); 