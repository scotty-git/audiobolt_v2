import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthContextType, UserProfile, UserRole } from '../../types/auth';

// Create a test auth context
const TestAuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a test auth provider that doesn't rely on Supabase
const TestAuthProvider: React.FC<{ children: React.ReactNode; initialRole?: UserRole }> = ({ 
    children, 
    initialRole = 'user' 
}) => {
    const [user, setUser] = useState<UserProfile>({
        id: 'test-user-id',
        email: 'test@example.com',
        role: initialRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    const [loading, setLoading] = useState(false);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);
    const [originalAdminUser, setOriginalAdminUser] = useState<UserProfile | null>(null);

    // Ensure the user role is properly set
    useEffect(() => {
        setUser(prev => ({
            ...prev,
            role: initialRole
        }));
    }, [initialRole]);

    const value: AuthContextType = {
        user,
        loading,
        isImpersonating,
        impersonatedUser,
        originalAdminUser,
        signIn: async () => {},
        signUp: async () => {},
        signOut: async () => {
            setUser({
                ...user,
                role: initialRole
            });
        },
        resetPassword: async () => {},
        impersonateUser: async () => {},
        stopImpersonating: async () => {}
    };

    return (
        <TestAuthContext.Provider value={value}>
            {children}
        </TestAuthContext.Provider>
    );
};

// Create providers wrapper with role
export const createProvidersWithRole = (role: UserRole = 'user') => {
    return ({ children }: { children: React.ReactNode }) => (
        <BrowserRouter>
            <TestAuthProvider initialRole={role}>
                {children}
            </TestAuthProvider>
        </BrowserRouter>
    );
};

// Default providers wrapper
export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return createProvidersWithRole('user')({ children });
};

// Export the test auth hook
export const useAuth = () => {
    const context = useContext(TestAuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a TestAuthProvider');
    }
    return context;
};

// Re-export everything from RTL
export * from '@testing-library/react';