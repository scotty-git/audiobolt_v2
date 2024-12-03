Module 3: Implement User Roles and Access Control

High-Level Summary

Define user roles (admin and user) and implement role-based access control within the application to restrict access to certain parts based on the user’s role. This ensures that admins have access to administrative functionalities while regular users have access to their own data.

Detailed Goals

	•	Assign Roles to Users: Ensure users have a role assigned in the users table.
	•	Fetch User Role on Login: Retrieve the user’s role upon authentication and store it in the application’s state.
	•	Implement Role-Based Route Protection: Protect routes and components based on user roles.
	•	Secure Backend Data Access: Ensure that role-based access is enforced at the database level via RLS policies.

Step-by-Step Implementation Guide

Step 1: Assign Roles to Users

	•	Objective: Ensure that each user has a role assigned, either user or admin.
	•	Instructions:
	•	Default Role Assignment:
	•	In the user registration process (Module 2), ensure that the role field in the users table defaults to 'user'.
	•	Assign Admin Roles:
	•	Manually update the role field for admin users:

UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';


	•	Considerations:
	•	Role Management Interface: Consider implementing an admin interface for managing user roles in future modules.

Step 2: Fetch User Role on Login

	•	Objective: Retrieve and store the user’s role upon authentication.
	•	Instructions:
	•	Update Auth Context:
	•	Modify the AuthContext to fetch the user’s profile, including the role, after authentication.

useEffect(() => {
  const session = supabase.auth.session();
  setAuthUser(session?.user ?? null);
  setLoading(false);

  if (session?.user) {
    fetchUserProfile(session.user.id);
  }

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    }
  );

  return () => {
    authListener.unsubscribe();
  };
}, []);

const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (data) {
    setUserProfile(data);
  } else if (error) {
    // Handle error
  }
};


	•	Store userProfile in Context:
	•	Update the context value to include userProfile.

	•	Considerations:
	•	Error Handling: Handle cases where the user profile is not found or there is an error fetching it.

Step 3: Implement Role-Based Route Protection

	•	Objective: Restrict access to certain routes and components based on user roles.
	•	Instructions:
	•	Create a ProtectedRoute Component:
	•	Path: src/components/ProtectedRoute.tsx

import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ component: Component, roles, ...rest }) => {
  const { authUser, userProfile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!authUser) {
          return <Redirect to="/login" />;
        }

        if (roles && roles.indexOf(userProfile?.role) === -1) {
          return <Redirect to="/not-authorized" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;


	•	Use ProtectedRoute in Your Routing:
	•	In your main routing file:

import ProtectedRoute from './components/ProtectedRoute';

<Switch>
  <ProtectedRoute path="/admin" component={AdminDashboard} roles={['admin']} />
  <ProtectedRoute path="/dashboard" component={UserDashboard} roles={['user', 'admin']} />
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
  {/* Other routes */}
</Switch>


	•	Considerations:
	•	Not Authorized Page: Create a NotAuthorized component to display when users try to access unauthorized areas.

Step 4: Secure Backend Data Access with RLS Policies

	•	Objective: Ensure that role-based access is enforced at the database level.
	•	Instructions:
	•	Update RLS Policies to Include Roles:
	•	For users table:

CREATE POLICY "Admins can access all users" ON users
FOR SELECT, UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);


	•	For user_profiles table:

CREATE POLICY "Admins can access all profiles" ON user_profiles
FOR SELECT, UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);


	•	For responses table:

CREATE POLICY "Admins can access all responses" ON responses
FOR SELECT, UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM users AS u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);


	•	Considerations:
	•	Testing RLS Policies: Test to ensure that regular users cannot access data they shouldn’t, and admins have appropriate access.

Testing

	•	Test Case 1: Access Control for Regular Users
	•	Purpose: Ensure regular users can only access authorized areas.
	•	Test Steps:
	1.	Log in as a regular user.
	2.	Attempt to access the admin dashboard.
	3.	Verify that the user is redirected to the NotAuthorized page.
	4.	Confirm that the user can access their own dashboard and data.
	•	Test Case 2: Access Control for Admin Users
	•	Purpose: Ensure admins have access to admin functionalities.
	•	Test Steps:
	1.	Log in as an admin user.
	2.	Access the admin dashboard and confirm access is granted.
	3.	Verify that admin can view all users, profiles, and responses.
	4.	Attempt to access user-only areas and confirm access is appropriate.
	•	Test Case 3: Backend Data Access
	•	Purpose: Confirm that RLS policies enforce data access at the database level.
	•	Test Steps:
	1.	As a regular user, attempt to query another user’s data directly via API or Supabase console and confirm access is denied.
	2.	As an admin, attempt to query all users’ data and confirm access is granted.
	•	Test Case 4: Role Retrieval and State Management
	•	Purpose: Ensure the user’s role is correctly retrieved and stored in the application state.
	•	Test Steps:
	1.	Log in as a user and inspect the application state to confirm the userProfile contains the correct role.
	2.	Log out and log in as an admin, and repeat the inspection.
	•	Test Case 5: UI Elements Based on Role
	•	Purpose: Verify that UI components render appropriately based on user roles.
	•	Test Steps:
	1.	Log in as a regular user and check that admin links or buttons are not visible.
	2.	Log in as an admin and confirm that admin-specific UI elements are present.

Questions and Considerations

	•	Question: Should we cache the user’s role or always fetch it upon login?
	•	Answer: It’s generally acceptable to fetch the user’s role upon login and store it in the application state. Ensure that the state is updated if the user’s role changes during the session.
	•	Consideration: Be cautious of hardcoding role checks in multiple places. Consider creating utility functions or a role management system to handle permissions consistently.

Admin Impersonation Feature

Overview
Implement an admin-only feature that allows administrators to temporarily view and interact with the application as other users, while maintaining their admin privileges and ability to return to admin view.

Objectives
• Enable admins to view the application from any user's perspective
• Maintain admin privileges during impersonation
• Provide easy switching between users and return to admin view
• Keep the interface simple and clear for testing purposes

Detailed Requirements

1. Visual Interface
   • Persistent top bar visible only to admin users
   • Height: 48px with fixed position
   • Dark background (indigo-900) to distinguish from regular UI
   • Always visible when logged in as admin
   • Z-index must ensure visibility above all other content

2. Core Components
   a) User Selection Dropdown
      • List all users in the system
      • Display format: "email (username if available)"
      • Scrollable for large user lists
      • No search/filter initially required
      • Update immediately on selection

   b) Status Indicator
      • Show current impersonation status
      • Display "Viewing as: [user email]" when impersonating
      • Clear visual distinction between admin and impersonated views

   c) Return Button
      • "Return to Admin" button
      • Only visible during impersonation
      • Single click returns to admin view
      • Prominent placement for easy access

3. Data Structure
   interface UserDropdownItem {
     id: string;
     email: string;
     username?: string;
     role: UserRole;
   }

4. Authentication Context Updates
   interface AuthContextType {
     // Existing properties
     user: UserProfile | null;
     loading: boolean;
     signIn: (email: string, password: string) => Promise<void>;
     signUp: (email: string, password: string) => Promise<void>;
     signOut: () => Promise<void>;
     resetPassword: (email: string) => Promise<void>;
     
     // New impersonation properties
     isImpersonating: boolean;
     impersonatedUser: UserProfile | null;
     impersonateUser: (userId: string) => Promise<void>;
     stopImpersonating: () => Promise<void>;
   }

5. Implementation Details
   a) State Management
      • Track original admin session
      • Maintain impersonated user state
      • Handle UI updates based on impersonation status
      • Preserve admin capabilities during impersonation

   b) Data Flow
      • Initial Load:
        - Fetch all users on admin login
        - Populate dropdown with user list
        - Initialize impersonation state as false
      
      • User Selection:
        - Store original admin session
        - Load selected user's profile
        - Update UI to reflect user's view
        - Maintain admin privileges
      
      • Return to Admin:
        - Clear impersonated user state
        - Restore admin view
        - Reset user-specific states
        - Maintain dropdown selection

6. Component Structure
   <AdminLayout>
     {isAdmin && <AdminImpersonationBar />}
     <MainContent />
   </AdminLayout>

   AdminImpersonationBar:
   - Container (fixed position, full width)
   - User dropdown (select/combobox)
   - Status text
   - Return button

7. Security Notes
   • Feature intended for testing/development
   • No additional security measures required
   • Maintain admin privileges throughout
   • No logging of impersonation events needed

8. Testing Scenarios
   a) Admin Functions
      • Verify admin can see impersonation bar
      • Test user selection from dropdown
      • Confirm immediate view switch on selection
      • Verify "Return to Admin" functionality

   b) User Impersonation
      • Test viewing user-specific content
      • Verify correct data loading for selected user
      • Confirm admin privileges maintained
      • Test multiple user switches

   c) State Management
      • Verify state persistence during impersonation
      • Test state reset on return to admin
      • Confirm proper handling of navigation during impersonation

9. Implementation Steps
   1. Create AdminImpersonationBar component
   2. Update AuthContext with impersonation logic
   3. Implement user fetching and dropdown
   4. Add impersonation state management
   5. Implement view switching logic
   6. Add "Return to Admin" functionality
   7. Style and position the interface
   8. Test all scenarios
   9. Integration with existing routes and views

10. Future Considerations
    • User search/filtering for large user lists
    • Additional user information in dropdown
    • Impersonation event logging
    • Enhanced visual indicators
    • Session management improvements

## Implementation Updates and Improvements

### 1. Authentication Enhancements
- Implemented robust error handling in SignIn component
- Added form validation and error messaging
- Improved password reset functionality
- Enhanced loading states and user feedback

### 2. Supabase Client Optimization
- Streamlined Supabase client initialization
- Removed redundant client instances
- Improved session management
- Added development-only debugging

### 3. Component Updates
- Fixed AdminImpersonationBar type issues
- Enhanced Navigation component with role-based rendering
- Updated Layout component for proper admin bar positioning
- Improved ProtectedRoute component with better error handling

### 4. Testing Implementation
- Added comprehensive test utilities
- Implemented role-based access control tests
- Added Navigation component tests
- Enhanced MobileMenu tests
- Improved Form component tests
- Added proper test providers and mocks

### 5. Type Safety Improvements
- Enhanced AuthContextType definitions
- Added proper error handling types
- Improved UserProfile type safety
- Added proper typing for form states

### 6. Performance Optimizations
- Improved state management in AuthContext
- Enhanced component rendering efficiency
- Optimized Supabase client configuration
- Improved error boundary handling

### 7. Security Enhancements
- Improved role-based access control
- Enhanced session management
- Added proper error handling for auth flows
- Improved form validation and security

All implementation steps have been completed and tested, with additional improvements made to enhance security, performance, and user experience.
