import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveQuestionnaire, loadQuestionnaire, clearQuestionnaire } from '../utils/storage/localStorage';
import { OnboardingFlow } from '../types/onboarding';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('LocalStorage Utils', () => {
  const sampleQuestionnaire: OnboardingFlow = {
    id: '1',
    title: 'Test Questionnaire',
    description: 'Test Description',
    type: 'onboarding',
    status: 'draft',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    sections: [
      {
        id: 'q1',
        title: 'Test Section',
        description: 'Test Section Description',
        order: 1,
        isOptional: false,
        questions: [
          {
            id: 'q1-1',
            type: 'text',
            text: 'Test Question',
            required: true,
          },
        ],
      },
    ],
    settings: {
      allowSkipSections: false,
      requireAllSections: true,
      showProgressBar: true,
      allowSaveProgress: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves questionnaire to localStorage', () => {
    saveQuestionnaire(sampleQuestionnaire);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'questionnaire',
      JSON.stringify(sampleQuestionnaire)
    );
  });

  it('loads questionnaire from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleQuestionnaire));
    const loaded = loadQuestionnaire();
    expect(loaded).toEqual(sampleQuestionnaire);
  });

  it('returns null when no questionnaire exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const loaded = loadQuestionnaire();
    expect(loaded).toBeNull();
  });

  it('clears questionnaire from localStorage', () => {
    clearQuestionnaire();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('questionnaire');
  });
});