import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { templateRepository, responseRepository } from '../db/repositories';
import { saveQuestionnaireResponse } from '../utils/questionnaire';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { SectionProgress } from '../components/Questionnaire/SectionProgress';
import { SectionRenderer } from '../components/Questionnaire/SectionRenderer';
import { SubmissionConfirmation } from '../components/Questionnaire/SubmissionConfirmation';
import { v4 as uuidv4 } from 'uuid';
import { Template, Section, Question, Response } from '../types';

export const QuestionnairePage: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        if (!templateId) return;
        const loadedTemplate = await templateRepository.findById(templateId);
        if (loadedTemplate) {
          const parsedContent = typeof loadedTemplate.content === 'string' 
            ? JSON.parse(loadedTemplate.content)
            : loadedTemplate.content;
            
          console.log('Loaded template content:', parsedContent);
            
          setTemplate({
            ...loadedTemplate,
            sections: (parsedContent.sections || []).map((section: Partial<Section>, index: number) => ({
              id: section.id || uuidv4(),
              title: section.title || '',
              description: section.description || '',
              order: index + 1,
              isOptional: section.isOptional || false,
              questions: (section.questions || []).map((q: Partial<Question>) => {
                console.log('Processing question:', q);
                return {
                  id: q.id || uuidv4(),
                  text: q.text || '',
                  type: q.type || 'text',
                  validation: {
                    required: q.required || q.validation?.required || false,
                    minLength: q.validation?.minLength,
                    maxLength: q.validation?.maxLength,
                    minValue: q.validation?.minValue,
                    maxValue: q.validation?.maxValue,
                    step: q.validation?.step,
                    minSelected: q.validation?.minSelected
                  },
                  placeholder: q.placeholder,
                  description: q.description,
                  options: q.options?.map(opt => ({
                    label: opt.label || opt.text || '',
                    value: opt.value || opt.id || ''
                  }))
                };
              })
            }))
          });
        }
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setErrors(prev => ({
      ...prev,
      [questionId]: ''
    }));
  };

  const validateSection = (sectionIndex: number): boolean => {
    if (!template) return false;
    
    const section = template.sections[sectionIndex];
    const sectionErrors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach((question: Question) => {
      if (question.validation?.required && !answers[question.id]) {
        sectionErrors[question.id] = 'This question is required';
        isValid = false;
      }
    });

    setErrors(sectionErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateSection(currentSectionIndex)) return;
    if (!template) return;

    const currentSection = template.sections[currentSectionIndex];
    setCompletedSections(prev => [...prev, currentSection.id]);

    if (currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!template || !templateId) return;

    try {
      console.log('Current answers state:', answers);
      
      const formattedAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          acc[key] = value;
        } else {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string | string[]>);

      const response: Partial<Response> = {
        template_id: templateId,
        user_id: uuidv4(),
        answers: formattedAnswers,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        metadata: {
          templateTitle: template.title,
          templateType: template.type,
          completedSections,
          submittedAt: new Date().toISOString(),
          questionCount: template.sections.reduce((acc: number, section) => acc + section.questions.length, 0),
          answeredCount: Object.keys(answers).length
        }
      };

      console.log('Attempting to save response:', response);
      
      const savedResponse = await saveQuestionnaireResponse(response);
      console.log('Save response result:', savedResponse);

      if (!savedResponse) {
        throw new Error('Failed to save response');
      }

      setShowConfirmation(true);
      
      setTimeout(() => {
        navigate('/submissions');
      }, 2000);

    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Failed to submit questionnaire. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Template Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested questionnaire template could not be found.
          </p>
          <Link
            to="/questionnaires/user"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Questionnaires
          </Link>
        </div>
      </div>
    );
  }

  const currentSection = template.sections[currentSectionIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/questionnaires/user"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Questionnaires
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.title}</h1>
        <p className="text-gray-600">{template.description}</p>
      </div>

      <SectionProgress
        sections={template.sections}
        currentSectionIndex={currentSectionIndex}
        completedSections={completedSections}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <SectionRenderer
          section={currentSection}
          answers={answers}
          onAnswer={handleAnswer}
          errors={errors}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md
                   hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentSectionIndex === template.sections.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>

      {showConfirmation && (
        <SubmissionConfirmation
          onClose={() => {
            setShowConfirmation(false);
            navigate('/submissions');
          }}
        />
      )}
    </div>
  );
};