# Testing Documentation

## Table of Contents
1. [Testing Architecture](#testing-architecture)
2. [Test Implementation](#test-implementation)
3. [Testing Patterns](#testing-patterns)
4. [Test Utils](#test-utils)
5. [Common Issues](#common-issues)
6. [Coverage Goals](#coverage-goals)
7. [Tools and Configuration](#tools-and-configuration)

## Testing Architecture

### Testing Stack
- Primary Testing Framework: Vitest
- Testing Libraries: 
  - @testing-library/react
  - @testing-library/jest-dom
  - @testing-library/user-event
  - happy-dom (for DOM environment)
  - msw (Mock Service Worker)

### Testing Pyramid
```
     E2E Tests     
    /          \    
   /  Integration \  
  /     Tests      \ 
 /                  \
/     Unit Tests     \
```

1. **Unit Tests** (60%)
   - Individual components
   - Hooks
   - Utilities
   - Services

2. **Integration Tests** (30%)
   - Flow testing
   - Multi-component interaction
   - API integration
   - State management

3. **E2E Tests** (10%)
   - Critical user paths
   - Full flow completion
   - Real API integration

## Test Implementation

### 1. Onboarding Flow Tests

#### Component Rendering
```typescript
import { render, screen } from '@testing-library/react';
import { OnboardingFlow } from '../components/OnboardingFlow';

describe('OnboardingFlow', () => {
  const mockTemplate = {
    id: '1',
    sections: [
      {
        id: 'section1',
        title: 'Personal Info',
        questions: [
          {
            id: 'q1',
            type: 'text',
            text: 'What is your name?'
          }
        ]
      }
    ]
  };

  it('renders initial section correctly', () => {
    render(<OnboardingFlow template={mockTemplate} />);
    
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('What is your name?')).toBeInTheDocument();
  });

  it('handles section navigation', async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow template={mockTemplate} />);
    
    await user.type(screen.getByRole('textbox'), 'John Doe');
    await user.click(screen.getByText('Next'));
    
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });
});
```

#### Form Validation
```typescript
describe('Form Validation', () => {
  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow template={mockTemplate} />);
    
    await user.click(screen.getByText('Next'));
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('clears validation errors after input', async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow template={mockTemplate} />);
    
    await user.click(screen.getByText('Next'));
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    
    await user.type(screen.getByRole('textbox'), 'John');
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });
});
```

### 2. Questionnaire Flow Tests

#### Template Loading
```typescript
describe('Template Loading', () => {
  it('shows loading state while fetching template', () => {
    render(<QuestionnaireFlow templateId="123" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles template loading error', async () => {
    server.use(
      rest.get('/api/templates/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<QuestionnaireFlow templateId="123" />);
    
    expect(await screen.findByText('Error loading template')).toBeInTheDocument();
  });
});
```

#### Answer Saving
```typescript
describe('Answer Saving', () => {
  it('saves answers automatically', async () => {
    const mockSave = vi.fn();
    const user = userEvent.setup();
    
    render(<QuestionnaireFlow onSave={mockSave} />);
    
    await user.type(screen.getByRole('textbox'), 'Test Answer');
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        questionId: 'q1',
        answer: 'Test Answer'
      });
    });
  });
});
```

## Testing Patterns

### 1. Component Testing Hierarchy
```typescript
// Parent Component Test
describe('ParentComponent', () => {
  it('renders child components correctly', () => {
    render(<ParentComponent />);
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});

// Child Component Test
describe('ChildComponent', () => {
  it('handles props correctly', () => {
    render(<ChildComponent value="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### 2. Mock Implementation
```typescript
// Mock Repository
const mockTemplateRepo = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn()
};

// Mock Hook
vi.mock('../hooks/useTemplate', () => ({
  useTemplate: () => ({
    template: mockTemplate,
    isLoading: false,
    error: null
  })
}));

// Mock API
const server = setupServer(
  rest.get('/api/templates/:id', (req, res, ctx) => {
    return res(ctx.json(mockTemplate));
  })
);
```

### 3. Test Data Generation
```typescript
// Test Data Generator
const createMockTemplate = (overrides = {}) => ({
  id: 'template-1',
  title: 'Test Template',
  sections: [],
  ...overrides
});

// Test Data Factory
class TestDataFactory {
  static createTemplate(type: 'onboarding' | 'questionnaire') {
    return {
      id: `template-${Date.now()}`,
      type,
      sections: this.createSections(3)
    };
  }

  static createSections(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `section-${i}`,
      title: `Section ${i + 1}`,
      questions: this.createQuestions(2)
    }));
  }
}
```

## Test Utils

### 1. Custom Renders
```typescript
// With Router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

// With Providers
const renderWithProviders = (
  ui: React.ReactElement,
  { preloadedState = {}, store = configureStore({ reducer, preloadedState }) } = {}
) => {
  return {
    store,
    ...render(ui, {
      wrapper: ({ children }) => (
        <Provider store={store}>
          {children}
        </Provider>
      )
    })
  };
};
```

### 2. Custom Matchers
```typescript
expect.extend({
  toBeValidTemplate(received) {
    const isValid = received.id && received.sections && Array.isArray(received.sections);
    return {
      message: () => `expected ${received} to be a valid template`,
      pass: isValid
    };
  }
});
```

### 3. Test Hooks
```typescript
const useTestHook = () => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Simulate async initialization
    setTimeout(() => setIsReady(true), 0);
  }, []);
  
  return { isReady };
};

describe('useTestHook', () => {
  it('initializes correctly', async () => {
    const { result } = renderHook(() => useTestHook());
    
    expect(result.current.isReady).toBe(false);
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });
});
```

## Common Issues

### 1. Act Warnings
```typescript
// Problem
test('updates state', () => {
  const { result } = renderHook(() => useState(false));
  result.current[1](true); // Warning: State update not wrapped in act(...)
});

// Solution
test('updates state', () => {
  const { result } = renderHook(() => useState(false));
  act(() => {
    result.current[1](true);
  });
});
```

### 2. Async Testing
```typescript
// Problem
test('loads data', async () => {
  render(<DataComponent />);
  expect(screen.getByText('Data')).toBeInTheDocument(); // Fails: data not loaded yet
});

// Solution
test('loads data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

## Coverage Goals

### Target Coverage Metrics
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
});
```

### Priority Areas
1. Core Components (90%+)
   - Form components
   - Navigation components
   - Error boundaries
   - Loading states

2. Business Logic (85%+)
   - Validation rules
   - Flow management
   - State transitions
   - Error handling

3. Utils & Helpers (80%+)
   - Data transformers
   - Formatters
   - Validators
   - Type guards

## Tools and Configuration

### 1. Vitest Setup
```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### 2. MSW Setup
```typescript
// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3. Test Environment
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'c8'
    },
    globals: true
  }
});
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive names
   - Follow AAA pattern (Arrange-Act-Assert)
   - Keep tests focused

2. **Mock Usage**
   - Mock at boundaries
   - Use realistic data
   - Clear mocks between tests
   - Document mock behavior

3. **Async Testing**
   - Always await async operations
   - Use proper async utilities
   - Handle loading states
   - Test error scenarios

4. **State Management**
   - Test initial state
   - Verify state transitions
   - Test side effects
   - Validate error states

## Contributing

1. **Adding Tests**
   - Follow existing patterns
   - Include both positive and negative cases
   - Document complex test scenarios
   - Update test utils as needed

2. **Updating Tests**
   - Maintain coverage levels
   - Update related tests
   - Document breaking changes
   - Review test performance

3. **Test Review**
   - Check test isolation
   - Verify mock usage
   - Review error handling
   - Check performance impact