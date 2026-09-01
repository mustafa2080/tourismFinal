import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import authService from '../services/authService';

export const AuthContext = createContext();

/**
 * Helper: Extract valid base64 string from profileImage
 * Handles cases where profileImage might be an object instead of string
 */
const extractProfileImage = (profileImage) => {
  if (!profileImage) return null;
  
  if (typeof profileImage === 'string' && profileImage.length > 0) {
    return profileImage;
  }
  
  // If it's an object, try to extract the data
  if (typeof profileImage === 'object') {
    return profileImage.data || profileImage.base64 || profileImage.value || null;
  }
  
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initDone, setInitDone] = useState(false);

  /**
   * Initialize auth on component mount
   */
  useEffect(() => {
    // Skip if already initialized
    if (initDone) return;

    const initializeAuth = async () => {
      try {
        const token = Cookies.get('authToken');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          setInitDone(true);
          return;
        }

        // Token exists, try to fetch user
        try {
          const response = await authService.getCurrentUser();
          
          // Extract user data safely - handle both formats
          let userData = null;
          
          if (response && response.data) {
            userData = response.data;
          } else if (response && response.id) {
            userData = response;
          }
          
          console.log('👤 [AuthContext] Extracted user data:', userData);
          
          if (userData && userData.id) {
            // ✅ Validate profileImage is string, not object
            const profileImage = extractProfileImage(userData.profileImage);
            
            const fullUserData = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              avatar: userData.avatar,
              profileImage: profileImage,
              profileImageMimeType: userData.profileImageMimeType || 'image/jpeg',
              role: userData.role || 'customer'
            };
            
            setUser(fullUserData);
          } else {
            console.warn('⚠️ [AuthContext] No user ID in response');
            setUser(null);
          }
        } catch (err) {
          console.error('❌ [AuthContext] Error fetching user:', err.message);
          
          if (err.response?.status === 401 || err.status === 401) {
            Cookies.remove('authToken');
            Cookies.remove('refreshToken');
          }
          
          setUser(null);
        }
      } catch (err) {
        console.error('❌ [AuthContext] Fatal error during init:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setInitDone(true);
      }
    };

    initializeAuth();
  }, [initDone]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);
      
      if (response && response.user) {
        
        // ✅ Validate profileImage is string, not object
        const profileImage = extractProfileImage(response.user.profileImage);
        
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          avatar: response.user.avatar,
          profileImage: profileImage,
          profileImageMimeType: response.user.profileImageMimeType || 'image/jpeg',
          role: response.user.role || 'user'
        };
        
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      console.error('❌ [AuthContext.login] Error:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(name, email, phone, password);
      
      if (response && response.user) {
        // ✅ Validate profileImage is string, not object
        const profileImage = extractProfileImage(response.user.profileImage);
        
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          avatar: response.user.avatar,
          profileImage: profileImage,
          profileImageMimeType: response.user.profileImageMimeType || 'image/jpeg',
          role: response.user.role || 'user'
        };
        
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid register response');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    authService.logout();
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const updateData = { ...data };
      const response = await authService.updateProfile(user.id, updateData);
      
      let updatedUser = null;
      if (response && response.data) {
        updatedUser = response.data;
      } else if (response && response.id) {
        updatedUser = response;
      }
      
      if (updatedUser) {
        // ✅ Validate profileImage is string, not object
        const profileImage = extractProfileImage(updatedUser.profileImage);
        
        const fullUserData = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          profileImage: profileImage || user?.profileImage || null,
          profileImageMimeType: updatedUser.profileImageMimeType || user?.profileImageMimeType || 'image/jpeg',
          role: updatedUser.role || user.role || 'user'
        };
        
        setUser(fullUserData);
        return fullUserData;
      }
      
      throw new Error('Invalid profile update response');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await authService.changePassword(user.id, oldPassword, newPassword);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to change password';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
