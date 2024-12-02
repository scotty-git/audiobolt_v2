import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { OnboardingFlow } from '../../pages/UserOnboarding/components/OnboardingFlow';
import { loadOnboardingFlow } from '../../utils/onboarding/flowStorage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../utils/onboarding/flowStorage');

const defaultOnboardingFlow = {
  id: 'test-flow',
  type: 'onboarding' as const,
  title: 'Getting Started',
  description: 'Basic information',
  status: 'published' as const,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: '1.0.0',
  sections: [
    {
      id: 'section-1',
      title: 'Getting Started',
      description: 'Basic information',
      order: 1,
      isOptional: false,
      questions: [
        {
          id: 'q1',
          type: 'text' as const,
          text: 'What is your name?',
          required: true,
        },
      ],
    },
  ],
  settings: {
    showProgressBar: true,
    allowSkipping: true,
  },
};

const renderOnboarding = () => {
  return render(
    <MemoryRouter initialEntries={[`/onboarding/${defaultOnboardingFlow.id}`]}>
      <Routes>
        <Route path="/onboarding/:flowId" element={<OnboardingFlow />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Onboarding Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders the onboarding title and description', async () => {
      vi.mocked(loadOnboardingFlow).mockResolvedValue(defaultOnboardingFlow);
      renderOnboarding();

      await waitFor(() => {
        expect(screen.getByText(defaultOnboardingFlow.sections[0].title)).toBeInTheDocument();
        expect(screen.getByText(defaultOnboardingFlow.sections[0].description)).toBeInTheDocument();
      });
    });
  });
});