# Flow Documentation

## Overview
This document details the onboarding and questionnaire flows, their components, and interactions.

## Onboarding Flow

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

### Process Flow
1. **Initialization**
   ```typescript
   interface OnboardingState {
     currentSection: number;
     sections: Section[];
     responses: Record<string, Answer>;
     isComplete: boolean;
     validationErrors: ValidationError[];
   }
   
   const UserOnboarding: React.FC<OnboardingProps> = () => {
     const [state, setState] = useState<OnboardingState>(initialState);
     // ... component logic
   };
   ```

2. **Section Management**
   ```typescript
   interface Section {
     id: string;
     title: string;
     isRequired: boolean;
     canSkip: boolean;
     questions: Question[];
     validationRules: ValidationRule[];
   }
   
   const SectionRenderer: React.FC<SectionProps> = ({ 
     section,
     onComplete,
     onSkip 
   }) => {
     // ... section rendering logic
   };
   ```

3. **Progress Tracking**
   ```typescript
   interface ProgressState {
     currentStep: number;
     totalSteps: number;
     completedSections: string[];
     canProceed: boolean;
   }
   
   const SectionProgress: React.FC<ProgressProps> = ({
     progress,
     onNavigate
   }) => {
     // ... progress tracking logic
   };
   ```

### Validation Rules
```typescript
interface ValidationRule {
  type: 'required' | 'pattern' | 'custom';
  message: string;
  validate: (value: any) => boolean;
}

const useValidation = (rules: ValidationRule[]) => {
  // ... validation hook logic
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

## Questionnaire Flow

### Shared Components
The questionnaire system reuses many components from the onboarding flow:

1. **Question Rendering**
   ```typescript
   interface Question {
     id: string;
     type: QuestionType;
     text: string;
     options?: Option[];
     validation?: ValidationRule[];
   }
   
   const QuestionRenderer: React.FC<QuestionProps> = ({
     question,
     value,
     onChange,
     onValidate
   }) => {
     // ... question rendering logic
   };
   ```

2. **Section Navigation**
   ```typescript
   interface NavigationProps {
     canGoBack: boolean;
     canGoForward: boolean;
     onBack: () => void;
     onNext: () => void;
   }
   
   const NavigationControls: React.FC<NavigationProps> = (props) => {
     // ... navigation controls logic
   };
   ```

### Template-Based Approach
```typescript
interface Template {
  id: string;
  type: 'onboarding' | 'questionnaire';
  sections: Section[];
  settings: {
    allowSkip: boolean;
    showProgress: boolean;
    requireAllSections: boolean;
  };
}

const useTemplate = (templateId: string) => {
  // ... template loading and management logic
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

const useFormState = (initialValues: Record<string, any>) => {
  // ... form state management logic
};
```

### Progress Management
```typescript
interface ProgressManager {
  saveProgress: (data: ProgressData) => Promise<void>;
  loadProgress: () => Promise<ProgressData>;
  clearProgress: () => Promise<void>;
}

const useProgressManager = (): ProgressManager => {
  // ... progress management logic
};
```

## Error Handling

### Error Boundaries
```typescript
class FlowErrorBoundary extends React.Component<ErrorBoundaryProps> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Loading States
```typescript
interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

const LoadingIndicator: React.FC<LoadingState> = ({
  isLoading,
  loadingMessage,
  progress
}) => {
  // ... loading indicator logic
};
```

## Best Practices

1. **Component Organization**
   - Keep components focused and single-responsibility
   - Use composition over inheritance
   - Implement proper prop-types and TypeScript interfaces
   - Handle loading and error states consistently

2. **State Management**
   - Use appropriate state management for different scopes
   - Implement proper form state validation
   - Handle side effects in useEffect hooks
   - Maintain consistent state updates

3. **Error Handling**
   - Implement proper error boundaries
   - Handle network errors gracefully
   - Provide user-friendly error messages
   - Log errors for debugging

4. **Performance**
   - Implement proper memoization
   - Use lazy loading for heavy components
   - Optimize re-renders
   - Handle large datasets efficiently

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