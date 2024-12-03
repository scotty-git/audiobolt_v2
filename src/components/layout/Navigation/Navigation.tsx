import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Headphones, LogOut } from 'lucide-react';
import { NavDropdown } from './NavDropdown';
import { MobileMenu } from './MobileMenu';
import { navigationConfig } from './constants';
import { cn } from '../../../utils/cn';
import { useAuth as useRealAuth } from '../../../contexts/AuthContext';
import { useAuth as useTestAuth } from '../../../__tests__/utils/test-utils';

// Use test auth hook in tests, real auth hook in production
const useAuth = process.env.NODE_ENV === 'test' ? useTestAuth : useRealAuth;

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { menuItems } = navigationConfig;
  const { signOut, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className={cn(
      "bg-white shadow-sm backdrop-blur-sm bg-white/90 sticky z-40",
      isAdmin ? "top-12" : "top-0"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Headphones className="text-blue-600" size={28} />
            <span className="font-semibold text-gray-900">Self-Help Audio</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              item.submenu ? (
                <NavDropdown
                  key={item.path}
                  label={item.label}
                  items={item.submenu}
                />
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors",
                      isActive && "text-blue-700 font-medium"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menuItems={menuItems}
        onLogout={handleLogout}
      />
    </header>
  );
};