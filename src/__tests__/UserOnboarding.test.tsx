import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UserOnboarding } from '../pages/UserOnboarding/UserOnboarding';
import { templateRepository } from '../db/repositories';
import { saveQuestionnaireResponse } from '../utils/questionnaire';
import { loadOnboardingFlow } from '../utils/storage/supabaseStorage';
import { defaultOnboardingFlow } from '../data/defaultOnboardingFlow';
import { v4 } from 'uuid';
import { act } from 'react';

// Mock the repositories and utilities
vi.mock('../db/repositories', () => ({
    templateRepository: {
        findById: vi.fn(),
        findAll: vi.fn(),
        findDefaultOnboarding: vi.fn()
    }
}));

vi.mock('../utils/questionnaire', () => ({
    saveQuestionnaireResponse: vi.fn()
}));

vi.mock('../utils/storage/supabaseStorage', () => ({
    loadOnboardingFlow: vi.fn()
}));

// Mock the router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({
            flowId: 'test-flow-id'
        }),
        useNavigate: () => mockNavigate
    };
});

// Mock the components
vi.mock('../components/common', () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

vi.mock('../components/Questionnaire/SectionProgress', () => ({
    SectionProgress: ({ sections, currentSectionIndex }: { sections: any[]; currentSectionIndex: number }) => (
        <div data-testid="section-progress">
            Section {currentSectionIndex + 1} of {sections.length}
        </div>
    )
}));

vi.mock('../components/Questionnaire/SectionRenderer', () => ({
    SectionRenderer: ({ 
        section, 
        answers, 
        onAnswer, 
        errors 
    }: { 
        section: any; 
        answers: Record<string, string>; 
        onAnswer: (id: string, value: string) => void;
        errors: Record<string, string>;
    }) => (
        <div data-testid="section-renderer">
            <h2>{section.title}</h2>
            {section.questions.map((question: any) => (
                <div key={question.id}>
                    <label htmlFor={question.id}>{question.text}</label>
                    {question.type === 'select' ? (
                        <select
                            id={question.id}
                            value={answers[question.id] || ''}
                            onChange={(e) => onAnswer(question.id, e.target.value)}
                            aria-label={question.text}
                        >
                            <option value="">Select...</option>
                            {question.options?.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id={question.id}
                            type={question.type}
                            value={answers[question.id] || ''}
                            onChange={(e) => onAnswer(question.id, e.target.value)}
                            aria-label={question.text}
                        />
                    )}
                    {errors[question.id] && (
                        <p className="text-red-600" data-testid={`error-${question.id}`}>
                            {errors[question.id]}
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}));

// Mock uuid
vi.mock('uuid', () => ({
    v4: () => 'test-user-id'
}));

describe('UserOnboarding', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(templateRepository.findDefaultOnboarding).mockResolvedValue({
            id: 'test-flow-id',
            title: 'Initial User Onboarding',
            type: 'onboarding',
            isDefault: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
        });
        vi.mocked(loadOnboardingFlow).mockResolvedValue({
            id: 'test-flow-id',
            title: 'Initial User Onboarding',
            description: 'Help us get to know you better so we can create the perfect self-help audiobook tailored to your needs.',
            version: '1.0.0',
            type: 'onboarding',
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sections: [
                {
                    id: 'personal-info',
                    title: 'Personal Information',
                    description: 'Tell us a bit about yourself.',
                    order: 0,
                    isOptional: false,
                    questions: [
                        {
                            id: 'full-name',
                            type: 'text',
                            text: 'What is your full name?',
                            validation: { required: true }
                        },
                        {
                            id: 'age',
                            type: 'number',
                            text: 'What is your age?',
                            validation: { required: true }
                        },
                        {
                            id: 'location',
                            type: 'text',
                            text: 'Where are you located?',
                            validation: { required: true }
                        },
                        {
                            id: 'gender',
                            type: 'text',
                            text: 'What is your gender?',
                            validation: { required: true }
                        }
                    ]
                },
                {
                    id: 'core-values',
                    title: 'Your Core Values',
                    description: 'Help us understand what drives and motivates you.',
                    order: 1,
                    isOptional: false,
                    questions: [
                        {
                            id: 'guiding-principles',
                            type: 'text',
                            text: 'What values or principles guide your decisions?',
                            validation: { required: true }
                        },
                        {
                            id: 'motivational-factors',
                            type: 'text',
                            text: 'What motivates you the most? (Select all that apply)',
                            validation: { required: true }
                        }
                    ]
                },
                {
                    id: 'self-reflection',
                    title: 'Self-Reflection',
                    description: 'Reflect on your current challenges and aspirations.',
                    order: 2,
                    isOptional: false,
                    questions: [
                        {
                            id: 'main-challenges',
                            type: 'text',
                            text: "What are the biggest challenges you're currently facing?",
                            validation: { required: true }
                        },
                        {
                            id: 'personal-achievements',
                            type: 'text',
                            text: "What are several things you're proud of achieving?",
                            validation: { required: true }
                        }
                    ]
                },
                {
                    id: 'goals',
                    title: 'Your Goals and Aspirations',
                    description: "Let's explore what you want to achieve.",
                    order: 3,
                    isOptional: false,
                    questions: [
                        {
                            id: 'short-term-goals',
                            type: 'text',
                            text: 'What are your most important short-term goals? Feel free to list several.',
                            validation: { required: true }
                        },
                        {
                            id: 'long-term-goals',
                            type: 'text',
                            text: 'What are your most important long-term goals? Feel free to list several.',
                            validation: { required: true }
                        }
                    ]
                },
                {
                    id: 'strengths',
                    title: 'Your Strengths',
                    description: 'Understanding your strengths helps us craft personalized guidance.',
                    order: 4,
                    isOptional: false,
                    questions: [
                        {
                            id: 'top-strengths',
                            type: 'text',
                            text: 'If people were asked about you, what would they say your top three strengths are?',
                            validation: { required: true }
                        },
                        {
                            id: 'strength-application',
                            type: 'text',
                            text: 'How have these strengths helped you achieve your goals?',
                            validation: { required: true }
                        }
                    ]
                }
            ],
            settings: {
                allowSkipSections: false,
                showProgressBar: true,
                shuffleSections: false,
                completionMessage: "Thank you for completing the onboarding process! We're excited to help you on your journey."
            },
            status: 'active'
        });
        vi.mocked(saveQuestionnaireResponse).mockResolvedValue({
            id: 'response1',
            template_id: 'test-flow-id',
            user_id: 'test-user-id',
            answers: {},
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            metadata: {
                templateTitle: 'Initial User Onboarding',
                type: 'onboarding',
                completedAt: new Date().toISOString()
            }
        });
    });

    it('loads and displays the onboarding flow', async () => {
        render(
            <BrowserRouter>
                <UserOnboarding />
            </BrowserRouter>
        );

        // First, we should see the loading spinner
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

        // Wait for the content to load
        await waitFor(() => {
            expect(screen.getByText('Initial User Onboarding')).toBeInTheDocument();
        });

        // Check if the first section is displayed
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByLabelText('What is your full name?')).toBeInTheDocument();
        expect(screen.getByLabelText('What is your age?')).toBeInTheDocument();
        expect(screen.getByLabelText('What is your gender?')).toBeInTheDocument();
    });

    it('validates required fields before proceeding', async () => {
        render(
            <BrowserRouter>
                <UserOnboarding />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Initial User Onboarding')).toBeInTheDocument();
            expect(screen.getByText('Personal Information')).toBeInTheDocument();
        });

        // Try to proceed without filling required fields
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        // Check for validation errors
        await waitFor(() => {
            const errorMessages = screen.getAllByText('This question is required');
            expect(errorMessages.length).toBeGreaterThan(0);
        }, { timeout: 5000 });
    });

    it('allows navigation when required fields are filled', async () => {
        render(
            <BrowserRouter>
                <UserOnboarding />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Initial User Onboarding')).toBeInTheDocument();
        });

        // Fill required fields
        const nameInput = screen.getByLabelText('What is your full name?');
        const ageInput = screen.getByLabelText('What is your age?');
        const locationInput = screen.getByLabelText('Where are you located?');
        const genderInput = screen.getByLabelText('What is your gender?');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(ageInput, { target: { value: '25' } });
        fireEvent.change(locationInput, { target: { value: 'New York, USA' } });
        fireEvent.change(genderInput, { target: { value: 'male' } });

        // Try to proceed
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        // Should move to next section
        await waitFor(() => {
            expect(screen.getByText('Your Core Values')).toBeInTheDocument();
            expect(screen.queryByText('Personal Information')).not.toBeInTheDocument();
        });
    });

    it('saves answers as they are entered', async () => {
        render(
            <BrowserRouter>
                <UserOnboarding />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Initial User Onboarding')).toBeInTheDocument();
            expect(screen.getByText('Personal Information')).toBeInTheDocument();
        });

        // Fill out some fields
        const nameInput = screen.getByLabelText('What is your full name?');
        const ageInput = screen.getByLabelText('What is your age?');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(ageInput, { target: { value: 25 } });

        // Values should persist
        expect(nameInput).toHaveValue('John Doe');
        expect(ageInput).toHaveValue(25);
    });
}); 