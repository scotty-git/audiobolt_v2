

Module 4: Update Frontend Routing and Navigation

High-Level Summary

Modify the application’s routing and navigation to handle authenticated and unauthenticated users, and to separate admin and user areas with appropriate access controls. Ensure that users have a seamless experience and are guided appropriately based on their authentication status and role.

Detailed Goals

	•	Implement Protected Routes: Secure routes that require authentication and proper roles.
	•	Update Navigation Menus: Reflect authentication status and user roles in the UI.
	•	Separate Admin and User Areas: Organize routes and components for different user roles.
	•	Ensure Smooth Navigation: Provide a seamless user experience across the application.

Step-by-Step Implementation Guide

Step 1: Implement Protected Routes

	•	Objective: Secure routes that require users to be authenticated and have appropriate roles.
	•	Instructions:
	•	Reuse the ProtectedRoute Component:
	•	Utilize the ProtectedRoute component created in Module 3.
	•	Update Routing Configuration:
	•	In your main routing file, structure your routes with role-based access in mind.

import ProtectedRoute from './components/ProtectedRoute';

<Switch>
  {/* Public Routes */}
  <Route exact path="/" component={HomePage} />
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />

  {/* User Routes */}
  <ProtectedRoute path="/dashboard" component={UserDashboard} roles={['user', 'admin']} />
  <ProtectedRoute path="/profile" component={UserProfile} roles={['user', 'admin']} />

  {/* Admin Routes */}
  <ProtectedRoute path="/admin" component={AdminDashboard} roles={['admin']} />
  <ProtectedRoute path="/admin/users" component={UserManagement} roles={['admin']} />

  {/* Not Authorized */}
  <Route path="/not-authorized" component={NotAuthorized} />

  {/* Fallback Route */}
  <Route component={NotFound} />
</Switch>


	•	Considerations:
	•	Nested Routes: For complex applications, consider using nested routes for admin and user areas.

Step 2: Update Navigation Menus

	•	Objective: Adjust navigation links and menus based on the user’s authentication status and role.
	•	Instructions:
	•	Create a Navbar Component:
	•	Path: src/components/Navbar.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { authUser, userProfile, signOut } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>
      {authUser ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          {userProfile?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;


	•	Include Navbar in Your App:
	•	In your main layout or App.tsx:

<div>
  <Navbar />
  <main>
    {/* Routes */}
  </main>
</div>


	•	Considerations:
	•	Active Link Styling: Use NavLink from react-router-dom to apply active styles to the current route.

Step 3: Separate Admin and User Areas

	•	Objective: Organize routes and components for different user roles for clarity and maintainability.
	•	Instructions:
	•	Organize Components into Folders:

src/
├── components/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   └── ...other admin pages
│   ├── user/
│   │   ├── UserDashboard.tsx
│   │   ├── UserProfile.tsx
│   │   └── ...other user pages
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── ...other pages


	•	Create Layout Components for Each Area:
	•	Optional: Create AdminLayout and UserLayout components to encapsulate area-specific UI elements.

	•	Considerations:
	•	Code Reusability: Share components between admin and user areas where appropriate to avoid duplication.

Step 4: Ensure Smooth Navigation

	•	Objective: Provide users with clear navigation cues and seamless transitions.
	•	Instructions:
	•	Redirect After Login/Logout:
	•	Upon successful login, redirect users based on their role.

// In Login component after successful login
if (userProfile.role === 'admin') {
  history.push('/admin');
} else {
  history.push('/dashboard');
}


	•	Upon logout, redirect users to the home page or login page.

	•	Handle Unauthorized Access Attempts:
	•	Ensure that users who attempt to access unauthorized routes are redirected to the NotAuthorized page with a friendly message.
	•	Provide Clear Error Messages:
	•	When users are denied access, provide messages that guide them on what to do next.

	•	Considerations:
	•	Consistency: Ensure that navigation elements are consistent across different pages and roles.

Testing

	•	Test Case 1: Navigation as Unauthenticated User
	•	Purpose: Verify that unauthenticated users can access public pages and are guided appropriately.
	•	Test Steps:
	1.	Access the application without logging in.
	2.	Verify that public pages (Home, Login, Signup) are accessible.
	3.	Attempt to access protected routes (Dashboard, Admin Panel) and confirm redirection to the login page.
	•	Test Case 2: Navigation as Regular User
	•	Purpose: Ensure that authenticated users have access to user-specific areas and are restricted from admin areas.
	•	Test Steps:
	1.	Log in as a regular user.
	2.	Verify that user-specific routes (Dashboard, Profile) are accessible.
	3.	Confirm that admin links are not visible in the navigation.
	4.	Attempt to access admin routes and confirm redirection to NotAuthorized page.
	•	Test Case 3: Navigation as Admin User
	•	Purpose: Ensure that admin users have access to admin areas and appropriate user areas.
	•	Test Steps:
	1.	Log in as an admin user.
	2.	Verify that admin routes (Admin Dashboard, User Management) are accessible.
	3.	Confirm that admin-specific links are visible in the navigation.
	4.	Access user-specific routes and confirm access is granted.
	•	Test Case 4: Redirects After Authentication Actions
	•	Purpose: Verify that users are redirected appropriately after login and logout.
	•	Test Steps:
	1.	Log in as a regular user and confirm redirection to /dashboard.
	2.	Log out and confirm redirection to the home page.
	3.	Log in as an admin and confirm redirection to /admin.
	•	Test Case 5: UI Consistency and Navigation Elements
	•	Purpose: Ensure that navigation elements update correctly based on authentication status and role.
	•	Test Steps:
	1.	While logged out, check that login and signup links are visible.
	2.	Log in and confirm that logout and dashboard links replace the login/signup links.
	3.	Verify that the navigation bar remains consistent across different pages.

Questions and Considerations

	•	Question: Should we implement a separate design theme for admin and user areas?
	•	Answer: Implementing distinct themes can help users easily recognize the context they are in, but it’s important to maintain overall brand consistency. Evaluate whether the benefits outweigh the complexity.
	•	Consideration: Ensure that all routes are accounted for and that the user cannot access any unintended pages.
	•	Consideration: Keep accessibility in mind when designing navigation elements (e.g., keyboard navigation, screen reader compatibility).

