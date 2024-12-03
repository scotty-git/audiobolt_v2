# Template Guide

## Overview

This guide outlines the structure and usage of templates in the Audiobook Questionnaire Builder application. Templates are used to create consistent, reusable questionnaires and onboarding flows.

## Template Types

### 1. Questionnaire Templates
```typescript
interface QuestionnaireTemplate {
  id: string;
  title: string;
  description?: string;
  type: 'questionnaire';
  structure: {
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      questions: Array<{
        id: string;
        type: QuestionType;
        text: string;
        required?: boolean;
        options?: string[];
        metadata?: Record<string, unknown>;
      }>;
    }>;
  };
  metadata?: {
    requiresAuth?: boolean;
    allowAnonymous?: boolean;
    saveProgress?: boolean;
    [key: string]: unknown;
  };
}
```

### 2. Onboarding Templates
```typescript
interface OnboardingTemplate {
  id: string;
  title: string;
  description?: string;
  type: 'onboarding';
  structure: {
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      requiresAuth?: boolean;
      questions: Array<{
        id: string;
        type: QuestionType;
        text: string;
        required?: boolean;
        options?: string[];
        metadata?: Record<string, unknown>;
      }>;
    }>;
  };
  metadata?: {
    requiresAuth?: boolean;
    allowAnonymous?: boolean;
    saveProgress?: boolean;
    [key: string]: unknown;
  };
}
```

## Component Templates

### 1. Protected Section Template
```typescript
const ProtectedSection: React.FC<{
  children: React.ReactNode;
  requiresAuth?: boolean;
}> = ({ children, requiresAuth = true }) => {
  const { user } = useAuth();
  
  if (requiresAuth && !user) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">
          Please sign in to access this section
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
};
```

### 2. Progress Tracking Template
```typescript
const ProgressTracker: React.FC<{
  templateId: string;
  sections: Array<{
    id: string;
    title: string;
    requiresAuth?: boolean;
  }>;
}> = ({ templateId, sections }) => {
  const { user } = useAuth();
  const { progress, updateProgress } = useProgress(templateId);
  
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          className={clsx(
            'p-4 rounded-lg',
            {
              'bg-green-50': progress?.completedSections.includes(section.id),
              'bg-yellow-50': section.requiresAuth && !user,
              'bg-gray-50': !progress?.completedSections.includes(section.id)
            }
          )}
        >
          <h3 className="font-medium">{section.title}</h3>
          {section.requiresAuth && !user && (
            <p className="text-sm text-yellow-700">
              Sign in required
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 3. Form Template with Auth
```typescript
const AuthAwareForm: React.FC<{
  onSubmit: (data: unknown) => Promise<void>;
  requiresAuth?: boolean;
  saveProgress?: boolean;
}> = ({ onSubmit, requiresAuth = false, saveProgress = true }) => {
  const { user } = useAuth();
  const [isDirty, setIsDirty] = useState(false);
  
  // Auto-save for authenticated users
  useEffect(() => {
    if (user && saveProgress && isDirty) {
      const timer = setTimeout(() => {
        onSubmit(formData);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [formData, isDirty, user, saveProgress]);
  
  if (requiresAuth && !user) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">
          Please sign in to access this form
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(formData);
        setIsDirty(false);
      }}
      onChange={() => setIsDirty(true)}
    >
      {/* Form fields */}
    </form>
  );
};
```

## Usage Examples

### 1. Protected Questionnaire
```typescript
const ProtectedQuestionnaire: React.FC<{
  template: QuestionnaireTemplate;
}> = ({ template }) => {
  const { user } = useAuth();
  const { progress, updateProgress } = useProgress(template.id);
  
  return (
    <div className="space-y-8">
      <ProgressTracker
        templateId={template.id}
        sections={template.structure.sections}
      />
      
      {template.structure.sections.map((section) => (
        <ProtectedSection
          key={section.id}
          requiresAuth={section.requiresAuth}
        >
          <AuthAwareForm
            onSubmit={async (data) => {
              await updateProgress({
                sectionId: section.id,
                data
              });
            }}
            requiresAuth={section.requiresAuth}
            saveProgress={template.metadata?.saveProgress}
          />
        </ProtectedSection>
      ))}
    </div>
  );
};
```

### 2. Mixed Access Onboarding
```typescript
const MixedAccessOnboarding: React.FC<{
  template: OnboardingTemplate;
}> = ({ template }) => {
  const { user } = useAuth();
  const { progress } = useProgress(template.id);
  
  return (
    <div className="space-y-8">
      {/* Public sections first */}
      {template.structure.sections
        .filter(section => !section.requiresAuth)
        .map(section => (
          <section key={section.id}>
            <h2>{section.title}</h2>
            <AuthAwareForm
              onSubmit={async (data) => {
                // Handle submission
              }}
              saveProgress={false}
            />
          </section>
        ))}
      
      {/* Protected sections */}
      {template.structure.sections
        .filter(section => section.requiresAuth)
        .map(section => (
          <ProtectedSection
            key={section.id}
            requiresAuth={true}
          >
            <h2>{section.title}</h2>
            <AuthAwareForm
              onSubmit={async (data) => {
                // Handle submission
              }}
              requiresAuth={true}
              saveProgress={true}
            />
          </ProtectedSection>
        ))}
    </div>
  );
};
```

## Best Practices

1. **Authentication**
   - Clearly mark protected sections
   - Handle auth state changes gracefully
   - Provide clear user feedback
   - Save progress for authenticated users

2. **User Experience**
   - Show auth requirements upfront
   - Preserve form data during auth
   - Enable auto-save when possible
   - Clear loading states

3. **Security**
   - Validate auth on server
   - Apply proper RLS policies
   - Sanitize user input
   - Handle errors appropriately

4. **Performance**
   - Lazy load protected content
   - Optimize auto-save
   - Cache authenticated data
   - Handle offline state

## Template Creation Guidelines

1. **Structure**
   - Use consistent naming
   - Document auth requirements
   - Include proper types
   - Add helpful comments

2. **Authentication**
   - Mark protected sections
   - Set auth requirements
   - Configure progress saving
   - Handle anonymous access

3. **Validation**
   - Add field validation
   - Check auth state
   - Validate permissions
   - Handle edge cases

4. **Testing**
   - Test with/without auth
   - Verify protected sections
   - Check auto-save
   - Test error states