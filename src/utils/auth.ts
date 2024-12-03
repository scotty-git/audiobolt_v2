import { UserProfile, UserRole } from '../types/auth';

export const hasRole = (user: UserProfile | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

export const isAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, 'admin');
};

export const isUser = (user: UserProfile | null): boolean => {
  return hasRole(user, 'user');
}; 