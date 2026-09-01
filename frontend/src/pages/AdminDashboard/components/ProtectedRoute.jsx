import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('🛡️ [AdminProtectedRoute] Checking access:', {
    loading,
    hasUser: !!user,
    userId: user?.id,
    userRole: user?.role,
    isAdmin: user?.role === 'admin'
  });

  // While loading
  if (loading) {
    console.log('⏳ [AdminProtectedRoute] Still loading user data...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user && user.role === 'admin') {
    console.log('✅ [AdminProtectedRoute] Access granted to admin:', user.id);
    return children;
  }

  // Not admin
  console.log('❌ [AdminProtectedRoute] Access Denied - User is not admin:', {
    hasUser: !!user,
    role: user?.role,
    email: user?.email
  });
  
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;
