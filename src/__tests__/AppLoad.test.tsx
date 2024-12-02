import { vi } from 'vitest';

// Mock the Supabase module
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
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
    })
}));

import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import './setup/testSetup';

describe('App Load Test', () => {
    it('should load without crashing', async () => {
        // Render the app
        const { container } = render(<App />);

        // Wait for initial render
        await waitFor(() => {
            // Check that the app rendered something
            expect(container.firstChild).toBeTruthy();
        });

        // Check for error messages
        const errorMessages = screen.queryByText(/something went wrong/i);
        expect(errorMessages).toBeFalsy();
    });

    it('should show main content', async () => {
        const { container } = render(<App />);

        // Wait for and verify essential UI elements
        await waitFor(() => {
            // The app should render some content
            expect(container.innerHTML).not.toBe('');
            
            // Should not show error messages
            expect(screen.queryByText(/error/i)).toBeFalsy();
            expect(screen.queryByText(/something went wrong/i)).toBeFalsy();

            // Should show main page content
            expect(screen.getByText('Self-Help Audiobook Portal')).toBeInTheDocument();
        });
    });

    it('should initialize core services', async () => {
        render(<App />);
        
        // Wait for initialization
        await waitFor(() => {
            // Should show main page content, indicating successful initialization
            expect(screen.getByText('Self-Help Audiobook Portal')).toBeInTheDocument();
        });
    });
}); 