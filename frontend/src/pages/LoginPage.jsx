import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Button } from '../components/common';
import { useAuth } from '../hooks';
import { 
  FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, 
  FiCheckCircle, FiAlertCircle, FiLoader
} from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import toast from 'react-hot-toast';

/**
 * Modern LoginPage Component
 * Fully responsive, animated login form with Tailwind CSS
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in (check on mount only)
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = location.state?.from || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, []); // Empty - check once on component mount

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password && password.length >= 6;
  };

  // Real-time validation on change
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          newErrors.email = '';
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = `Password must be at least 6 characters (${value.length}/6)`;
        } else {
          newErrors.password = '';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
    validateField(field, formData[field]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success('Login successful! 🎉');
      // Wait a bit for state to update, then navigate
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Real-time validation only if field has been touched
    if (touchedFields[name]) {
      validateField(name, newValue);
    }
  };

  return (
    <MainLayout>
      <div className="relative min-h-screen w-full overflow-hidden pt-20 pb-12">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/20 via-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-200px)]">
            {/* Left Side - Info Section (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                  <BiWorld className="text-2xl text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">Welcome Back</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome to Your Travel Journey
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sign in to access your bookings, wishlists, and exclusive travel offers personalized just for you.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  { icon: '🎯', title: 'Secure Access', desc: 'Your data is encrypted and protected' },
                  { icon: '📱', title: 'Easy Management', desc: 'Manage all your bookings in one place' },
                  { icon: '✨', title: 'Exclusive Deals', desc: 'Get access to members-only offers' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-400 transition-all duration-300 group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700">
              {/* Card Container */}
              <div className="relative">
                {/* Gradient Border Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 via-orange-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                {/* Form Card */}
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-700">
                  {/* Header */}
                  <div className="text-center mb-8 space-y-3">
                    <div className="flex justify-center">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-teal-500 via-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30 group">
                        <BiWorld className="text-3xl text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                      Login
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                      Welcome back! Let's get you logged in.
                    </p>
                  </div>

                  {/* Error Message */}
                  {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2.5 group">
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" size={20} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur('email')}
                          onFocus={() => setTouchedFields({ ...touchedFields, email: true })}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3.5 pl-12 rounded-xl border-2 transition-all duration-300 placeholder-slate-500 dark:placeholder-slate-400 outline-none ${
                            errors.email && touchedFields.email
                              ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                              : !errors.email && touchedFields.email && formData.email
                              ? 'border-green-500 dark:border-green-500 bg-green-50/50 dark:bg-green-900/10'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400'
                          } text-slate-900 dark:text-white`}
                        />
                        {!errors.email && touchedFields.email && formData.email && (
                          <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse" size={20} />
                        )}
                        {errors.email && touchedFields.email && (
                          <FiAlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-pulse" size={20} />
                        )}
                      </div>
                      {errors.email && touchedFields.email && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in">
                          <FiAlertCircle size={16} />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2.5 group">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur('password')}
                          onFocus={() => setTouchedFields({ ...touchedFields, password: true })}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 transition-all duration-300 placeholder-slate-500 dark:placeholder-slate-400 outline-none ${
                            errors.password && touchedFields.password
                              ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                              : !errors.password && touchedFields.password && formData.password
                              ? 'border-green-500 dark:border-green-500 bg-green-50/50 dark:bg-green-900/10'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400'
                          } text-slate-900 dark:text-white`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors p-1"
                        >
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                        {!errors.password && touchedFields.password && formData.password && (
                          <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse" size={20} />
                        )}
                        {errors.password && touchedFields.password && (
                          <FiAlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-pulse" size={20} />
                        )}
                      </div>
                      {errors.password && touchedFields.password && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in">
                          <FiAlertCircle size={16} />
                          {errors.password}
                        </p>
                      )}
                      {touchedFields.password && formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              Password Strength
                            </span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {formData.password.length}/6
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                formData.password.length < 6
                                  ? 'w-1/3 bg-red-500'
                                  : formData.password.length < 8
                                  ? 'w-2/3 bg-yellow-500'
                                  : 'w-full bg-green-500'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 accent-teal-600 cursor-pointer transition-all hover:border-teal-400"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                      >
                        Keep me logged in
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || errors.email || errors.password || !formData.email || !formData.password}
                      className="w-full py-3.5 md:py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <>
                          <FiLoader size={20} className="animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        New to Voyager Tours?
                      </span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full py-3.5 md:py-4 px-4 rounded-xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Security Info */}
              <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                <span className="text-green-500">✓</span>
                Your data is encrypted and fully secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
