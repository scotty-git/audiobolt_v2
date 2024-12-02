# Audiobook Questionnaire Builder

A modern web application for creating and managing audiobook questionnaires and onboarding flows.

## Features

- Create and manage questionnaire templates
- Build custom onboarding flows
- Real-time autosave
- Progress tracking
- Responsive design
- Type-safe development

## Tech Stack

### Core
- React 18
- TypeScript 5
- Tailwind CSS 3
- Vite 5

### Database & Storage
- Supabase (Real-time Database)
- PostgreSQL with Row Level Security (RLS)
- Real-time subscriptions
- Type-safe database access
- Optimized caching layer

### State Management
- React hooks
- Context API
- Custom hooks
- Supabase real-time subscriptions

### UI Components
- Tailwind CSS
- Lucide icons
- Custom components
- Responsive design

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
```

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
```

### Testing
- Unit tests for components
- Integration tests for flows
- Hook testing
- Utility function tests

### Best Practices
- TypeScript for type safety
- Component composition
- Custom hooks for logic
- Responsive design
- Accessibility
- Error handling
- Row Level Security (RLS)
- Real-time data synchronization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See [LICENSE](LICENSE) for details