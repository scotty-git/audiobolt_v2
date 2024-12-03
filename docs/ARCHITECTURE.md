# Application Architecture

## Overview

The application follows a modular architecture with clear separation of concerns, designed to handle sophisticated user profiling, questionnaires, and onboarding flows. It leverages Supabase for real-time database capabilities, authentication, and role-based access control.

## Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── forms/           # Form-related components
│   ├── auth/            # Authentication components
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   └── ResetPassword.tsx
│   ├── admin/           # Admin-only components
│   │   ├── ImpersonationBar.tsx
│   │   └── UserManagement.tsx
│   ├── flows/          # Flow-specific components
│   └── layout/         # Layout components
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication context
│   └── RoleContext.tsx # Role management context
├── hooks/             # Custom React hooks
├── pages/             # Main application views
├── lib/              # Core libraries
│   ├── supabase.ts   # Supabase client
│   ├── auth.ts       # Auth utilities
│   └── roles.ts      # Role management
├── types/            # TypeScript definitions
└── utils/           # Helper functions
```

## Authentication System

### Auth Context
```typescript
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isImpersonating: boolean;
  impersonatedUser: UserProfile | null;
  originalAdminUser: UserProfile | null;
  role: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  stopImpersonating: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const impersonateUser = async (userId: string) => {
    if (user?.role !== 'admin') {
      throw new Error('Only admins can impersonate users');
    }

    const { data: targetUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      throw new Error('User not found');
    }

    setOriginalAdminUser(user);
    setImpersonating(true);
    setImpersonatedUser(targetUser);
  };

  const stopImpersonating = async () => {
    if (!isImpersonating || !originalAdminUser) {
      throw new Error('Not currently impersonating');
    }

    setUser(originalAdminUser);
    setImpersonating(false);
    setImpersonatedUser(null);
    setOriginalAdminUser(null);
  };

  const value = {
    user: isImpersonating ? impersonatedUser : user,
    loading,
    isImpersonating,
    impersonatedUser,
    originalAdminUser,
    role: isImpersonating ? impersonatedUser?.role ?? 'user' : user?.role ?? 'user',
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    },
    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
    },
    signOut: async () => {
      if (isImpersonating) {
        await stopImpersonating();
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    impersonateUser,
    stopImpersonating
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### Role-Based Protected Routes
```typescript
interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  requiredRole = 'user' 
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== requiredRole && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Admin Impersonation Bar
```typescript
const AdminImpersonationBar: React.FC = () => {
  const { 
    isImpersonating, 
    impersonatedUser, 
    originalAdminUser,
    stopImpersonating 
  } = useAuth();

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-yellow-500 flex items-center justify-between px-4 text-black">
      <div>
        Viewing as: {impersonatedUser?.email} (Role: {impersonatedUser?.role})
      </div>
      <div className="flex items-center space-x-4">
        <span>Admin: {originalAdminUser?.email}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={stopImpersonating}
        >
          Stop Impersonating
        </Button>
      </div>
    </div>
  );
};
```

## Database Integration

### User Profile Schema
```typescript
interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

type UserRole = 'user' | 'admin';
```

### Role-Based Security Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin can read all users
CREATE POLICY "Admins can read all user profiles"
  ON users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Users can read own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admin can update all users
CREATE POLICY "Admins can update all user profiles"
  ON users
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

## Error Handling

### Auth Errors
```typescript
class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const handleAuthError = (error: AuthError) => {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Invalid email or password';
    case 'email_taken':
      return 'Email already registered';
    case 'unauthorized_role':
      return 'You do not have permission to perform this action';
    case 'impersonation_error':
      return 'Unable to impersonate user';
    default:
      return 'An unexpected error occurred';
  }
};
```

## Security Considerations

1. **Authentication**
   - Email confirmation required
   - Password strength requirements
   - Rate limiting on auth endpoints
   - Secure session management

2. **Authorization**
   - Role-based access control
   - Protected routes by role
   - Admin impersonation tracking
   - Session validation

3. **Data Protection**
   - Row Level Security (RLS)
   - Role-based policies
   - Audit logging
   - Data encryption

4. **Impersonation Security**
   - Admin-only access
   - Clear visual indicators
   - Audit trail
   - Session isolation

## Best Practices

1. **Auth State Management**
   - Use AuthContext for global state
   - Handle loading states
   - Proper error handling
   - Clear error messages

2. **Role Management**
   - Check roles consistently
   - Use type-safe role checks
   - Handle role changes
   - Validate permissions

3. **Impersonation**
   - Clear user feedback
   - Maintain admin access
   - Proper state cleanup
   - Error handling

4. **Security**
   - Validate permissions server-side
   - Apply proper RLS policies
   - Audit sensitive actions
   - Secure data access