import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminImpersonationBar from '../admin/AdminImpersonationBar';
import { Navigation } from './Navigation/Navigation';

export const Layout: React.FC = () => {
  const { user, isImpersonating, originalAdminUser } = useAuth();
  const showAdminBar = user?.role === 'admin' || isImpersonating;

  return (
    <div className="min-h-screen bg-gray-50">
      {showAdminBar && <AdminImpersonationBar />}
      <Navigation />
      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${showAdminBar ? 'mt-12' : ''}`}>
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
};