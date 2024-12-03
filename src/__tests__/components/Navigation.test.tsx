import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Navigation } from '../../components/layout/Navigation/Navigation';
import { createProvidersWithRole } from '../utils/test-utils';

describe('Navigation Component', () => {
    describe('as regular user', () => {
        beforeEach(async () => {
            // Clear any previous renders
            document.body.innerHTML = '';
            
            render(<Navigation />, { 
                wrapper: createProvidersWithRole('user') 
            });

            // Wait for auth state to be initialized and loading to complete
            await waitFor(() => {
                expect(screen.queryByText('Initializing...')).not.toBeInTheDocument();
            }, { timeout: 2000 });
        });

        it('renders the logo', async () => {
            await waitFor(() => {
                expect(screen.getByText('Self-Help Audio')).toBeInTheDocument();
            });
        });

        it('renders main navigation links', async () => {
            await waitFor(() => {
                expect(screen.getByText('Templates')).toBeInTheDocument();
                expect(screen.getByText('Submissions')).toBeInTheDocument();
            });
        });

        it('renders dropdown menus', async () => {
            await waitFor(() => {
                expect(screen.getByText('Onboarding')).toBeInTheDocument();
                expect(screen.getByText('Questionnaires')).toBeInTheDocument();
            });
        });

        it('renders mobile menu button on small screens', async () => {
            await waitFor(() => {
                expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
            });
        });

        it('has correct positioning without admin bar', async () => {
            await waitFor(() => {
                const header = screen.getByRole('banner');
                const classes = header.className.split(' ');
                expect(classes).toContain('top-0');
            });
        });
    });

    describe('as admin user', () => {
        beforeEach(async () => {
            // Clear any previous renders
            document.body.innerHTML = '';
            
            render(<Navigation />, { 
                wrapper: createProvidersWithRole('admin') 
            });

            // Wait for auth state to be initialized and loading to complete
            await waitFor(() => {
                expect(screen.queryByText('Initializing...')).not.toBeInTheDocument();
            }, { timeout: 2000 });
        });

        it('has correct positioning with admin bar', async () => {
            await waitFor(() => {
                const header = screen.getByRole('banner');
                const classes = header.className.split(' ');
                expect(classes).toContain('top-12');
            });
        });

        it('renders the same navigation elements', async () => {
            await waitFor(() => {
                expect(screen.getByText('Self-Help Audio')).toBeInTheDocument();
                expect(screen.getByText('Templates')).toBeInTheDocument();
                expect(screen.getByText('Submissions')).toBeInTheDocument();
                expect(screen.getByText('Onboarding')).toBeInTheDocument();
                expect(screen.getByText('Questionnaires')).toBeInTheDocument();
                expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
            });
        });
    });
}); 