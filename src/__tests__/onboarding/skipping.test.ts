import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingProgress } from '../../pages/UserOnboarding/hooks/useOnboardingProgress';

vi.mock('../../utils/onboarding/progressStorage', () => ({
  loadUserProgress: vi.fn(),
  saveUserProgress: vi.fn(),
}));

describe('Section and Question Skipping', () => {
  const mockProgress = {
    userId: 'test-user',
    flowId: 'test-flow',
    progress: {
      completedSections: [],
      skippedSections: [],
      currentSectionId: undefined,
      lastUpdated: new Date().toISOString(),
    },
    responses: [],
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  };

  const optionalSection = {
    id: 'section-2',
    title: 'Optional Section',
    description: 'This section can be skipped',
    order: 2,
    isOptional: true,
    questions: [
      {
        id: 'q2',
        type: 'text' as const,
        text: 'Optional question',
        required: false,
      },
    ],
  };

  it('allows skipping optional sections', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    act(() => {
      result.current.skipSection(optionalSection.id, optionalSection);
    });

    expect(result.current.progress.skippedSections).toContain(optionalSection.id);
  });

  it('tracks skipped questions as undefined in responses', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    act(() => {
      result.current.skipSection(optionalSection.id, optionalSection);
    });

    const questionId = optionalSection.questions[0].id;
    expect(result.current.responses[questionId]).toBeUndefined();
  });

  it('updates progress when skipping sections', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    act(() => {
      result.current.skipSection(optionalSection.id, optionalSection);
    });

    expect(result.current.progress.skippedSections).toHaveLength(1);
    expect(result.current.progress.lastUpdated).toBeDefined();
  });

  it('prevents skipping required sections', () => {
    const requiredSection = {
      ...optionalSection,
      isOptional: false,
    };

    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    expect(() => {
      act(() => {
        result.current.skipSection(requiredSection.id, requiredSection);
      });
    }).not.toThrow();

    expect(result.current.progress.skippedSections).not.toContain(requiredSection.id);
  });
});