import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionRenderer } from '../../pages/UserOnboarding/components/QuestionRenderer';

describe('QuestionRenderer', () => {
  describe('Text Questions', () => {
    it('renders short text input correctly', () => {
      const question = {
        id: 'q1',
        type: 'text' as const,
        text: 'Test Question',
        required: true,
      };

      render(
        <QuestionRenderer
          question={question}
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Test Question')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your answer here...')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders long text input correctly', () => {
      const question = {
        id: 'q1',
        type: 'text' as const,
        text: 'Test Question',
        required: true,
        multiline: true,
      };

      render(
        <QuestionRenderer
          question={question}
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Test Question')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your answer here...')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Multiple Choice Questions', () => {
    it('renders all options correctly', () => {
      const question = {
        id: 'q1',
        type: 'choice' as const,
        text: 'Test Question',
        required: true,
        options: ['Option 1', 'Option 2'],
      };

      render(
        <QuestionRenderer
          question={question}
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Test Question')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles option selection correctly', async () => {
      const mockOnChange = vi.fn();
      const question = {
        id: 'q1',
        type: 'choice' as const,
        text: 'Test Question',
        required: true,
        options: ['Option 1', 'Option 2'],
      };

      render(
        <QuestionRenderer
          question={question}
          value=""
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'Option 1');
      expect(mockOnChange).toHaveBeenCalledWith('Option 1');
    });
  });
});