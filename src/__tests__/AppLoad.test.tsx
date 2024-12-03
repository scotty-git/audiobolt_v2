import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import './setup/testSetup';
import { supabase } from './mocks/supabaseClient';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the Supabase module
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => supabase
}));

// Mock Supabase auth methods
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: () => Promise.resolve({ 
                data: { 
                    user: { 
                        id: 'test-user-id',
                        email: 'test@example.com',
                        role: 'user'
                    } 
                }, 
                error: null 
            }),
            onAuthStateChange: () => ({
                data: {
                    subscription: {
                        unsubscribe: () => {}
                    }
                }
            })
        }
    }
}));

// Import App after mocks are set up
import App from '../App';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
};

describe('App Load Test', () => {
    it('should load without crashing', async () => {
        // Render the app with wrapper
        const { container } = render(<App />, { wrapper: TestWrapper });

        // Wait for initial render and auth state to settle
        await waitFor(() => {
            // Check that the app rendered something
            expect(container.firstChild).toBeTruthy();
        });

        // Check for error messages
        const errorMessages = screen.queryByText(/something went wrong/i);
        expect(errorMessages).toBeFalsy();
    });

    it('should show main content', async () => {
        const { container } = render(<App />, { wrapper: TestWrapper });

        // Wait for and verify essential UI elements
        await waitFor(() => {
            // The app should render some content
            expect(container.innerHTML).not.toBe('');
            
            // Should not show error messages
            expect(screen.queryByText(/error/i)).toBeFalsy();
            expect(screen.queryByText(/something went wrong/i)).toBeFalsy();
        });
    });

    it('should initialize core services', async () => {
        render(<App />, { wrapper: TestWrapper });
        
        // Wait for initialization and auth state to settle
        await waitFor(() => {
            // Should not show error messages
            expect(screen.queryByText(/something went wrong/i)).toBeFalsy();
        }, { timeout: 2000 });
    });
}); 