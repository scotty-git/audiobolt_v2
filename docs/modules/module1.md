Module 1: Database Schema Update and Planning

High-Level Summary

We need to update and extend the current database schema to include user authentication, user roles (admin and user), and associate questionnaire responses with individual users. We will design a flexible and future-proof user profile system that can store dynamic and varied user data over time, allowing us to collect and manage diverse types of information about users.

Detailed Goals

	•	Set Up Users Table: Create a users table to store user profiles and roles, synchronized with Supabase Auth.
	•	Design Dynamic User Profile Data Storage: Implement a flexible system to store dynamic and varied user data, capable of handling any type of user information.
	•	Update Responses Table: Associate questionnaire responses with individual users via user_id.
	•	Implement User Roles: Define user roles (admin, user) within the users table to support role-based access control.
	•	Implement Row Level Security (RLS) Policies: Ensure data privacy and security by applying RLS policies to relevant tables.

Step-by-Step Implementation Guide

Step 1: Set Up Users Table

	•	Objective: Create a users table to store user information and roles, synchronized with Supabase Auth.
	•	Instructions:
	•	In Supabase, navigate to the SQL editor and run the following SQL script to create the users table:

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


	•	Ensure that the id field matches the id from Supabase Auth users.

	•	Considerations:
	•	We need to synchronize the users table with Supabase Auth users. This can be achieved via triggers or by inserting into the users table upon user registration (to be handled in Module 2).
	•	The role field will be used for role-based access control.

Step 2: Design Dynamic User Profile Data Storage

	•	Objective: Implement a flexible and future-proof system to store dynamic and varied user data, capable of handling any type of user information.
	•	Instructions:
	•	Option 1: Create a user_profiles Table with JSONB Field
	•	Create a new table user_profiles to store dynamic user data:

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  profile_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


	•	This profile_data field will store any kind of user data in JSON format, allowing flexibility and future expansion.

	•	Option 2: Add profile_data JSONB Field Directly to users Table
	•	Alternatively, you can add a profile_data field directly to the users table:

ALTER TABLE users
ADD COLUMN profile_data JSONB NOT NULL DEFAULT '{}';


	•	Choose the Option that Best Fits Your Needs
	•	If you anticipate that the profile data will become large or complex, using a separate user_profiles table may be preferable.

	•	Considerations:
	•	Data Structure: Design a schema for the JSON data that can handle various types of information, such as:

{
  "personal_info": {
    "name": "John Doe",
    "age": 30,
    "gender": "male"
  },
  "preferences": {
    "favorite_color": "blue",
    "hobbies": ["reading", "gaming"]
  },
  "history": {
    "last_login": "2023-10-01T12:34:56Z",
    "questionnaire_responses": [
      {
        "template_id": "uuid",
        "submitted_at": "2023-09-30T11:22:33Z",
        "data": { /* response data */ }
      }
    ]
  }
}


	•	Indexing: Consider adding indexes on frequently queried fields within the JSON data for performance optimization.
	•	Validation: Implement validation rules when inserting or updating profile_data to maintain data integrity.

Step 3: Update Responses Table

	•	Objective: Associate questionnaire responses with individual users via user_id.
	•	Instructions:
	•	Modify the responses table to include a user_id field:

ALTER TABLE responses
ADD COLUMN user_id UUID REFERENCES users(id);


	•	Ensure that all new responses include the user_id when being inserted.

	•	Considerations:
	•	Update any existing queries or application logic to handle the new user_id field.
	•	Backfill user_id for existing response records if necessary.

Step 4: Implement User Roles

	•	Objective: Define user roles (admin, user) within the users table to support role-based access control.
	•	Instructions:
	•	The role field in the users table will store the user’s role. By default, new users will be assigned the user role.
	•	Manually update the role field for admin users:

UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';


	•	Considerations:
	•	In future modules, implement interfaces or administrative tools to manage user roles.

Step 5: Implement Row Level Security (RLS) Policies

	•	Objective: Ensure data privacy and security by applying RLS policies to relevant tables.
	•	Instructions:
	•	Enable RLS on Tables:

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;


	•	Create RLS Policies:
	•	For the users table:

CREATE POLICY "Allow individual user access" ON users
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Allow admins to access all users" ON users
FOR SELECT USING (EXISTS (SELECT 1 FROM users AS u WHERE u.id = auth.uid() AND u.role = 'admin'));


	•	For the user_profiles table:

CREATE POLICY "Allow individual user access" ON user_profiles
FOR SELECT, INSERT, UPDATE, DELETE USING (user_id = auth.uid());

CREATE POLICY "Allow admins to access all profiles" ON user_profiles
FOR SELECT USING (EXISTS (SELECT 1 FROM users AS u WHERE u.id = auth.uid() AND u.role = 'admin'));


	•	For the responses table:

CREATE POLICY "Allow user to access own responses" ON responses
FOR SELECT, INSERT, UPDATE, DELETE USING (user_id = auth.uid());

CREATE POLICY "Allow admins to access all responses" ON responses
FOR SELECT USING (EXISTS (SELECT 1 FROM users AS u WHERE u.id = auth.uid() AND u.role = 'admin'));


	•	Considerations:
	•	Testing RLS Policies: Test the RLS policies thoroughly to ensure they are working as expected.
	•	Security Best Practices: Regularly review and update RLS policies as the application evolves.

Testing

	•	Test Case 1: Verify Users Table Creation
	•	Purpose: Ensure the users table is created correctly with all required fields.
	•	Test Steps:
	1.	Check the users table structure in Supabase.
	2.	Verify that the fields id, email, role, created_at, and updated_at exist.
	3.	Confirm that the id is set as the primary key.
	•	Test Case 2: Validate Dynamic User Profile Data Storage
	•	Purpose: Confirm that the user_profiles table (or profile_data field) can store and retrieve dynamic user data.
	•	Test Steps:
	1.	Insert sample JSON data into profile_data for a test user.
	2.	Retrieve the profile_data and verify it matches the inserted data.
	3.	Update the profile_data with additional fields and confirm retrieval.
	•	Test Case 3: Ensure Responses Are Associated with Users
	•	Purpose: Verify that responses are correctly linked to user_id.
	•	Test Steps:
	1.	Insert a new response with a valid user_id.
	2.	Query the responses table and confirm the user_id is correctly stored.
	3.	Attempt to insert a response without a user_id and confirm that it fails or handles appropriately.
	•	Test Case 4: Verify User Roles
	•	Purpose: Ensure that user roles are assigned and can be retrieved.
	•	Test Steps:
	1.	Create a new user and check that their role is set to user by default.
	2.	Update a user’s role to admin and confirm the change.
	3.	Retrieve users and verify that the role field reflects the correct roles.
	•	Test Case 5: Test Row Level Security Policies
	•	Purpose: Confirm that RLS policies prevent unauthorized data access.
	•	Test Steps:
	1.	As a regular user, attempt to access another user’s profile or responses and confirm access is denied.
	2.	As an admin user, attempt to access all users’ data and confirm access is granted.
	3.	Attempt to bypass RLS policies and ensure that security holds.

Questions and Considerations

	•	Question: Should we use separate tables for different types of dynamic user data or keep all data in a single JSONB field?
	•	Answer: Using a single JSONB field allows for greater flexibility and easier schema evolution. However, if certain data needs to be frequently queried or requires relational integrity, consider using additional tables or columns.
	•	Consideration: Ensure that the dynamic user profile data is validated and sanitized to prevent injection attacks or malformed data storage.

## Implementation Summary (December 2023)

### What We Accomplished
1. **Users Table Creation**
   - Successfully created users table with all core fields
   - Implemented timestamp fields (`created_at`, `updated_at`)
   - Added automatic timestamp updates via triggers
   - Included role management with default 'user' role

2. **Profile Data Implementation**
   - Chose Option 2: Adding `profile_data` directly to users table
   - Made significant changes to the original plan:
     - Removed strict schema validation
     - Implemented completely flexible JSONB structure
     - Set default value to empty object (`'{}'::jsonb`)
     - Added GIN index for efficient querying
     - Removed triggers enforcing structure

3. **Testing Implementation**
   - Created comprehensive test suite for profile data
   - Added tests for:
     - Simple key-value storage
     - Nested object structures
     - Arrays and mixed data types
     - Empty and null values
     - Partial updates

### Key Differences from Original Plan

1. **Data Structure Approach**
   - Original Plan: Structured JSONB with predefined schema
   - Implementation: Completely flexible JSONB without schema enforcement
   - Reason: Maximum flexibility for future requirements

2. **Security Implementation**
   - Original Plan: Immediate RLS implementation
   - Implementation: RLS temporarily disabled for development
   - Reason: Faster development and testing cycle

3. **Validation Strategy**
   - Original Plan: Database-level validation
   - Implementation: Application-level validation
   - Reason: More flexible validation rules and easier updates

### Future Considerations

1. **Security**
   - Plan to re-enable RLS after development phase
   - Need to implement comprehensive security policies
   - Document security implementation timeline

2. **Data Validation**
   - Consider implementing optional schema validation
   - Add utility functions for common data patterns
   - Create TypeScript interfaces for type safety

3. **Performance**
   - Monitor JSONB query performance
   - Optimize GIN index usage
   - Consider adding specific indexes for frequently queried paths

### Testing Status
- ✅ User creation and role assignment
- ✅ Profile data storage and retrieval
- ✅ Timestamp functionality
- ✅ JSON flexibility
- ❌ RLS policies (postponed)
