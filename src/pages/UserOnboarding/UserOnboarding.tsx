import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '../../types/onboarding';
import { useOnboardingProgress } from './hooks/useOnboardingProgress';
import { loadOnboardingFlow } from '../../utils/storage/supabaseStorage';
import { DatabaseError } from '../../repositories/errors';
import { LoadingSpinner } from '../../components/common';
import { SectionProgress } from '../../components/Questionnaire/SectionProgress';
import { SectionRenderer } from '../../components/Questionnaire/SectionRenderer';
import { templateRepository } from '../../db/repositories';
import { saveQuestionnaireResponse } from '../../utils/questionnaire';
import { v4 as uuidv4 } from 'uuid';

export const UserOnboarding: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<OnboardingFlow | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultFlowId, setDefaultFlowId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // First, try to get the default template ID if no flowId is provided
  useEffect(() => {
    const getDefaultFlow = async () => {
      if (!flowId) {
        try {
          const defaultTemplate = await templateRepository.findDefaultOnboarding();
          if (defaultTemplate) {
            setDefaultFlowId(defaultTemplate.id);
          } else {
            setError('No default onboarding template found');
          }
        } catch (error) {
          console.error('Error fetching default template:', error);
          setError('Failed to load default onboarding template');
        }
      }
    };

    getDefaultFlow();
  }, [flowId]);

  useEffect(() => {
    const loadFlow = async () => {
      const targetFlowId = flowId || defaultFlowId;
      if (!targetFlowId) {
        return; // Wait for defaultFlowId to be set if no flowId
      }

      try {
        setIsLoading(true);
        setError(null);
        const loadedFlow = await loadOnboardingFlow(targetFlowId);
        console.log('Loaded onboarding flow:', loadedFlow);
        
        if (!loadedFlow) {
          console.error('No onboarding flow found');
          setError('Onboarding flow not found');
          return;
        }

        setFlow(loadedFlow);
      } catch (error) {
        console.error('Error loading onboarding flow:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load onboarding flow');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFlow();
  }, [flowId, defaultFlowId]);

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
    if (!flow) return false;
    
    const section = flow.sections[sectionIndex];
    const sectionErrors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      if (question.validation?.required && !answers[question.id]) {
        sectionErrors[question.id] = 'This question is required';
        isValid = false;
      }
    });

    setErrors(sectionErrors);
    return isValid;
  };

  const handleComplete = async () => {
    if (!flow || !defaultFlowId) return;

    try {
      const response = {
        template_id: defaultFlowId,
        user_id: uuidv4(), // In a real app, this would be the logged-in user's ID
        answers: answers,
        metadata: {
          templateTitle: flow.title,
          type: 'onboarding',
          completedAt: new Date().toISOString()
        }
      };

      console.log('Saving onboarding response:', response);
      await saveQuestionnaireResponse(response);
      
      // Navigate to submissions page after successful save
      navigate('/submissions');
    } catch (error) {
      console.error('Error saving onboarding response:', error);
      setError('Failed to save your responses. Please try again.');
    }
  };

  const handleNext = () => {
    if (!validateSection(currentSectionIndex)) return;
    if (!flow) return;

    if (currentSectionIndex < flow.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!flow) {
    return <div>No onboarding flow found</div>;
  }

  const currentSection = flow.sections[currentSectionIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{flow.title}</h1>
        <p className="text-gray-600">{flow.description}</p>
      </div>

      <SectionProgress
        sections={flow.sections}
        currentSectionIndex={currentSectionIndex}
        completedSections={[]}
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
          onClick={handleBack}
          disabled={currentSectionIndex === 0}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentSectionIndex === flow.sections.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};