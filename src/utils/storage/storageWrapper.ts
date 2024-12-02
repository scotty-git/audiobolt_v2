import { OnboardingFlow, UserProgress } from '../../types/onboarding';

// Storage interface that matches localStorage API
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Default to using localStorage
const defaultStorage: Storage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
};

// Export the storage instance
export const storage = defaultStorage;

// Helper functions for common operations
export const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return null;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} in storage:`, error);
    throw error;
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from storage:`, error);
    throw error;
  }
}; 