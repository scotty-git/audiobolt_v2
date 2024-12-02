import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserOnboarding } from '../../pages/UserOnboarding/UserOnboarding';
import * as supabaseStorage from '../../utils/storage/supabaseStorage';

// Mock the storage layer
vi.mock('../../utils/storage/supabaseStorage');

// Mock router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({
      flowId: 'test-flow',
    }),
  };
});

const renderOnboarding = () => {
  return render(
    <BrowserRouter>
      <UserOnboarding />
    </BrowserRouter>
  );
};

describe('Basic Onboarding Flow', () => {
  const mockFlow = {
    id: 'test-flow',
    type: 'onboarding' as const,
    title: 'Test Flow',
    description: 'Test Description',
    status: 'published' as const,
    isDefault: true,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'section-1',
        title: 'Basic Information',
        description: 'Please provide your basic information',
        order: 1,
        isOptional: false,
        questions: [
          {
            id: 'name',
            type: 'text' as const,
            text: 'What is your name?',
            required: true,
          },
        ],
      },
    ],
    settings: {
      allowSkipSections: true,
      requireAllSections: false,
      showProgressBar: true,
      allowSaveProgress: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseStorage.loadOnboardingFlow).mockResolvedValue(mockFlow);
    vi.mocked(supabaseStorage.loadUserProgress).mockResolvedValue(null);
    vi.mocked(supabaseStorage.saveUserProgress).mockResolvedValue(undefined);
  });

  it('loads and displays the onboarding flow', async () => {
    renderOnboarding();

    // Check if the flow title is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Flow')).toBeInTheDocument();
    });

    // Check if the first section is displayed
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Please provide your basic information')).toBeInTheDocument();
  });

  it('handles basic form input', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/What is your name?/i)).toBeInTheDocument();
    });

    // Fill out the name field
    await user.type(screen.getByLabelText(/What is your name?/i), 'John Doe');

    // Check if the input value was updated
    expect(screen.getByLabelText(/What is your name?/i)).toHaveValue('John Doe');
  });
}); 