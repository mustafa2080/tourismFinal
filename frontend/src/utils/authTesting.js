/**
 * Authentication Testing Utilities
 * Helper functions for testing authentication features
 */

import authService from '../services/authService';
import { tokenManager } from '../utils';

/**
 * Test registration flow
 */
export const testRegister = async () => {
  console.log('🧪 Testing Registration...');
  
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '+20 123 456 7890',
      password: 'Test1234!',
    };

    console.log('📝 Registering user:', testUser.email);
    const response = await authService.register(
      testUser.name,
      testUser.email,
      testUser.phone,
      testUser.password
    );

    console.log('✅ Registration successful!');
    console.log('User:', response.user);
    console.log('Token:', tokenManager.getToken() ? '✓ Stored' : '✗ Not stored');
    
    return response;
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    throw error;
  }
};

/**
 * Test login flow
 */
export const testLogin = async (email = 'test@example.com', password = 'Test1234!') => {
  console.log('🧪 Testing Login...');
  
  try {
    console.log('🔐 Logging in:', email);
    const response = await authService.login(email, password);

    console.log('✅ Login successful!');
    console.log('User:', response.user);
    console.log('Token:', tokenManager.getToken() ? '✓ Stored' : '✗ Not stored');
    
    return response;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
};

/**
 * Test get current user
 */
export const testGetCurrentUser = async () => {
  console.log('🧪 Testing Get Current User...');
  
  try {
    const token = tokenManager.getToken();
    
    if (!token) {
      throw new Error('No token found. Please login first.');
    }

    console.log('👤 Fetching current user...');
    const user = await authService.getCurrentUser();

    console.log('✅ User fetched successfully!');
    console.log('User:', user);
    
    return user;
  } catch (error) {
    console.error('❌ Failed to get user:', error.message);
    throw error;
  }
};

/**
 * Test token refresh
 */
export const testTokenRefresh = async () => {
  console.log('🧪 Testing Token Refresh...');
  
  try {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token found. Please login first.');
    }

    console.log('🔄 Refreshing token...');
    const response = await authService.refreshAccessToken();

    console.log('✅ Token refreshed successfully!');
    console.log('New Token:', tokenManager.getToken() ? '✓ Stored' : '✗ Not stored');
    
    return response;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    throw error;
  }
};

/**
 * Test update profile
 */
export const testUpdateProfile = async () => {
  console.log('🧪 Testing Update Profile...');
  
  try {
    const updates = {
      name: 'Updated Test User',
      phone: '+20 987 654 3210',
    };

    console.log('✏️ Updating profile...');
    const user = await authService.updateProfile(null, updates);

    console.log('✅ Profile updated successfully!');
    console.log('User:', user);
    
    return user;
  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    throw error;
  }
};

/**
 * Test change password
 */
export const testChangePassword = async (oldPassword, newPassword) => {
  console.log('🧪 Testing Change Password...');
  
  try {
    console.log('🔒 Changing password...');
    const response = await authService.changePassword(null, oldPassword, newPassword);

    console.log('✅ Password changed successfully!');
    
    return response;
  } catch (error) {
    console.error('❌ Password change failed:', error.message);
    throw error;
  }
};

/**
 * Test logout
 */
export const testLogout = () => {
  console.log('🧪 Testing Logout...');
  
  try {
    console.log('👋 Logging out...');
    authService.logout();
    
    console.log('✅ Logout successful!');
    console.log('Token:', tokenManager.getToken() ? '✗ Still exists' : '✓ Cleared');
  } catch (error) {
    console.error('❌ Logout failed:', error.message);
    throw error;
  }
};

/**
 * Test complete authentication flow
 */
export const testCompleteFlow = async () => {
  console.log('🧪 Testing Complete Authentication Flow...\n');
  
  try {
    // 1. Register
    console.log('1️⃣ Step 1: Registration');
    const registerResult = await testRegister();
    console.log('');

    // 2. Logout
    console.log('2️⃣ Step 2: Logout');
    testLogout();
    console.log('');

    // 3. Login
    console.log('3️⃣ Step 3: Login');
    await testLogin(registerResult.user.email, 'Test1234!');
    console.log('');

    // 4. Get Current User
    console.log('4️⃣ Step 4: Get Current User');
    await testGetCurrentUser();
    console.log('');

    // 5. Update Profile
    console.log('5️⃣ Step 5: Update Profile');
    await testUpdateProfile();
    console.log('');

    // 6. Change Password
    console.log('6️⃣ Step 6: Change Password');
    await testChangePassword('Test1234!', 'NewTest1234!');
    console.log('');

    // 7. Token Refresh
    console.log('7️⃣ Step 7: Token Refresh');
    await testTokenRefresh();
    console.log('');

    console.log('✅ All tests passed!');
    console.log('\n🎉 Authentication is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Test flow failed at:', error.message);
    throw error;
  }
};

/**
 * Run all tests
 */
export const runAuthTests = async () => {
  console.log('🚀 Starting Authentication Tests...\n');
  console.log('=' .repeat(50));
  
  try {
    await testCompleteFlow();
    console.log('=' .repeat(50));
    console.log('\n✅ All authentication tests completed successfully!');
  } catch (error) {
    console.log('=' .repeat(50));
    console.error('\n❌ Authentication tests failed!');
    console.error('Error:', error.message);
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  window.authTests = {
    testRegister,
    testLogin,
    testGetCurrentUser,
    testTokenRefresh,
    testUpdateProfile,
    testChangePassword,
    testLogout,
    testCompleteFlow,
    runAuthTests,
  };
  
  console.log('💡 Auth testing utilities loaded!');
  console.log('📝 Available commands:');
  console.log('  - authTests.testLogin()');
  console.log('  - authTests.testRegister()');
  console.log('  - authTests.testGetCurrentUser()');
  console.log('  - authTests.runAuthTests() - Run all tests');
}

export default {
  testRegister,
  testLogin,
  testGetCurrentUser,
  testTokenRefresh,
  testUpdateProfile,
  testChangePassword,
  testLogout,
  testCompleteFlow,
  runAuthTests,
};
