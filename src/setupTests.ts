import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi, type TestFunction } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Extend globalThis type
declare global {
  var beforeEach: TestFunction;
  var afterEach: TestFunction;
  var storage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
}

// Make beforeEach and afterEach globally available
globalThis.beforeEach = beforeEach;
globalThis.afterEach = afterEach;

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock storage
export const storageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Make storage globally available for tests
globalThis.storage = storageMock;

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    platform: 'Test Platform',
    userAgent: 'Test User Agent',
  },
});