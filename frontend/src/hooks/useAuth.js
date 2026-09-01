import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth Hook
 * - Custom hook for using Auth context
 * - Provides access to user state and auth methods
 * - Throws error if used outside AuthProvider
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider> in your app.'
    );
  }

  return context;
};

export default useAuth;
