import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '../../pages/auth/SignUp';
import { AllTheProviders } from '../utils/test-utils';

describe('Form Components', () => {
    beforeEach(async () => {
        // Clear any previous renders
        document.body.innerHTML = '';
    });

    describe('SignUp Form', () => {
        it('renders all form fields', async () => {
            await act(async () => {
                render(<SignUp />, { wrapper: AllTheProviders });
            });
            
            expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /creating account|sign up/i })).toBeInTheDocument();
        });

        it('renders sign in link', async () => {
            await act(async () => {
                render(<SignUp />, { wrapper: AllTheProviders });
            });
            expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
        });

        it('validates required fields', async () => {
            const user = userEvent.setup();
            await act(async () => {
                render(<SignUp />, { wrapper: AllTheProviders });
            });
            
            const submitButton = screen.getByRole('button', { name: /creating account|sign up/i });
            await act(async () => {
                await user.click(submitButton);
            });
            
            // Check for validation messages
            const emailInput = screen.getByPlaceholderText(/email address/i);
            expect(emailInput).toBeInvalid();
            expect(emailInput).toHaveAttribute('required');
        });
    });
}); 