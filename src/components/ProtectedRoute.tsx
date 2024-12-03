import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', { 
    loading, 
    hasUser: !!user, 
    userRole: user?.role,
    requiredRoles: roles,
    path: location.pathname 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to signin');
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log('User role not authorized:', user.role);
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
  }

  console.log('Access granted to:', location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute; 