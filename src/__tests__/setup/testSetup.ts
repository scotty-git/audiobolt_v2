import { vi } from 'vitest';
import '@testing-library/jest-dom';
import './env';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

// Mock window location
const mockWindow = {
    location: {
        pathname: '/',
        search: '',
        hash: '',
        host: 'localhost:3000',
        hostname: 'localhost',
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        port: '3000',
        protocol: 'http:',
    }
};

// Setup window mock
Object.defineProperty(window, 'location', {
    value: mockWindow.location,
    writable: true
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    length: 0,
    key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock fetch
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock console methods for testing
const originalConsole = { ...console };

beforeEach(() => {
    // Reset console mocks before each test
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
});

afterEach(() => {
    // Restore console after each test
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    
    // Clear all mocks
    vi.clearAllMocks();
});

// Utility function for rendering with router
export const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}; 