export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isImpersonating: boolean;
  impersonatedUser: UserProfile | null;
  originalAdminUser: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  stopImpersonating: () => Promise<void>;
} 