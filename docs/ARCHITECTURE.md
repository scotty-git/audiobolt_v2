# Application Architecture

## Overview

The application follows a modular architecture with clear separation of concerns, designed to handle both onboarding flows and questionnaires in a flexible, maintainable way.

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Shared components (buttons, inputs, etc.)
│   ├── feedback/     # Feedback components (loading, errors)
│   ├── layout/       # Layout components
│   └── templates/    # Template-specific components
├── hooks/            # Custom React hooks
├── pages/           # Main application views
│   └── TemplateManagementPage/  # Template management feature
├── utils/           # Helper functions and utilities
├── db/              # Database and storage logic
└── types/           # TypeScript definitions
```

## Core Components

### Template Management
- Unified interface for managing onboarding flows and questionnaires
- Multi-select functionality for bulk operations
- Advanced filtering and search capabilities
- Responsive design with mobile-optimized views

### Database Layer
- IndexedDB for client-side storage
- Repository pattern for data access
- Strong type validation with Zod schemas
- Automatic fallback to localStorage
- Efficient indexing for quick lookups

### Component Architecture
1. Template List View
   - Tabbed navigation (All, Onboarding, Questionnaires)
   - Search and filter functionality
   - Bulk selection and actions
   - Responsive table/card layout

2. Template Actions
   - Create new templates
   - Edit existing templates
   - Set default templates
   - Delete templates

3. Filter System
   - Type-based filtering
   - Status filtering
   - Date range selection
   - Search by title

## State Management

### Template State
```typescript
interface Template {
  id: string;
  title: string;
  type: 'onboarding' | 'questionnaire';
  content: string; // JSON string
  is_default: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  version: string;
}
```

### Filter State
```typescript
interface Response {
  id: string;
  template_id: string;
  user_id: string;
  answers: string; // JSON string
  started_at: string;
  completed_at?: string;
  last_updated: string;
  metadata?: string; // JSON string
}
```

## Component Patterns

### Shared Components
- SelectableTable: Reusable table with multi-select
- MultiSelectActions: Bulk action controls
- DeleteConfirmationDialog: Reusable confirmation modal
- FilterDropdown: Advanced filtering interface

### Mobile Optimization
- Card-based layout for small screens
- Touch-friendly controls
- Responsive dropdowns and modals
- Optimized spacing and typography

## Error Handling

1. Database Operations
   - Connection handling
   - Transaction rollbacks
   - Storage quota management
   - Fallback mechanisms

2. User Actions
   - Validation feedback
   - Confirmation dialogs
   - Error boundaries
   - Loading states

## Performance Considerations

1. Data Loading
   - Efficient IndexedDB queries
   - Optimized renders
   - Lazy loading where appropriate
   - Debounced search

2. UI Optimization
   - Virtualized lists for large datasets
   - Optimized re-renders
   - Efficient state updates
   - Responsive images

## Security Considerations

1. Data Validation
   - Input sanitization
   - Schema validation
   - Type checking
   - Safe storage practices

2. Error Prevention
   - Confirmation dialogs
   - Undo functionality
   - Data backups
   - Version control

## Testing Strategy

1. Unit Tests
   - Component testing
   - Hook testing
   - Utility function testing
   - State management testing

2. Integration Tests
   - User flows
   - Filter combinations
   - CRUD operations
   - Mobile responsiveness

## Future Considerations

1. Planned Features
   - Advanced sorting options
   - Template categories
   - Batch import/export
   - Template versioning

2. Scalability
   - Performance optimization
   - Storage management
   - Feature modularity
   - Enhanced customization