# Application Architecture

## Overview

The application follows a modular architecture with clear separation of concerns, designed to handle both onboarding flows and questionnaires in a flexible, maintainable way. It leverages Supabase for real-time database capabilities and robust security.

## Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── forms/           # Form-related components
│   ├── flows/           # Flow-specific components
│   │   ├── onboarding/  # Onboarding components
│   │   └── questionnaire/ # Questionnaire components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── pages/               # Main application views
├── lib/                 # Core libraries
│   ├── supabase.ts     # Supabase client
│   ├── validation.ts   # Validation utilities
│   └── errors.ts       # Error handling
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## Flow Architecture

### Component Hierarchy
```
UserOnboarding
├── SectionRenderer
│   ├── QuestionRenderer
│   │   ├── TextInput
│   │   ├── MultipleChoice
│   │   ├── Checkbox
│   │   └── CustomInputs
│   └── ValidationLayer
└── SectionProgress
    ├── ProgressBar
    └── NavigationControls
```

### Flow Components
```typescript
// Base Flow Component
interface FlowProps {
  template: Template;
  onComplete: (data: FlowData) => void;
  onError: (error: Error) => void;
}

// Onboarding Flow
const OnboardingFlow: React.FC<FlowProps> = ({
  template,
  onComplete,
  onError
}) => {
  const [state, setState] = useState<OnboardingState>(initialState);
  
  // Flow-specific logic
  const handleSectionComplete = async (sectionId: string, data: any) => {
    await saveProgress(sectionId, data);
    proceedToNextSection();
  };
  
  return (
    <FlowErrorBoundary>
      <SectionRenderer
        section={currentSection}
        onComplete={handleSectionComplete}
        onSkip={handleSkipSection}
      />
    </FlowErrorBoundary>
  );
};

// Questionnaire Flow
const QuestionnaireFlow: React.FC<FlowProps> = ({
  template,
  onComplete,
  onError
}) => {
  // Similar structure to OnboardingFlow but with
  // questionnaire-specific logic
};
```

### Form Components
```typescript
// Form Container
interface FormContainerProps {
  initialValues: Record<string, any>;
  validationSchema: ValidationSchema;
  onSubmit: (values: any) => Promise<void>;
}

// Question Types
type QuestionType = 
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio';

// Question Component
interface QuestionProps {
  type: QuestionType;
  value: any;
  onChange: (value: any) => void;
  validation?: ValidationRule[];
}
```

### Navigation Components
```typescript
interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

const NavigationControls: React.FC<NavigationProps> = (props) => {
  // Navigation logic
};
```

## State Management

### Form State
```typescript
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const useFormState = (config: FormConfig) => {
  const [state, setState] = useState<FormState>(initialState);
  
  // Form state management
  const handleChange = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value }
    }));
  };
  
  return {
    ...state,
    handleChange,
    handleBlur,
    handleSubmit
  };
};
```

### Progress State
```typescript
interface ProgressState {
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  responses: Record<string, any>;
}

const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  
  // Progress tracking
  const markStepComplete = (stepId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }));
  };
  
  return {
    progress,
    markStepComplete,
    markStepSkipped,
    canProceed
  };
};
```

## Validation System

### Rules
```typescript
interface ValidationRule {
  type: 'required' | 'pattern' | 'custom';
  message: string;
  validate: (value: any) => boolean;
}

const useValidation = (rules: ValidationRule[]) => {
  const validate = (value: any) => {
    for (const rule of rules) {
      const isValid = rule.validate(value);
      if (!isValid) {
        return { isValid: false, message: rule.message };
      }
    }
    return { isValid: true };
  };
  
  return { validate };
};
```

### Skip Section Logic
```typescript
const handleSkipSection = (sectionId: string) => {
  if (!canSkipSection(sectionId)) return;
  
  markSectionSkipped(sectionId);
  proceedToNextSection();
};

const canSkipSection = (sectionId: string): boolean => {
  const section = sections.find(s => s.id === sectionId);
  return section?.canSkip && !section?.isRequired;
};
```

## Data Flow

### Template Loading
```typescript
interface Template {
  id: string;
  type: 'onboarding' | 'questionnaire';
  sections: Section[];
  settings: TemplateSettings;
}

const useTemplate = (templateId: string) => {
  const [template, setTemplate] = useState<Template | null>(null);
  
  useEffect(() => {
    const loadTemplate = async () => {
      const { data, error } = await supabase
        .from('templates')
        .select()
        .eq('id', templateId)
        .single();
        
      if (error) throw error;
      setTemplate(data);
    };
    
    loadTemplate();
  }, [templateId]);
  
  return template;
};
```

### Response Handling
```typescript
interface Response {
  id: string;
  templateId: string;
  userId: string;
  answers: Record<string, any>;
  completedAt?: string;
}

const useResponses = () => {
  const saveResponse = async (response: Partial<Response>) => {
    const { data, error } = await supabase
      .from('responses')
      .insert(response);
      
    if (error) throw error;
    return data;
  };
  
  return {
    saveResponse,
    loadResponses,
    updateResponse
  };
};
```

## Error Handling

### Error Boundaries
```typescript
class FlowErrorBoundary extends React.Component<ErrorBoundaryProps> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
interface ApiError extends Error {
  code: string;
  details?: any;
}

const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return { message: 'Please check your input' };
    case 'NETWORK_ERROR':
      return { message: 'Connection lost' };
    default:
      return { message: 'An unexpected error occurred' };
  }
};
```

## Performance Optimization

### Component Optimization
```typescript
// Memoized Components
const MemoizedQuestion = React.memo(Question, (prev, next) => {
  return prev.value === next.value && prev.error === next.error;
});

// Lazy Loading
const LazyFlow = React.lazy(() => import('./components/Flow'));
```

### Data Caching
```typescript
const useDataCache = () => {
  const cache = new Map<string, { data: any; timestamp: number }>();
  
  const set = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };
  
  const get = (key: string) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > 5 * 60 * 1000) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  };
  
  return { set, get };
};
```

## Security

### Input Validation
```typescript
const validateInput = (value: any, rules: ValidationRule[]) => {
  for (const rule of rules) {
    const isValid = rule.validate(value);
    if (!isValid) {
      return { isValid: false, message: rule.message };
    }
  }
  return { isValid: true };
};
```

### Data Access Control
```typescript
// Row Level Security Policies
const setupRLS = () => {
  // Templates RLS
  sql`
    alter table templates enable row level security;
    
    create policy "Read published templates"
      on templates for select
      using (status = 'published');
      
    create policy "Manage own templates"
      on templates for all
      using (auth.uid() = user_id);
  `;
  
  // Responses RLS
  sql`
    alter table responses enable row level security;
    
    create policy "Manage own responses"
      on responses for all
      using (auth.uid() = user_id);
  `;
};
```

## Best Practices

1. **Component Design**
   - Single responsibility principle
   - Proper prop typing
   - Error boundary implementation
   - Loading state handling

2. **State Management**
   - Appropriate state scoping
   - Consistent state updates
   - Side effect handling
   - Error state management

3. **Performance**
   - Component memoization
   - Lazy loading
   - Data caching
   - Bundle optimization

4. **Security**
   - Input validation
   - Data access control
   - Error handling
   - Secure data storage

## Troubleshooting Guide

1. **Common Issues**
   - Form validation not triggering
   - Progress not saving
   - Navigation issues
   - State synchronization problems

2. **Solutions**
   - Check validation rules implementation
   - Verify progress saving mechanism
   - Debug navigation guards
   - Review state management implementation