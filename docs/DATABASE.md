# Database Architecture

## Overview
The application uses Supabase as its primary database, providing real-time capabilities, Row Level Security (RLS), and type-safe access patterns. The database structure is designed to support template management and response tracking with efficient querying and real-time updates.

## Database Schema

### Templates Table
```sql
create table templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null check (type in ('onboarding', 'questionnaire')),
  content jsonb not null,
  is_default boolean default false,
  status text not null check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  version text not null,
  category text,
  tags text[],
  user_id uuid references auth.users(id)
);

-- RLS Policies
alter table templates enable row level security;

-- Allow users to read any published template
create policy "Read published templates"
  on templates for select
  using (status = 'published');

-- Allow users to CRUD their own templates
create policy "Manage own templates"
  on templates for all
  using (auth.uid() = user_id);
```

### Responses Table
```sql
create table responses (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references templates(id),
  user_id uuid references auth.users(id),
  answers jsonb not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  last_updated timestamptz default now(),
  metadata jsonb
);

-- RLS Policies
alter table responses enable row level security;

-- Users can only access their own responses
create policy "Manage own responses"
  on responses for all
  using (auth.uid() = user_id);
```

### Progress Table
```sql
create table progress (
  id uuid default gen_random_uuid() primary key,
  response_id uuid references responses(id),
  user_id uuid references auth.users(id),
  current_step integer not null,
  total_steps integer not null,
  last_updated timestamptz default now()
);

-- RLS Policies
alter table progress enable row level security;

-- Users can only access their own progress
create policy "Manage own progress"
  on progress for all
  using (auth.uid() = user_id);
```

## Type Definitions

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

interface Response {
  id: string;
  template_id: string;
  user_id: string;
  answers: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  last_updated: string;
  metadata?: Record<string, unknown>;
}

interface Progress {
  id: string;
  response_id: string;
  user_id: string;
  current_step: number;
  total_steps: number;
  last_updated: string;
}
```

## Repository Pattern

```typescript
class TemplateRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async create(template: Omit<Template, 'id'>): Promise<Template> {
    const { data, error } = await this.supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select()
      .eq('id', id)
      .single();
    
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  // ... other repository methods
}
```

## Real-time Subscriptions

```typescript
class TemplateSubscription {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  subscribeToTemplate(templateId: string, callback: (template: Template) => void) {
    return this.supabase
      .from('templates')
      .on('UPDATE', (payload) => {
        if (payload.new.id === templateId) {
          callback(payload.new as Template);
        }
      })
      .subscribe();
  }
}
```

## Error Handling

```typescript
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Schema Validation

```typescript
const templateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  type: z.enum(['onboarding', 'questionnaire']),
  content: z.record(z.unknown()),
  is_default: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  user_id: z.string().uuid()
});
```

## Caching Layer

```typescript
class CacheManager {
  private cache: Map<string, any>;
  private ttl: number;

  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
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

## Best Practices

1. Data Access
   - Always use repository pattern
   - Implement proper error handling
   - Validate data with Zod schemas
   - Use TypeScript for type safety

2. Security
   - Implement RLS policies
   - Never expose service role key
   - Validate user permissions
   - Sanitize user input

3. Performance
   - Use appropriate indexes
   - Implement caching
   - Optimize queries
   - Use real-time selectively

4. Maintenance
   - Regular backups
   - Monitor performance
   - Log errors
   - Version control migrations