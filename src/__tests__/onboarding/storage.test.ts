import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveUserProgress, loadUserProgress } from '../../utils/onboarding/progressStorage';
import { UserProgress, Response } from '../../types/onboarding';
import { storageMock } from '../../setupTests';

describe('Response Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProgress: UserProgress = {
    userId: 'user-1',
    flowId: 'flow-1',
    progress: {
      completedSections: ['section-1'],
      skippedSections: [],
      currentSectionId: 'section-2',
      lastUpdated: new Date().toISOString()
    },
    responses: [],
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      deviceInfo: 'test',
      userAgent: 'test'
    }
  };

  it('saves and loads text responses correctly', () => {
    const textResponse: Response = {
      questionId: 'q1',
      value: 'test answer',
      timestamp: new Date().toISOString()
    };

    mockProgress.responses = [textResponse];
    
    saveUserProgress(mockProgress);
    storageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));

    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.responses[0].value).toBe('test answer');
  });

  it('saves and loads multiple choice responses correctly', () => {
    const mcResponse: Response = {
      questionId: 'q2',
      value: ['option1', 'option2'],
      timestamp: new Date().toISOString()
    };

    mockProgress.responses = [mcResponse];
    
    saveUserProgress(mockProgress);
    storageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));

    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.responses[0].value).toEqual(['option1', 'option2']);
  });

  it('saves and loads slider responses correctly', () => {
    const sliderResponse: Response = {
      questionId: 'q3',
      value: 5,
      timestamp: new Date().toISOString()
    };

    mockProgress.responses = [sliderResponse];
    
    saveUserProgress(mockProgress);
    storageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));

    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.responses[0].value).toBe(5);
  });

  it('resumes from last completed section', () => {
    saveUserProgress(mockProgress);
    storageMock.getItem.mockReturnValue(JSON.stringify(mockProgress));
    
    const loaded = loadUserProgress('user-1', 'flow-1');
    expect(loaded?.progress.currentSectionId).toBe('section-2');
    expect(loaded?.progress.completedSections).toContain('section-1');
  });
});