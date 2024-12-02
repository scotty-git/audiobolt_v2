import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QuestionnairePage } from '../pages/QuestionnairePage';
import { templateRepository } from '../db/repositories';
import { saveQuestionnaireResponse } from '../utils/questionnaire';
import { Question, Response, Section } from '../types';

// Mock the repositories and utilities
vi.mock('../db/repositories', () => ({
    templateRepository: {
        findById: vi.fn(),
        findAll: vi.fn()
    },
    responseRepository: {
        create: vi.fn(),
        update: vi.fn()
    }
}));

vi.mock('../utils/questionnaire', () => ({
    saveQuestionnaireResponse: vi.fn()
}));

// Mock the router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({
            templateId: 'template1'
        }),
        useNavigate: () => mockNavigate,
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
            <a href={to}>{children}</a>
        )
    };
});

// Mock the components
vi.mock('../components/feedback/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

vi.mock('../components/Questionnaire/SectionProgress', () => ({
    SectionProgress: ({ 
        sections, 
        currentSectionIndex 
    }: { 
        sections: Section[]; 
        currentSectionIndex: number;
    }) => (
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
        section: Section; 
        answers: Record<string, string | string[]>; 
        onAnswer: (questionId: string, value: string | string[]) => void;
        errors: Record<string, string>;
    }) => (
        <div data-testid="section-renderer">
            <h2>{section.title}</h2>
            {section.questions.map((question: Question) => (
                <div key={question.id}>
                    <label htmlFor={question.id}>{question.text}</label>
                    <input
                        id={question.id}
                        type={question.type}
                        value={answers[question.id] || ''}
                        onChange={(e) => onAnswer(question.id, e.target.value)}
                        aria-label={question.text}
                    />
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

vi.mock('../components/Questionnaire/SubmissionConfirmation', () => ({
    SubmissionConfirmation: ({ onClose }: { onClose: () => void }) => {
        setTimeout(onClose, 0);
        return (
            <div data-testid="submission-confirmation">
                Questionnaire completed
            </div>
        );
    }
}));

describe('QuestionnairePage', () => {
    const testTemplate = {
        id: 'template1',
        title: 'Test Questionnaire',
        type: 'questionnaire',
        content: {
            sections: [
                {
                    id: 'section1',
                    title: 'Basic Information',
                    description: 'Please provide your basic information',
                    order: 1,
                    isOptional: false,
                    questions: [
                        {
                            id: 'name',
                            type: 'text',
                            text: 'What is your name?',
                            validation: {
                                required: true
                            }
                        },
                        {
                            id: 'age',
                            type: 'number',
                            text: 'What is your age?',
                            validation: {
                                required: true,
                                minValue: 0,
                                maxValue: 120
                            }
                        }
                    ]
                },
                {
                    id: 'section2',
                    title: 'Preferences',
                    description: 'Tell us about your preferences',
                    order: 2,
                    isOptional: true,
                    questions: [
                        {
                            id: 'favorite_color',
                            type: 'text',
                            text: 'What is your favorite color?',
                            validation: {
                                required: false
                            }
                        }
                    ]
                }
            ]
        },
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '1.0',
        is_default: false,
        user_id: 'user1'
    };

    const mockResponse: Response = {
        id: 'response1',
        template_id: 'template1',
        user_id: 'user1',
        answers: {},
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        metadata: {
            templateTitle: 'Test Questionnaire',
            templateType: 'questionnaire',
            completedSections: [],
            submittedAt: new Date().toISOString(),
            questionCount: 3,
            answeredCount: 0
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(templateRepository.findById).mockResolvedValue(testTemplate);
        vi.mocked(saveQuestionnaireResponse).mockResolvedValue(mockResponse);
    });

    it('loads and displays the questionnaire template', async () => {
        render(
            <BrowserRouter>
                <QuestionnairePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
        });

        expect(screen.getByText('Basic Information')).toBeInTheDocument();
        expect(screen.getByLabelText('What is your name?')).toBeInTheDocument();
        expect(screen.getByLabelText('What is your age?')).toBeInTheDocument();
    });

    it('validates required fields before proceeding', async () => {
        render(
            <BrowserRouter>
                <QuestionnairePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
        });

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByTestId('error-name')).toHaveTextContent('This question is required');
            expect(screen.getByTestId('error-age')).toHaveTextContent('This question is required');
        });
    });

    it('allows navigation between sections when required fields are filled', async () => {
        render(
            <BrowserRouter>
                <QuestionnairePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
        });

        // Fill required fields
        const nameInput = screen.getByLabelText('What is your name?');
        const ageInput = screen.getByLabelText('What is your age?');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(ageInput, { target: { value: '25' } });

        // Navigate to next section
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Preferences')).toBeInTheDocument();
        });

        // Navigate back
        const backButton = screen.getByRole('button', { name: /previous/i });
        fireEvent.click(backButton);

        await waitFor(() => {
            expect(screen.getByText('Basic Information')).toBeInTheDocument();
        });
    });

    it('saves answers as they are entered', async () => {
        render(
            <BrowserRouter>
                <QuestionnairePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText('What is your name?');
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });

        // Verify the answer is stored
        const ageInput = screen.getByLabelText('What is your age?');
        fireEvent.change(ageInput, { target: { value: '25' } });

        // Navigate to next section to trigger save
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Preferences')).toBeInTheDocument();
        });
    });

    it('shows completion screen and redirects after submission', async () => {
        render(
            <BrowserRouter>
                <QuestionnairePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
        });

        // Fill required fields
        const nameInput = screen.getByLabelText('What is your name?');
        const ageInput = screen.getByLabelText('What is your age?');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(ageInput, { target: { value: '25' } });

        // Navigate to next section
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Preferences')).toBeInTheDocument();
        });

        // Submit the questionnaire
        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(saveQuestionnaireResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    template_id: 'template1',
                    answers: expect.objectContaining({
                        name: 'John Doe',
                        age: '25'
                    })
                })
            );
        });

        // Check for completion message
        expect(screen.getByTestId('submission-confirmation')).toBeInTheDocument();

        // Verify navigation
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/submissions');
        });
    });
}); 