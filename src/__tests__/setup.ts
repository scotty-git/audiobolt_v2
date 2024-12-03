import { afterAll, afterEach, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

// Configure MSW handlers
export const handlers = [
    // Sign Up endpoint
    http.post(`${SUPABASE_URL}/auth/v1/signup`, async ({ request }) => {
        const body = await request.json();
        const { email } = body;
        
        if (email === 'invalid-email') {
            return HttpResponse.json(
                { error: { message: 'Please enter a valid email address' } },
                { status: 400 }
            );
        }

        return HttpResponse.json({
            user: { id: '123', email },
            session: null
        }, { status: 200 });
    }),

    // Sign In endpoint
    http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
        const url = new URL(request.url);
        const grantType = url.searchParams.get('grant_type');
        
        if (grantType === 'password') {
            const body = await request.json();
            const { email, password } = body;
            
            if (password === 'wrongpassword') {
                return HttpResponse.json(
                    { error: { message: 'Invalid login credentials' } },
                    { status: 400 }
                );
            }

            return HttpResponse.json({
                user: { id: '123', email },
                session: { 
                    access_token: 'valid-token',
                    refresh_token: 'valid-refresh-token',
                    user: { id: '123', email }
                }
            }, { status: 200 });
        }

        if (grantType === 'refresh_token') {
            return HttpResponse.json({
                user: { id: '123', email: 'test@example.com' },
                session: { 
                    access_token: 'valid-token',
                    refresh_token: 'valid-refresh-token',
                    user: { id: '123', email: 'test@example.com' }
                }
            }, { status: 200 });
        }

        return HttpResponse.json(
            { error: { message: 'Invalid grant type' } },
            { status: 400 }
        );
    }),

    // Password Reset endpoint
    http.post(`${SUPABASE_URL}/auth/v1/recover`, () => {
        return HttpResponse.json({
            data: {},
            error: null
        }, { status: 200 });
    }),

    // Update User (Password Reset) endpoint
    http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json({
            user: { id: '123', email: 'test@example.com' },
            error: null
        }, { status: 200 });
    }),

    // Sign Out endpoint
    http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
        return HttpResponse.json({
            error: null
        }, { status: 200 });
    }),

    // Get User endpoint
    http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
        return HttpResponse.json({
            user: { id: '123', email: 'test@example.com' }
        }, { status: 200 });
    }),

    // Password Recovery endpoint
    http.post(`${SUPABASE_URL}/auth/v1/verify`, () => {
        return HttpResponse.json({
            user: { id: '123', email: 'test@example.com' },
            session: null,
            error: null
        }, { status: 200 });
    }),

    // Auth State Change endpoint
    http.post(`${SUPABASE_URL}/auth/v1/auth/event`, () => {
        return HttpResponse.json({
            event: 'SIGNED_OUT',
            session: null
        }, { status: 200 });
    }),

    // Auth State Change endpoint (Password Recovery)
    http.post(`${SUPABASE_URL}/auth/v1/auth/event/password_recovery`, () => {
        return HttpResponse.json({
            event: 'PASSWORD_RECOVERY',
            session: null
        }, { status: 200 });
    }),

    // Auth State Change endpoint (Sign Out)
    http.post(`${SUPABASE_URL}/auth/v1/auth/event/sign_out`, () => {
        return HttpResponse.json({
            event: 'SIGNED_OUT',
            session: null
        }, { status: 200 });
    })
];

// Set up MSW server
export const server = setupServer(...handlers);

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
    server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close()); 