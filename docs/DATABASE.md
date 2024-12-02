# Database Architecture

## Overview
The application uses IndexedDB for client-side data persistence, with a fallback to localStorage. The database structure is designed to support template management and response tracking with efficient querying and filtering capabilities.

## Core Stores

### Templates Store
```typescript
interface Template {
  id: string;                 // UUID
  title: string;             // Template title
  type: 'onboarding' | 'questionnaire';
  content: string;           // JSON string of template content
  is_default: boolean;       // Whether this is the default template
  status: 'draft' | 'published' | 'archived';
  created_at: string;        // ISO datetime
  updated_at: string;        // ISO datetime
  version: string;           // Semantic version
  category?: string;         // Optional category
  tags?: string[];          // Optional tags
}

### Responses Store
```typescript
interface Response {
  id: string;                 // UUID
  template_id: string;        // Reference to template
  user_id: string;           // User identifier
  answers: string;           // JSON string of answers
  started_at: string;        // ISO datetime
  completed_at?: string;     // ISO datetime
  last_updated: string;      // ISO datetime
  metadata?: string;         // JSON string for additional data
}
```

## Store Indexes

### Templates Store
- by-type: Quick lookup by template type
- by-status: Filter templates by status

### Responses Store
- by-template: Filter responses by template
- by-user: Filter responses by user

## Repository Pattern

### Template Repository
```typescript
interface TemplateRepository {
  create(template: Template): Promise<Template>;
  findById(id: string): Promise<Template | null>;
  findByType(type: string): Promise<Template[]>;
  findAll(): Promise<Template[]>;
  update(id: string, template: Partial<Template>): Promise<Template>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  getDefaultTemplate(type: string): Promise<Template | null>;
  setDefault(id: string): Promise<Template>;
}

### Response Repository
```typescript
interface ResponseRepository {
  create(response: Response): Promise<Response>;
  findById(id: string): Promise<Response | null>;
  findByTemplateId(templateId: string): Promise<Response[]>;
  findByUserId(userId: string): Promise<Response[]>;
  findAll(): Promise<Response[]>;
  update(id: string, response: Partial<Response>): Promise<Response>;
  delete(id: string): Promise<void>;
}
```

## Storage Wrapper

### Features
- Automatic fallback to localStorage
- Storage quota management
- Error handling
- Data cleanup strategies

```typescript
class StorageWrapper {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  
  private clearOldData(): void;
  private getTimestampFromKey(key: string): number;
}
```

## Data Flow

1. Template Management:
   - Create/Edit templates
   - Store as JSON in IndexedDB
   - Handle default templates
   - Manage template status

2. Bulk Operations:
   - Multi-select functionality
   - Batch deletions
   - Status updates
   - Category assignments

3. Storage Management:
   - Quota monitoring
   - Automatic cleanup
   - Fallback mechanisms
   - Error recovery

## Schema Validation

```typescript
const templateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  type: z.enum(['onboarding', 'questionnaire']),
  content: z.string(),
  is_default: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional()
});
```

## Best Practices

1. Data Integrity
   - Schema validation
   - Atomic operations
   - Transaction management
   - Error handling

2. Performance
   - Indexed fields
   - Efficient queries
   - Batch operations
   - Cache management

3. Security
   - Input validation
   - Data sanitization
   - Error boundaries
   - Safe storage

4. Maintenance
   - Clear interfaces
   - Consistent patterns
   - Documentation
   - Error logging