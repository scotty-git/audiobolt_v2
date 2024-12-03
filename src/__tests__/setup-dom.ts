import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.location
const mockLocation = {
    pathname: '/',
    search: '',
    hash: '',
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000/',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
};

// Create a proxy to track pathname changes
const locationProxy = new Proxy(mockLocation, {
    get(target, prop) {
        return target[prop as keyof typeof target];
    },
    set(target, prop, value) {
        if (prop === 'pathname') {
            // Update history state when pathname changes
            window.history.pushState({}, '', value);
        }
        target[prop as keyof typeof target] = value;
        return true;
    },
});

Object.defineProperty(window, 'location', {
    value: locationProxy,
    writable: true,
    configurable: true,
});

// Mock window.history
const mockHistory = {
    pushState: vi.fn((state, title, url) => {
        if (typeof url === 'string') {
            try {
                const parsedUrl = new URL(url.startsWith('http') ? url : `http://localhost:3000${url}`);
                locationProxy.pathname = parsedUrl.pathname;
            } catch (error) {
                console.error('Invalid URL:', url);
            }
        }
    }),
    replaceState: vi.fn((state, title, url) => {
        if (typeof url === 'string') {
            try {
                const parsedUrl = new URL(url.startsWith('http') ? url : `http://localhost:3000${url}`);
                locationProxy.pathname = parsedUrl.pathname;
            } catch (error) {
                console.error('Invalid URL:', url);
            }
        }
    }),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    state: null,
    length: 1,
    scrollRestoration: 'auto' as const,
};

Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
    configurable: true,
});

// Mock window.dispatchEvent
const originalDispatchEvent = window.dispatchEvent;
window.dispatchEvent = vi.fn((event) => {
    if (event.type === 'popstate') {
        // Handle navigation events
        const pathname = window.location.pathname;
        locationProxy.pathname = pathname;
    } else if (event.type === 'PASSWORD_RECOVERY') {
        // Handle password recovery events
        window.history.pushState({}, '', '/auth/reset-password?token=valid-token');
    }
    return originalDispatchEvent.call(window, event);
}); 