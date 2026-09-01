import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { FiLock, FiArrowRight, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

/**
 * Reset Password Page
 * Allow users to set a new password using reset token
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenVerifying, setTokenVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [success, setSuccess] = useState(false);

  // Verify reset token on mount
  useEffect(() => {
    if (!resetToken) {
      setErrors({ token: 'No reset token provided' });
      setTokenVerifying(false);
      return;
    }

    verifyToken();
  }, [resetToken]);

  const verifyToken = async () => {
    try {
      // apiClient already returns response.data
      const response = await apiClient.get(`/auth/verify-reset-token/${resetToken}`);
      console.log('✅ Token verified:', response);
      setTokenValid(true);
    } catch (err) {
      console.error('❌ Token verification failed:', err);
      // Check if error has message property or is an error object
      const errorMessage = err?.message || err?.response?.data?.message || 'Invalid or expired reset token';
      setErrors({ token: errorMessage });
    } finally {
      setTokenVerifying(false);
    }
  };

  const validatePassword = (password) => {
    // Check minimum length
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain uppercase letter';
    }
    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      return 'Password must contain lowercase letter';
    }
    // Check for number
    if (!/[0-9]/.test(password)) {
      return 'Password must contain number';
    }
    return '';
  };

  const handleFieldBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });

    if (field === 'password') {
      const error = validatePassword(formData.password);
      if (error) {
        setErrors({ ...errors, password: error });
      }
    } else if (field === 'confirmPassword') {
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touchedFields[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      // Call reset-password API
      // apiClient already returns response.data
      const response = await apiClient.post('/auth/reset-password', {
        resetToken,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      console.log('✅ Password reset successful:', response);
      setSuccess(true);
      toast.success('Password reset successfully! 🎉');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('❌ Password reset failed:', err);
      const errorMessage = err?.message || 'Failed to reset password';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Token verification loading
  if (tokenVerifying) {
    return (
      <MainLayout>
        <div className="relative min-h-screen w-full overflow-hidden pt-20 pb-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="max-w-md mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center">
              <FiLoader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Verifying your reset link...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <MainLayout>
        <div className="relative min-h-screen w-full overflow-hidden pt-20 pb-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="max-w-md mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center">
              <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Invalid Link
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {errors.token || 'This reset link is invalid or has expired.'}
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Request New Link
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <MainLayout>
        <div className="relative min-h-screen w-full overflow-hidden pt-20 pb-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="max-w-md mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center animate-in fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                <FiCheckCircle className="text-4xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Password Reset!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Login</span>
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Reset form
  return (
    <MainLayout>
      <div className="relative min-h-screen w-full overflow-hidden pt-20 pb-12">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-200px)]">
            {/* Left Side - Info Section (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <BiWorld className="text-2xl text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Create New Password</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Set Your New Password
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Create a strong password to secure your account
                </p>
              </div>

              {/* Password Requirements */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Password Requirements:</h3>
                {[
                  { icon: '✓', text: 'At least 8 characters' },
                  { icon: '✓', text: 'Contains uppercase letter (A-Z)' },
                  { icon: '✓', text: 'Contains lowercase letter (a-z)' },
                  { icon: '✓', text: 'Contains number (0-9)' },
                ].map((req, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{req.icon}</span>
                    <span className="text-slate-600 dark:text-slate-400">{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Reset Form */}
            <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="relative">
                {/* Form Card */}
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-700">
                  {/* Header */}
                  <div className="text-center mb-8 space-y-3">
                    <div className="flex justify-center">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <BiWorld className="text-3xl text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                      New Password
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                      Enter your new password below
                    </p>
                  </div>

                  {/* Error Message */}
                  {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in">
                      <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Password Field */}
                    <div className="space-y-2.5 group">
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                        New Password
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur('password')}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 transition-all duration-300 outline-none ${
                            errors.password && touchedFields.password
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500'
                          } text-slate-900 dark:text-white`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                      {errors.password && touchedFields.password && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <FiAlertCircle size={16} />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2.5 group">
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur('confirmPassword')}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 transition-all duration-300 outline-none ${
                            errors.confirmPassword && touchedFields.confirmPassword
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500'
                          } text-slate-900 dark:text-white`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && touchedFields.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <FiAlertCircle size={16} />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 md:py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <FiLoader size={20} className="animate-spin" />
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <FiArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
