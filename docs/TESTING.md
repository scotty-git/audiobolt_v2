# Testing Documentation

## Testing Architecture

### Testing Stack
- Primary Testing Framework: Vitest
- Testing Libraries: 
  - @testing-library/react
  - @testing-library/jest-dom
  - @testing-library/user-event
  - happy-dom (for DOM environment)

### Directory Structure
```
src/
├── __tests__/                    # Root test directory
│   ├── integration/             # Integration tests
│   │   └── *.integration.test.tsx
│   ├── *.test.ts               # Unit tests
│   └── *.test.tsx              # Component tests
├── components/
│   └── __tests__/              # Component-specific tests
├── hooks/
│   └── __tests__/              # Hook-specific tests
└── utils/
    └── __tests__/              # Utility function tests
```

## Types of Tests

### 1. Unit Tests
Unit tests verify individual functions and utilities in isolation.

Example unit test:
```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from '../utils/validation';

describe('Email Validation', () => {
  it('validates correct email format', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true);
  });

  it('rejects invalid email format', () => {
    expect(validateEmail('invalid-email').isValid).toBe(false);
  });
});
```

### 2. Component Tests
Component tests verify React components in isolation.

Example component test:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionInput } from '../components/QuestionInput';

describe('QuestionInput', () => {
  it('renders input field correctly', () => {
    render(<QuestionInput question={{ id: '1', text: 'Test Question' }} />);
    expect(screen.getByLabelText('Test Question')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const onChangeMock = vi.fn();
    render(<QuestionInput onChange={onChangeMock} />);
    
    await userEvent.type(screen.getByRole('textbox'), 'test input');
    expect(onChangeMock).toHaveBeenCalledWith('test input');
  });
});
```

### 3. Integration Tests
Integration tests verify multiple components working together.

Example integration test:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '../components/OnboardingFlow';

describe('Onboarding Flow', () => {
  it('completes full onboarding process', async () => {
    render(<OnboardingFlow />);
    
    // Fill out first section
    await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    await userEvent.click(screen.getByText('Next'));
    
    // Verify progress
    expect(screen.getByText('Section 2 of 3')).toBeInTheDocument();
  });
});
```

### 4. Hook Tests
Hook tests verify custom React hooks.

Example hook test:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';

describe('useOnboardingProgress', () => {
  it('manages onboarding state', () => {
    const { result } = renderHook(() => useOnboardingProgress());
    
    act(() => {
      result.current.handleResponse('q1', 'answer');
    });
    
    expect(result.current.responses).toEqual({
      q1: { value: 'answer', timestamp: expect.any(String) }
    });
  });
});
```

## Testing Best Practices

### 1. Test Setup
Create a `setupTests.ts` file:
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### 2. Mocking
Mock external dependencies using Vitest:
```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('../utils/storage', () => ({
  saveData: vi.fn(),
  loadData: vi.fn()
}));

// Mock implementation
vi.mocked(saveData).mockResolvedValue(undefined);
```

### 3. Testing Patterns

#### Arrange-Act-Assert Pattern
```typescript
describe('Component', () => {
  it('updates on user interaction', async () => {
    // Arrange
    const onChangeMock = vi.fn();
    render(<Component onChange={onChangeMock} />);
    
    // Act
    await userEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(onChangeMock).toHaveBeenCalled();
  });
});
```

#### Async Testing
```typescript
it('loads data asynchronously', async () => {
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

## Testing Guidelines

1. **Naming Conventions**
   - Test files: `*.test.ts` or `*.test.tsx`
   - Integration tests: `*.integration.test.tsx`
   - Test descriptions should be clear and descriptive

2. **Test Organization**
   - Group related tests using `describe` blocks
   - Use nested `describe` blocks for sub-features
   - Keep test files close to the code they're testing

3. **Assertions**
   - Use specific assertions over generic ones
   - Test behavior, not implementation
   - Include both positive and negative test cases

4. **Mocking**
   - Mock at the lowest possible level
   - Clear mocks between tests
   - Use realistic mock data

5. **Error Handling**
   - Test error scenarios
   - Verify error messages
   - Test boundary conditions

## Common Testing Utilities

### User Events
```typescript
const user = userEvent.setup();
await user.type(input, 'text');
await user.click(button);
await user.selectOptions(select, 'option');
```

### Assertions
```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveValue('value');
expect(element).toBeDisabled();
expect(mockFunction).toHaveBeenCalledWith(expect.any(String));
```

### Async Utilities
```typescript
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

## Project-Specific Testing

### Supabase Testing
- Mock Supabase client in tests:
```typescript
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null })
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
    }
  })
}));
```

- Use test database for integration tests:
```typescript
const testClient = createClient(
  process.env.VITE_SUPABASE_TEST_URL,
  process.env.VITE_SUPABASE_TEST_ANON_KEY
);
```

### Form Testing
- Test validation logic
- Test form submission
- Test error states
- Test real-time updates

### Navigation Testing
- Test routing behavior
- Test navigation guards
- Test URL parameters
- Test progress persistence

## Coverage Requirements
- Minimum 80% coverage for critical paths
- Focus on user-facing functionality
- Include error scenarios
- Test edge cases

## Troubleshooting

### Common Issues
1. **Act Warnings**
   - Wrap state updates in `act()`
   - Use `await` with user events
   - Use `waitFor` for async operations

2. **Test Isolation**
   - Clear mocks in `beforeEach`
   - Reset state between tests
   - Clean up side effects

3. **Async Testing**
   - Always await async operations
   - Use proper async utilities
   - Handle loading states