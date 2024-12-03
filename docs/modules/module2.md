Module 2: Implement Supabase Authentication

High-Level Summary

We need to implement user authentication using Supabase Auth from scratch, allowing users to sign up, log in, and manage their sessions securely within the application. This includes setting up the authentication flow, integrating it into the frontend, and ensuring synchronization with the users table in our database.

Detailed Goals

	•	Set Up Supabase Authentication: Configure Supabase Auth for user registration, login, and session management.
	•	Create Registration and Login Pages: Develop user interfaces for signing up and logging in.
	•	Handle Authentication State: Manage user sessions and authentication status within the application.
	•	Synchronize Auth Users with Database: Ensure that authenticated users are reflected in the users table.
	•	Allow Anonymous Access (Optional): Enable anonymous users to use the app with limited functionality.

Step-by-Step Implementation Guide

Step 1: Set Up Supabase Authentication

	•	Objective: Configure Supabase Auth to handle user authentication.
	•	Instructions:
	•	Enable Email/Password Authentication:
	•	In the Supabase dashboard, navigate to Authentication > Settings.
	•	Under External Providers, ensure that Email Auth is enabled.
	•	Update Environment Variables:
	•	Ensure that your environment variables are set correctly in your .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key


	•	Considerations:
	•	Email Confirmations: Decide whether to require email confirmations upon sign-up.

Step 2: Create Registration Page

	•	Objective: Allow users to create an account.
	•	Instructions:
	•	Create a Signup Component:
	•	Path: src/pages/Signup.tsx
	•	Include fields for:
	•	Email
	•	Password
	•	Confirm Password (optional)
	•	Implement form validation to ensure:
	•	Email is in a valid format.
	•	Password meets complexity requirements.
	•	Password and Confirm Password match.
	•	Handle Form Submission:

import { supabase } from '../lib/supabase';

const handleSignup = async (email: string, password: string) => {
  const { user, session, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    // Handle error
  } else {
    // Handle successful signup
  }
};


	•	Considerations:
	•	Feedback to User: Provide clear feedback on success or errors.
	•	Security: Ensure passwords are not logged or exposed.

Step 3: Create Login Page

	•	Objective: Enable users to log in to their accounts.
	•	Instructions:
	•	Create a Login Component:
	•	Path: src/pages/Login.tsx
	•	Include fields for:
	•	Email
	•	Password
	•	Implement form validation.
	•	Handle Form Submission:

const handleLogin = async (email: string, password: string) => {
  const { user, session, error } = await supabase.auth.signIn({
    email,
    password,
  });
  if (error) {
    // Handle error
  } else {
    // Handle successful login
  }
};


	•	Considerations:
	•	Remember Me Option: Optionally allow users to stay logged in.

Step 4: Handle Authentication State

	•	Objective: Manage user sessions and authentication status within the application.
	•	Instructions:
	•	Create an Auth Context:
	•	Path: src/contexts/AuthContext.tsx
	•	Provide authUser, signUp, signIn, signOut, and loading states.

import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.session();
    setAuthUser(session?.user ?? null);
    setLoading(false);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const value = {
    authUser,
    loading,
    signUp: supabase.auth.signUp,
    signIn: supabase.auth.signIn,
    signOut: supabase.auth.signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};


	•	Wrap Your App with AuthProvider:
	•	In src/main.tsx or equivalent:

import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);


	•	Considerations:
	•	Loading State: Handle loading states to prevent rendering protected content before authentication status is known.

Step 5: Synchronize Auth Users with Database

	•	Objective: Ensure that authenticated users are reflected in the users table.
	•	Instructions:
	•	Option 1: Use Supabase Triggers
	•	Create a trigger that inserts a new user into the users table upon registration.
	•	Create a Function:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


	•	Create a Trigger:

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();


	•	Option 2: Insert into users Table After Signup in Frontend
	•	After successful sign-up, insert the user into the users table:

if (user) {
  await supabase.from('users').insert([
    { id: user.id, email: user.email, role: 'user' },
  ]);
}


	•	Considerations:
	•	Triggers vs. Frontend Logic: Using triggers ensures that the users table is always in sync, even if users are created outside the frontend application.

Step 6: Allow Anonymous Access (Optional)

	•	Objective: Enable anonymous users to use the app with limited functionality.
	•	Instructions:
	•	Enable Anonymous Sign-In:
	•	In Supabase, anonymous sign-in is not a built-in feature, but you can create a special anonymous user or use public access with limited permissions.
	•	Implement Guest Access Logic:
	•	Allow users to access certain parts of the app without authentication.
	•	Restrict actions that require user identification.
	•	Considerations:
	•	Security: Ensure that anonymous users cannot access protected resources.
	•	User Experience: Encourage users to sign up for full functionality.

Testing

	•	Test Case 1: User Registration
	•	Purpose: Ensure users can sign up successfully.
	•	Test Steps:
	1.	Navigate to the registration page.
	2.	Fill out the form with valid email and password.
	3.	Submit the form.
	4.	Verify that a new user is created in Supabase Auth and the users table.
	5.	Confirm that the user is redirected appropriately after sign-up.
	•	Test Case 2: User Login
	•	Purpose: Ensure users can log in with valid credentials.
	•	Test Steps:
	1.	Navigate to the login page.
	2.	Enter valid email and password.
	3.	Submit the form.
	4.	Verify that the user is authenticated and session is established.
	5.	Check that the user’s authentication state is reflected in the app.
	•	Test Case 3: Authentication State Management
	•	Purpose: Confirm that authentication state persists and is managed correctly.
	•	Test Steps:
	1.	Log in as a user.
	2.	Refresh the page and verify that the user remains logged in.
	3.	Log out and confirm that the user is redirected to the appropriate page.
	4.	Attempt to access protected routes when logged out and confirm access is denied.
	•	Test Case 4: Synchronization with users Table
	•	Purpose: Ensure that users in Supabase Auth are reflected in the users table.
	•	Test Steps:
	1.	Register a new user.
	2.	Check the users table to verify that the user record exists.
	3.	Update user information and confirm changes are reflected.
	•	Test Case 5: Anonymous Access (If Implemented)
	•	Purpose: Verify that anonymous users can access permitted parts of the app.
	•	Test Steps:
	1.	Access the app without logging in.
	2.	Confirm that public content is accessible.
	3.	Attempt to perform an action requiring authentication and verify that it’s restricted.

Questions and Considerations

	•	Question: Should we require email verification upon sign-up?
	•	Answer: Requiring email verification enhances security but may add friction to the user experience. Consider your application’s needs and decide accordingly. Supabase supports email confirmations out of the box.
	•	Consideration: Ensure that error messages do not reveal sensitive information (e.g., whether an email is already registered).
	•	Consideration: Implement rate limiting or CAPTCHA to prevent abuse of the authentication endpoints.

Progress

Implementation Status:

1. Supabase Authentication Setup ✅
   - Email/Password authentication enabled
   - Environment variables configured
   - Email confirmations implemented

2. Registration Page ✅
   - Created SignUp component with form validation
   - Implemented password confirmation
   - Added error handling and success feedback
   - Linked to sign-in page for existing users

3. Login Page ✅
   - Created SignIn component with form validation
   - Implemented error handling
   - Added "Forgot Password" functionality
   - Linked to sign-up page for new users

4. Authentication State Management ✅
   - Created AuthContext with TypeScript support
   - Implemented user session management
   - Added loading states
   - Protected routes implemented in App.tsx

5. Database Synchronization ✅
   - Created and implemented user synchronization trigger
   - Trigger automatically creates user records in users table
   - Tested synchronization functionality

6. Testing Implementation ✅
   - Created comprehensive test suite with following coverage:
     
     a. Component Tests:
     - Navigation.test.tsx: Tests for navigation rendering and structure
     - MobileMenu.test.tsx: Tests for mobile menu functionality
     - Form.test.tsx: Tests for SignIn and SignUp form components
     
     b. Test Utilities:
     - test-utils.tsx: Common test wrapper with mocked auth context
     - Mock Supabase client implementation
     
     c. Test Coverage:
     - Basic component rendering
     - User interactions (clicks, form submissions)
     - Form validation
     - Navigation elements
     - Mobile responsiveness
     - Authentication state handling

Outstanding Items:
- Anonymous access implementation (optional feature)
- Additional error handling scenarios
- Performance optimization for auth state changes
- Enhanced security measures (rate limiting, CAPTCHA)

Next Steps:
1. Consider implementing anonymous access if required
2. Add more comprehensive error handling
3. Implement rate limiting or CAPTCHA
4. Optimize performance for auth state changes
