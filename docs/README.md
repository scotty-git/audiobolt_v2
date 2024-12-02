# Template Management System

A comprehensive React application for managing onboarding flows and questionnaires. Built with React, TypeScript, and Tailwind CSS.

## Features

### Template Management
- Create and manage templates
- Multi-select and bulk operations
- Advanced filtering and search
- Default template management
- Mobile-responsive interface

### Core Functionality
- Template CRUD operations
- Status management (draft/published/archived)
- Bulk actions (delete, status update)
- Search and advanced filtering
- Mobile-optimized views

### User Interface
- Clean, modern design
- Responsive layout
- Touch-friendly controls
- Intuitive navigation
- Real-time feedback

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── pages/            # Main application views
├── utils/            # Helper functions
├── db/               # Database logic
└── types/            # TypeScript definitions
```

## Technology Stack

### Core
- React 18
- TypeScript 5
- Tailwind CSS 3
- Vite 5

### Database
- IndexedDB
- Repository pattern
- Zod validation
- localStorage fallback

### State Management
- React hooks
- Context API
- Custom hooks
- Local storage

### UI Components
- Tailwind CSS
- Lucide icons
- Custom components
- Responsive design

## Development

### Prerequisites
- Node.js 18+
- npm 8+

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow existing code style
- Use meaningful commit messages

## License

MIT License - See [LICENSE](LICENSE) for details