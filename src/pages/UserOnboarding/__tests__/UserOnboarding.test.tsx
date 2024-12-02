import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserOnboarding } from '../UserOnboarding';
import { loadOnboardingFlow } from '../../../utils/storage/supabaseStorage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnboardingFlow } from '../../../types/onboarding';

// Mock the storage module
vi.mock('../../../utils/storage/supabaseStorage', () => ({
  loadOnboardingFlow: vi.fn(),
}));

// Mock the hooks
vi.mock('../hooks/useOnboardingProgress', () => ({
  useOnboardingProgress: () => ({
    responses: {},
    progress: {
      completedSections: [],
      skippedSections: [],
      currentSectionId: null,
    },
    saveStatus: 'saved',
    isLoading: false,
    handleResponse: vi.fn(),
    handleSkipSection: vi.fn(),
    handleComplete: vi.fn(),
    isCurrentSectionValid: () => true,
  }),
}));

describe('UserOnboarding', () => {
  const mockFlow: OnboardingFlow = {
    id: '123',
    title: 'Test Flow',
    description: 'Test onboarding flow',
    type: 'onboarding',
    status: 'published',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    sections: [
      {
        id: 'section1',
        title: 'Section 1',
        description: 'Test section',
        order: 1,
        isOptional: false,
        questions: [
          {
            id: 'q1',
            type: 'text',
            text: 'Test question',
            required: true,
          },
        ],
      },
    ],
    settings: {
      showProgressBar: true,
      allowSkipSections: true,
      requireAllSections: true,
      allowSaveProgress: true,
    },
  };

  const renderWithRouter = (flowId = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/onboarding/${flowId}`]}>
        <Routes>
          <Route path="/onboarding/:flowId" element={<UserOnboarding />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', async () => {
    vi.mocked(loadOnboardingFlow).mockImplementation(() => new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error message when flow ID is missing', async () => {
    renderWithRouter('');
    await waitFor(() => {
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  it('should show error message when flow is not found', async () => {
    vi.mocked(loadOnboardingFlow).mockResolvedValue(null);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Onboarding flow not found')).toBeInTheDocument();
    });
  });

  it('should render flow content when loaded successfully', async () => {
    vi.mocked(loadOnboardingFlow).mockResolvedValue(mockFlow);
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });
  });

  it('should show navigation buttons', async () => {
    vi.mocked(loadOnboardingFlow).mockResolvedValue(mockFlow);
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  it('should handle section navigation', async () => {
    const multiSectionFlow = {
      ...mockFlow,
      sections: [
        ...mockFlow.sections,
        {
          id: 'section2',
          title: 'Section 2',
          description: 'Second section',
          order: 2,
          isOptional: false,
          questions: [
            {
              id: 'q2',
              type: 'text',
              text: 'Second question',
              required: true,
            },
          ],
        },
      ],
    };

    vi.mocked(loadOnboardingFlow).mockResolvedValue(multiSectionFlow);
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });

    // Click next to go to second section
    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });
}); 