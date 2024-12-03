# Database Structure

## Overview

The database is built on PostgreSQL using Supabase, featuring real-time capabilities and Row Level Security (RLS). It uses JSONB for flexible data structures, includes authentication integration, and implements role-based access control.

## Tables

### auth.users (Managed by Supabase Auth)
```sql
-- This table is managed by Supabase Auth
CREATE TABLE auth.users (
  id uuid NOT NULL PRIMARY KEY,
  email text,
  encrypted_password text,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token text,
  confirmation_sent_at timestamp with time zone,
  recovery_token text,
  recovery_sent_at timestamp with time zone,
  email_change_token text,
  email_change text,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  deleted_at timestamp with time zone
);
```

### public.users
```sql
CREATE TABLE public.users (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  profile_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  impersonation_log jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Role-Based Access
CREATE POLICY "Admins can read all user profiles"
  ON users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all user profiles"
  ON users
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Impersonation Logging
CREATE OR REPLACE FUNCTION public.log_impersonation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.impersonation_log IS DISTINCT FROM OLD.impersonation_log THEN
    INSERT INTO audit_logs (
      actor_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      'impersonation',
      'users',
      NEW.id,
      OLD.impersonation_log,
      NEW.impersonation_log
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_impersonation_log_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.impersonation_log IS DISTINCT FROM OLD.impersonation_log)
  EXECUTE FUNCTION public.log_impersonation();
```

### audit_logs
```sql
CREATE TABLE public.audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Automatic logging
CREATE OR REPLACE FUNCTION public.audit_log_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      actor_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      actor_id,
      action,
      table_name,
      record_id,
      old_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      row_to_json(OLD)
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      actor_id,
      action,
      table_name,
      record_id,
      new_data
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(NEW)
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Types

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  profile_data: {
    personal?: {
      name?: string;
      preferences?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
  };
  impersonation_log: Array<{
    admin_id: string;
    timestamp: string;
    action: 'start' | 'stop';
  }>;
  created_at: string;
  updated_at: string;
}

type UserRole = 'user' | 'admin';
```

### Audit Log Entry
```typescript
interface AuditLogEntry {
  id: string;
  actor_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  created_at: string;
}
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with role-based policies:

1. **Users Table**
   - Admins can read all profiles
   - Users can only read own profile
   - Admins can update all profiles
   - Users can only update own profile
   - No deletion allowed
   - Automatic user creation on auth signup

2. **Audit Logs Table**
   - Only admins can read
   - Automatic logging of all changes
   - No manual modifications allowed
   - No deletion allowed

### Authentication
- Managed by Supabase Auth
- Role-based access control
- Email/password authentication
- Email confirmation required
- Secure password reset flow
- Session management
- JWT tokens for API access

### Impersonation Security
- Only admins can impersonate
- All impersonation actions logged
- Clear audit trail
- Session isolation
- Original admin privileges preserved

## Performance Optimization

### Indexes
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_profile ON users USING gin(profile_data);
CREATE INDEX idx_users_impersonation ON users USING gin(impersonation_log);

-- Audit log indexes
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### Query Optimization
- Use EXPLAIN ANALYZE for query planning
- Implement appropriate JSONB indexing
- Monitor query performance
- Optimize role-based queries

## Monitoring

### Key Metrics
- Query performance
- Connection pool usage
- Cache hit ratio
- Table and index size
- Write-ahead log (WAL) size
- Audit log size
- Impersonation frequency

### Alerts
- Connection pool saturation
- Long-running queries
- High disk usage
- Replication lag
- Suspicious impersonation patterns
- Unusual audit log volume

## Development Guidelines

1. **Schema Changes**
   - Use migrations for all changes
   - Document changes in version control
   - Test migrations in staging
   - Update role-based policies

2. **Data Access**
   - Use parameterized queries
   - Implement proper error handling
   - Follow RLS policies
   - Check role permissions

3. **Performance**
   - Monitor query performance
   - Use appropriate indexes
   - Optimize JSONB queries
   - Cache role checks

4. **Security**
   - Follow least privilege principle
   - Implement proper RLS policies
   - Use secure connection strings
   - Audit sensitive actions