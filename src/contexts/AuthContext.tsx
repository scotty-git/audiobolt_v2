import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContextType, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<UserProfile | null>(null);
  const [originalAdminUser, setOriginalAdminUser] = useState<UserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch user profile including role
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }, []);

  const impersonateUser = useCallback(async (userId: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can impersonate users');
    }

    setLoading(true);
    try {
      if (!originalAdminUser) {
        setOriginalAdminUser(user);
      }

      const impersonatedProfile = await fetchUserProfile(userId);
      if (!impersonatedProfile) {
        throw new Error('Failed to fetch user profile');
      }

      setIsImpersonating(true);
      setImpersonatedUser(impersonatedProfile);
    } finally {
      setLoading(false);
    }
  }, [user, originalAdminUser, fetchUserProfile]);

  const stopImpersonating = useCallback(async () => {
    if (!originalAdminUser) {
      throw new Error('No admin user to return to');
    }
    setLoading(true);
    try {
      setUser(originalAdminUser);
      setIsImpersonating(false);
      setImpersonatedUser(null);
      setOriginalAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, [originalAdminUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsImpersonating(false);
      setImpersonatedUser(null);
      setOriginalAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Try to recover the session from storage first
        const { data: { session: storedSession } } = await supabase.auth.getSession();
        
        if (storedSession?.user && mounted) {
          const profile = await fetchUserProfile(storedSession.user.id);
          if (profile && mounted) {
            setUser(profile);
          }
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          setLoading(true);
          try {
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              if (profile && mounted) {
                setUser(profile);
              } else {
                setUser(null);
              }
            } else {
              setUser(null);
              setIsImpersonating(false);
              setImpersonatedUser(null);
              setOriginalAdminUser(null);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            if (mounted) {
              setUser(null);
            }
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        });

        // Cleanup function
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setIsImpersonating(false);
          setImpersonatedUser(null);
          setOriginalAdminUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  // Don't render until we've completed initial auth check
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="text-gray-600">Initializing...</div>
        </div>
      </div>
    );
  }

  const value = {
    user: isImpersonating ? impersonatedUser : user,
    loading,
    isImpersonating,
    impersonatedUser,
    originalAdminUser,
    signIn,
    signUp,
    signOut,
    resetPassword,
    impersonateUser,
    stopImpersonating,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 