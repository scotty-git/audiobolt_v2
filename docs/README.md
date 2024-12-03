# Audiobook Questionnaire Builder

A modern web application for creating and managing audiobook questionnaires and onboarding flows, featuring sophisticated user profiling and AI-ready data structures.

## Features

- Create and manage questionnaire templates
- Build custom onboarding flows
- Sophisticated user profiling system
- AI-ready data structures
- Real-time autosave
- Progress tracking
- Responsive design
- Type-safe development
- Secure authentication system
- Email verification
- Password reset functionality
- Protected routes
- Role-based access control
- Admin impersonation
- Audit logging
- Session management

## Tech Stack

### Core
- React 18
- TypeScript 5
- Tailwind CSS 3
- Vite 5

### Database & Storage
- Supabase (Real-time Database)
- PostgreSQL with JSONB
- Real-time subscriptions
- Type-safe database access
- Optimized caching layer
- Role-based security
- Audit logging

### Authentication
- Supabase Auth
- JWT tokens
- Protected routes
- Email verification
- Password reset flow
- Session management
- Role-based access control
- Admin impersonation
- Audit trail

### State Management
- React hooks
- Context API
- Custom hooks
- Supabase real-time subscriptions
- Role-based state
- Impersonation state

### UI Components
- Tailwind CSS
- Lucide icons
- Custom components
- Responsive design
- Admin interface
- Impersonation bar

## Development

### Prerequisites
- Node.js 18+
- npm 8+
- Supabase account and project

### Environment Setup
1. Create a `.env` file in the root directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication Configuration
VITE_AUTH_REDIRECT_URL=http://localhost:5173/auth/callback
VITE_PASSWORD_MIN_LENGTH=8
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_PASSWORD_RESET=true

# Role Configuration
VITE_DEFAULT_ROLE=user
VITE_ADMIN_EMAILS=admin@example.com
VITE_ENABLE_IMPERSONATION=true
```

### Supabase Setup

1. Create a new Supabase project
2. Enable Email Auth Provider:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates

3. Configure Auth Settings:
   - Set Site URL
   - Configure redirect URLs
   - Set password strength requirements
   - Customize email templates

4. Set up Row Level Security:
   - Enable RLS on all tables
   - Apply security policies
   - Test access controls

5. Configure Roles:
   - Set up user roles
   - Configure admin access
   - Set up impersonation
   - Enable audit logging

### Available Scripts

```bash
# Development
npm run dev         # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Testing
npm test           # Run tests
npm run test:ui    # Run tests with UI
npm run coverage   # Generate coverage report

# Code Quality
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
npm run format     # Format code

# Database
npm run db:migrate     # Run Supabase migrations
npm run db:reset      # Reset database to initial state
npm run db:seed       # Seed database with test data
npm run db:verify     # Verify database integrity

# Admin Tools
npm run admin:create  # Create admin user
npm run admin:list   # List all admins
npm run audit:view   # View audit logs
```

### Development Mode Features
- RLS disabled for rapid development
- Real-time updates
- Type-safe database access
- Comprehensive error handling
- Role-based access testing
- Impersonation testing

### Production Mode Features
- RLS enabled for security
- Optimized performance
- Proper error handling
- Monitoring and logging
- Role enforcement
- Audit logging
- Impersonation tracking

### Authentication Flow

1. **Sign Up**
   ```typescript
   const { error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'secure_password'
   });
   ```

2. **Sign In**
   ```typescript
   const { error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'secure_password'
   });
   ```

3. **Password Reset**
   ```typescript
   const { error } = await supabase.auth.resetPasswordForEmail(
     'user@example.com'
   );
   ```

4. **Protected Routes**
   ```typescript
   const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
     const { user, role } = useAuth();
     return role >= requiredRole ? children : <Navigate to="/login" />;
   };
   ```

5. **Admin Impersonation**
   ```typescript
   const { impersonateUser, stopImpersonating } = useAuth();
   
   // Start impersonation
   await impersonateUser('user-id');
   
   // Stop impersonation
   await stopImpersonating();
   ```

### Best Practices
- TypeScript for type safety
- Component composition
- Custom hooks for logic
- Responsive design
- Accessibility
- Error handling
- Real-time data synchronization
- Secure authentication
- Protected routes
- Input validation
- Role-based access
- Audit logging
- Impersonation safety

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

1. **Authentication**
   - Email verification required
   - Strong password policy
   - Session management
   - JWT token handling

2. **Authorization**
   - Role-based access control
   - Protected routes
   - Resource permissions
   - Admin privileges

3. **Impersonation**
   - Admin-only access
   - Clear visual indicators
   - Audit logging
   - Session isolation

4. **Audit Trail**
   - User actions logged
   - Admin activities tracked
   - Impersonation events
   - Security incidents

## License

MIT License - See [LICENSE](LICENSE) for details