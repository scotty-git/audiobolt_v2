# Testing Documentation

## Overview

This document outlines our testing strategy, patterns, and examples for the Audiobook Questionnaire Builder application, focusing on our current implementation.

## Testing Stack

- Vitest
- React Testing Library
- MSW (Mock Service Worker) for API mocking
- Testing Library User Event
- Supabase Testing Helpers

## Test File Structure

```
src/__tests__/
├── components/          # Component tests
│   ├── Navigation.test.tsx
│   └── auth/
│       └── AuthForms.test.tsx
├── user/               # User-related tests
│   └── UserProfile.test.tsx
├── utils/              # Test utilities
│   └── test-utils.tsx
└── setup.ts           # Global test setup
```

## Test Utilities

### Test Auth Provider
```typescript
// src/__tests__/utils/test-utils.tsx
const TestAuthProvider: React.FC<{ 
  children: React.ReactNode; 
  initialRole?: UserRole 
}> = ({ 
  children, 
  initialRole = 'user' 
}) => {
  const [user, setUser] = useState<UserProfile>({
    id: 'test-user-id',
    email: 'test@example.com',
    role: initialRole,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<UserProfile | null>(null);

  // ... rest of implementation
};

// Create providers wrapper with role
export const createProvidersWithRole = (role: UserRole = 'user') => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <TestAuthProvider initialRole={role}>
        {children}
      </TestAuthProvider>
    </BrowserRouter>
  );
};
```

### Auth Utilities
```typescript
// src/utils/auth.ts
export const hasRole = (user: UserProfile | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

export const isAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, 'admin');
};

export const isUser = (user: UserProfile | null): boolean => {
  return hasRole(user, 'user');
};
```

## Component Tests

### Navigation Tests
```typescript
// src/__tests__/components/Navigation.test.tsx
describe('Navigation Component', () => {
  describe('as regular user', () => {
    beforeEach(async () => {
      render(<Navigation />, { 
        wrapper: createProvidersWithRole('user') 
      });

      await waitFor(() => {
        expect(screen.queryByText('Initializing...')).not.toBeInTheDocument();
      });
    });

    it('has correct positioning without admin bar', async () => {
      await waitFor(() => {
        const header = screen.getByRole('banner');
        const classes = header.className.split(' ');
        expect(classes).toContain('top-0');
      });
    });
  });

  describe('as admin user', () => {
    beforeEach(async () => {
      render(<Navigation />, { 
        wrapper: createProvidersWithRole('admin') 
      });
    });

    it('has correct positioning with admin bar', async () => {
      await waitFor(() => {
        const header = screen.getByRole('banner');
        const classes = header.className.split(' ');
        expect(classes).toContain('top-12');
      });
    });
  });
});
```

### User Profile Tests
```typescript
// src/__tests__/user/UserProfile.test.tsx
describe('User Profile Integration Tests', () => {
  const testUser = {
    email: 'test@example.com',
    role: 'user'
  };

  let userId: string;

  beforeEach(async () => {
    // Clean up any existing test user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (existingUser) {
      await supabase
        .from('users')
        .delete()
        .eq('id', existingUser.id);
    }

    // Create new test user
    const { data: newUser } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    userId = newUser.id;
  });

  afterEach(async () => {
    if (userId) {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);
    }
  });

  it('should store and retrieve profile data', async () => {
    const simpleData = {
      name: 'John Doe',
      age: 30,
      isActive: true
    };

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_data: simpleData })
      .eq('id', userId);

    expect(updateError).toBeNull();

    const { data: result } = await supabase
      .from('users')
      .select('profile_data')
      .eq('id', userId)
      .single();

    expect(result?.profile_data).toEqual(simpleData);
  });
});
```

## API Mocking

### MSW Setup
```typescript
// src/__tests__/setup.ts
const handlers = [
  // Auth endpoints
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: '123',
        email: 'test@example.com'
      }
    });
  }),

  // User endpoints
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      user: { id: '123', email: 'test@example.com' }
    });
  }),

  // Other endpoints...
];

export const server = setupServer(...handlers);
```

## Test Types

### 1. Component Tests
- Navigation rendering and behavior
- Auth-aware component states
- Role-based UI elements
- Mobile responsiveness

### 2. Integration Tests
- User profile management
- Auth state persistence
- Role-based access
- Data synchronization

### 3. API Tests
- Supabase client interactions
- Error handling
- Data validation
- Auth flows

## Best Practices

1. **Test Setup**
   - Use `createProvidersWithRole` for role-based tests
   - Clean up test data after each test
   - Mock Supabase responses consistently
   - Handle loading states

2. **Auth Testing**
   - Test both user and admin roles
   - Verify auth state management
   - Test protected routes
   - Validate role-based access

3. **Component Testing**
   - Test with different roles
   - Verify UI states
   - Check responsive behavior
   - Test error states

4. **Data Testing**
   - Use test database
   - Clean up test data
   - Verify data persistence
   - Test error handling

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test Navigation.test.tsx

# Run with coverage
npm run coverage

# Run in watch mode
npm test -- --watch
```

## Test Coverage Requirements

1. **Components**: 90%
   - Navigation
   - Auth forms
   - Protected routes
   - Role-based UI

2. **Integration**: 85%
   - User profiles
   - Auth flows
   - Data persistence
   - Role management

3. **Utils**: 95%
   - Auth utilities
   - Test helpers
   - Type guards

## Continuous Integration

1. **Pre-commit Hooks**
   - Run tests
   - Check coverage
   - Lint code
   - Type check

2. **CI Pipeline**
   - Build project
   - Run all tests
   - Generate coverage report
   - Deploy if tests pass