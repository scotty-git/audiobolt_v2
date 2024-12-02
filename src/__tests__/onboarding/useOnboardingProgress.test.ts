import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingProgress } from '../../pages/UserOnboarding/hooks/useOnboardingProgress';
import { saveUserProgress } from '../../utils/onboarding/progressStorage';

vi.mock('../../utils/onboarding/progressStorage', () => ({
  loadUserProgress: vi.fn(),
  saveUserProgress: vi.fn(),
}));

describe('useOnboardingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty responses and progress', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    expect(result.current.progress.completedSections).toEqual([]);
    expect(result.current.progress.skippedSections).toEqual([]);
    expect(result.current.responses).toEqual({});
  });

  it('handles question responses correctly', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    const questionId = 'q1';

    act(() => {
      result.current.handleResponse(questionId, 'test answer');
    });

    expect(Object.keys(result.current.responses)).toHaveLength(1);
    expect(result.current.responses[questionId].value).toBe('test answer');
  });

  it('handles section skipping correctly', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    const sectionId = 'section-2';

    act(() => {
      result.current.skipSection(sectionId);
    });

    expect(result.current.progress.skippedSections).toContain(sectionId);
  });

  it('validates section completion correctly', () => {
    const { result } = renderHook(() => useOnboardingProgress('test-flow'));
    const section = {
      id: 'section-1',
      title: 'Test Section',
      description: 'Test description',
      order: 1,
      isOptional: false,
      questions: [
        {
          id: 'q1',
          type: 'text' as const,
          text: 'Required question',
          required: true,
        },
      ],
    };

    expect(result.current.isCurrentSectionValid(section)).toBe(false);

    act(() => {
      result.current.handleResponse('q1', 'test answer');
    });

    expect(result.current.isCurrentSectionValid(section)).toBe(true);
  });

  it('saves progress on completion', async () => {
    const mockSaveProgress = vi.fn().mockResolvedValue(undefined);
    vi.mocked(saveUserProgress).mockImplementation(mockSaveProgress);

    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    await act(async () => {
      result.current.handleResponse('q1', 'test answer');
      result.current.completeSection('section-1');
      result.current.skipSection('section-2');
      await result.current.completeOnboarding();
    });

    expect(mockSaveProgress).toHaveBeenCalled();
    expect(result.current.saveStatus).toBe('saved');
  });

  it('handles autosave correctly', async () => {
    vi.useFakeTimers();
    const mockSaveProgress = vi.fn().mockResolvedValue(undefined);
    vi.mocked(saveUserProgress).mockImplementation(mockSaveProgress);

    const { result } = renderHook(() => useOnboardingProgress('test-flow'));

    act(() => {
      result.current.handleResponse('q1', 'test answer');
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockSaveProgress).toHaveBeenCalled();
    expect(result.current.saveStatus).toBe('saved');

    vi.useRealTimers();
  });
});