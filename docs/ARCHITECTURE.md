# Application Architecture

## Overview

The application follows a modular architecture with clear separation of concerns, designed to handle both onboarding flows and questionnaires in a flexible, maintainable way. It leverages Supabase for real-time database capabilities and robust security.

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Shared components (buttons, inputs, etc.)
│   ├── feedback/     # Feedback components (loading, errors)
│   ├── layout/       # Layout components
│   └── templates/    # Template-specific components
├── hooks/            # Custom React hooks
├── pages/            # Main application views
├── lib/             # Core libraries and utilities
│   ├── supabase.ts  # Supabase client configuration
│   ├── cache.ts     # Caching layer
│   └── errors.ts    # Custom error types
├── repositories/    # Data access layer
│   ├── template.ts  # Template repository
│   ├── response.ts  # Response repository
│   └── progress.ts  # Progress repository
├── types/           # TypeScript definitions
└── utils/           # Helper functions
```

## Core Components

### Database Layer
- Supabase real-time database
- PostgreSQL with Row Level Security
- Repository pattern for data access
- Type-safe database operations
- Real-time subscriptions
- Optimized caching layer

### Template Management
- Unified interface for managing templates
- Multi-select functionality
- Advanced filtering and search
- Real-time updates
- Progress tracking

### Security Layer
- Row Level Security (RLS)
- Supabase authentication
- Secure environment variables
- Type-safe database access
- Input validation
- Error boundaries

## State Management

### Template State
```typescript
interface Template {
  id: string;
  title: string;
  type: 'onboarding' | 'questionnaire';
  content: Record<string, unknown>;
  is_default: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  version: string;
  category?: string;
  tags?: string[];
  user_id: string;
}
```

### Progress State
```typescript
interface Progress {
  id: string;
  response_id: string;
  user_id: string;
  current_step: number;
  total_steps: number;
  last_updated: string;
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

### Database Operations
```typescript
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

async function handleDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw new DatabaseError(error.message);
  }
}
```

### User Actions
- Validation feedback
- Confirmation dialogs
- Error boundaries
- Loading states
- Retry mechanisms

## Performance Optimization

### Caching Layer
```typescript
class CacheManager {
  private cache: Map<string, any>;
  private ttl: number;

  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}
```

### Real-time Optimization
- Selective subscription patterns
- Debounced updates
- Optimistic UI updates
- Connection management

## Security Implementation

### Row Level Security
```sql
-- Templates RLS
alter table templates enable row level security;

create policy "Read published templates"
  on templates for select
  using (status = 'published');

create policy "Manage own templates"
  on templates for all
  using (auth.uid() = user_id);

-- Responses RLS
alter table responses enable row level security;

create policy "Manage own responses"
  on responses for all
  using (auth.uid() = user_id);
```

### Authentication Flow
1. User signs in through Supabase Auth
2. JWT token stored securely
3. RLS policies enforce access
4. Real-time channels authenticated

## Testing Strategy

### Unit Tests
- Component testing
- Hook testing
- Repository testing
- Utility function testing

### Integration Tests
- User flows
- Database operations
- Real-time updates
- Authentication flows

## Future Considerations

### Planned Features
- Advanced sorting options
- Template categories
- Batch operations
- Version control

### Scalability
- Performance monitoring
- Database optimization
- Caching strategies
- Load balancing