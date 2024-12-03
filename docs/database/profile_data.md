# User Profile Data Structure

## Overview
The user profile data in our application is stored using a flexible JSON structure in the `profile_data` column of the `users` table. This design allows for maximum flexibility in storing user-related information without requiring schema changes.

## Technical Details

### Database Structure
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    profile_data JSONB DEFAULT '{}'::jsonb
);
```

### Key Features
- **Flexible Schema**: The `profile_data` column accepts any valid JSON structure
- **Default Empty Object**: New users start with an empty JSON object (`{}`)
- **Full JSON Support**: Supports nested objects, arrays, and mixed data types

## Usage Guidelines

### Recommended Practices
1. **Type Safety**
   ```typescript
   // Define types for your profile data structures
   interface UserProfile {
     personal?: {
       name?: string;
       contact?: {
         email?: string;
         phone?: string;
       };
     };
     preferences?: Record<string, unknown>;
   }
   ```

2. **Data Access**
   ```typescript
   // Reading profile data
   const { data: user } = await supabase
     .from('users')
     .select('profile_data')
     .eq('id', userId)
     .single();

   // Updating profile data
   await supabase
     .from('users')
     .update({ profile_data: newData })
     .eq('id', userId);
   ```

### Important Notes
1. Updates replace the entire profile_data object (not merged)
2. Validate data structure before storage when consistency is required
3. Consider implementing utility functions for common operations

## Migration Considerations
- Existing applications may need to update their type definitions
- No database migrations required for structure changes
- Client-side validation should be updated to handle flexible data

## Best Practices
1. Document your application's expected data structure
2. Implement type guards for critical data structures
3. Use TypeScript interfaces to maintain type safety
4. Include data validation in your application logic
5. Consider versioning your data structure if needed

## Example Structures

### Basic Profile
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

### Complex Profile
```json
{
  "personal": {
    "name": "John Doe",
    "contact": {
      "email": "john@example.com",
      "phone": "1234567890"
    }
  },
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "metadata": {
    "lastLogin": "2023-12-20T12:00:00Z",
    "loginCount": 42
  }
}
``` 