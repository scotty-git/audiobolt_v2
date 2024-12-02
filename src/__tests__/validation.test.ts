import { describe, it, expect } from 'vitest';
import { validateTemplate, validateQuestion } from '../utils/validation';
import { OnboardingFlow } from '../types/onboarding';

describe('Template Validation', () => {
  const sampleTemplate: OnboardingFlow = {
    id: 'test-1',
    title: 'Test Template',
    description: 'Test Description',
    type: 'onboarding',
    version: '1.0.0',
    sections: [
      {
        id: 'section-1',
        title: 'Section 1',
        description: 'Test Section',
        order: 1,
        isOptional: false,
        questions: [
          {
            id: 'q1',
            type: 'text',
            text: 'Test Question',
            validation: { required: true },
            description: 'Test question description'
          },
        ],
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    },
    settings: {
      allowSkipSections: false,
      requireAllSections: true,
      showProgressBar: true,
      allowSaveProgress: true,
    },
  };

  it('validates a correct template', () => {
    const result = validateTemplate(sampleTemplate);
    expect(result.success).toBe(true);
  });

  it('fails on invalid template structure', () => {
    const invalidTemplate = {
      ...sampleTemplate,
      sections: 'not-an-array',
    };
    const result = validateTemplate(invalidTemplate);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('validates required fields', () => {
    const incompleteTemplate = {
      ...sampleTemplate,
      title: '',
    };
    const result = validateTemplate(incompleteTemplate);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe('Question Validation', () => {
  const validQuestion = {
    id: 'q1',
    type: 'text' as const,
    text: 'Test Question',
    description: 'Test question description',
    validation: { required: true },
  };

  it('validates a correct question', () => {
    const result = validateQuestion(validQuestion);
    expect(result.success).toBe(true);
  });

  it('fails on invalid question type', () => {
    const invalidQuestion = {
      ...validQuestion,
      type: 'invalid-type',
    };
    const result = validateQuestion(invalidQuestion);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});