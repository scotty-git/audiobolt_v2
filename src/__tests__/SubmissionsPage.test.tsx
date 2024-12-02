import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SubmissionsPage } from '../pages/SubmissionsPage';
import { responseRepository } from '../db/repositories';
import { templateRepository } from '../db/repositories';
import { BrowserRouter } from 'react-router-dom';

// Mock the repositories
vi.mock('../db/repositories', () => ({
    responseRepository: {
        findAll: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    },
    templateRepository: {
        findAll: vi.fn()
    }
}));

// Mock the SubmissionDetails component
vi.mock('../components/Submissions/SubmissionDetails', () => ({
    SubmissionDetails: ({ response, template }: any) => {
        const answers = typeof response.answers === 'string' 
            ? JSON.parse(response.answers) 
            : response.answers;

        return (
            <div role="dialog" aria-label="Submission Details">
                <h2>Submission Details</h2>
                <div>
                    <p>{template.title}</p>
                    {Object.entries(answers).map(([key, value]) => (
                        <div key={key}>
                            <p>{key}</p>
                            <p>{value as string}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}));

describe('SubmissionsPage', () => {
    const testSubmissions = [
        {
            id: '1',
            template_id: 'template1',
            user_id: 'user1',
            answers: JSON.stringify({ question1: 'answer1' }),
            started_at: '2024-01-01T00:00:00Z',
            completed_at: '2024-01-01T00:30:00Z',
            last_updated: '2024-01-01T00:30:00Z'
        }
    ];

    const testTemplates = [
        {
            id: 'template1',
            title: 'Test Template',
            type: 'questionnaire',
            content: JSON.stringify({
                sections: [{
                    id: 'section1',
                    title: 'Test Section',
                    questions: [{
                        id: 'question1',
                        text: 'Test Question',
                        type: 'text'
                    }]
                }]
            }),
            is_default: false,
            status: 'published',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            version: '1.0',
            user_id: 'user1'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(responseRepository.findAll).mockResolvedValue(testSubmissions);
        vi.mocked(templateRepository.findAll).mockResolvedValue(testTemplates);
    });

    it('loads and displays submissions', async () => {
        render(
            <BrowserRouter>
                <SubmissionsPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeInTheDocument();
        });

        expect(responseRepository.findAll).toHaveBeenCalled();
        expect(templateRepository.findAll).toHaveBeenCalled();
    });

    it('selects submission when view details button is clicked', async () => {
        render(
            <BrowserRouter>
                <SubmissionsPage />
            </BrowserRouter>
        );

        // Wait for submissions to load
        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeInTheDocument();
        });

        // Find and click the view button
        const viewButton = screen.getByRole('button', { name: /view submission/i });
        fireEvent.click(viewButton);

        // Verify the submission is selected (modal should open)
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    it('displays submission details in modal when submission is selected', async () => {
        render(
            <BrowserRouter>
                <SubmissionsPage />
            </BrowserRouter>
        );

        // Wait for submissions to load
        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeInTheDocument();
        });
        
        // Find and click the view button
        const viewButton = screen.getByRole('button', { name: /view submission/i });
        fireEvent.click(viewButton);

        // Verify the details are displayed correctly
        await waitFor(() => {
            // Check for modal title
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Submission Details')).toBeInTheDocument();
            expect(screen.getByText('answer1')).toBeInTheDocument();
        });
    });
}); 