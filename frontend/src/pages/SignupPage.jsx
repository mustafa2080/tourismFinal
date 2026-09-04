import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Button } from '../components/common';
import { authService } from '../services';
import { useAuth } from '../hooks';
import { useFormValidation, signupValidationRules, checkPasswordStrength } from '../hooks/useFormValidation';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff, 
  FiCheck, FiAlertCircle, FiLoader, FiTrendingUp
} from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Redirect if logged in
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }

  // Use validation hook
  const {
    formData,
    errors,
    touchedFields,
    validFields,
    handleChange,
    handleFieldBlur,
    handleFieldFocus,
    isFormValid,
    resetForm,
  } = useFormValidation(
    {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    signupValidationRules
  );

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      
      await authService.register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password
      );
      
      toast.success('Account created successfully! 🎉');
      resetForm();
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 100);
    } catch (err) {
      const errorMsg = err.message || 'Failed to create account';
      toast.error(errorMsg);
      setSubmitError(errorMsg);
    } finally {
      setLoading(false);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Info (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <BiWorld className="text-2xl text-green-600 dark:text-green-400" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">Join Us Today</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Start Your Adventure
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Create an account and unlock exclusive travel deals, personalized recommendations, and manage all your bookings in one place.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3">
                {[
                  { icon: '✨', title: 'Personalized Deals', desc: 'Get offers tailored to your interests' },
                  { icon: '💰', title: 'Member Exclusive', desc: 'Save up to 30% on premium packages' },
                  { icon: '⚡', title: 'Easy Booking', desc: 'Book and manage trips in seconds' },
                  { icon: '🔒', title: 'Protected Booking', desc: 'Your transactions are 100% secure' },
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-400 transition-all duration-300 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{benefit.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{benefit.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {[
                  { number: '50K+', label: 'Members' },
                  { number: '150+', label: 'Destinations' },
                  { number: '4.9⭐', label: 'Rating' },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{stat.number}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-700">
                {/* Header */}
                <div className="text-center mb-8 space-y-3">
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 via-teal-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group">
                      <FiUser className="text-3xl text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    Create Account
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                    Join thousands of happy travelers
                  </p>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <FormField
                    label="Full Name"
                    icon={FiUser}
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    error={errors.name}
                    isValid={validFields.name}
                    isTouched={touchedFields.name}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('name')}
                    onFocus={() => handleFieldFocus('name')}
                  />

                  {/* Email Field */}
                  <FormField
                    label="Email Address"
                    icon={FiMail}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    error={errors.email}
                    isValid={validFields.email}
                    isTouched={touchedFields.email}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('email')}
                    onFocus={() => handleFieldFocus('email')}
                  />

                  {/* Phone Field */}
                  <FormField
                    label="Phone Number"
                    icon={FiPhone}
                    type="tel"
                    name="phone"
                    placeholder="+20 123 456 7890"
                    value={formData.phone}
                    error={errors.phone}
                    isValid={validFields.phone}
                    isTouched={touchedFields.phone}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('phone')}
                    onFocus={() => handleFieldFocus('phone')}
                  />

                  {/* Password Field */}
                  <PasswordField
                    label="Password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    error={errors.password}
                    isValid={validFields.password}
                    isTouched={touchedFields.password}
                    showPassword={showPassword}
                    onToggleShow={() => setShowPassword(!showPassword)}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('password')}
                    onFocus={() => handleFieldFocus('password')}
                    passwordStrength={passwordStrength}
                  />

                  {/* Confirm Password Field */}
                  <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    error={errors.confirmPassword}
                    isValid={validFields.confirmPassword}
                    isTouched={touchedFields.confirmPassword}
                    showPassword={showConfirmPassword}
                    onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('confirmPassword')}
                    onFocus={() => handleFieldFocus('confirmPassword')}
                    successMessage={validFields.confirmPassword ? 'Passwords match ✓' : ''}
                  />

                  {/* Terms Checkbox */}
                  <TermsCheckbox
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    error={errors.agreeToTerms}
                    isTouched={touchedFields.agreeToTerms}
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="w-full py-3.5 md:py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <FiLoader size={20} className="animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create My Account</span>
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
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Login Link */}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 md:py-4 px-4 rounded-xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Sign In Instead
                </button>
              </div>

              {/* Security Info */}
              <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                <span className="text-green-500">🔒</span>
                Your data is encrypted and fully secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Form Field Component
const FormField = ({
  label,
  icon: Icon,
  type,
  name,
  placeholder,
  value,
  error,
  isValid,
  isTouched,
  onChange,
  onBlur,
  onFocus,
}) => (
  <div className="space-y-2 group">
    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" size={20} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        className={`w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 transition-all duration-300 placeholder-slate-500 dark:placeholder-slate-400 outline-none ${
          error && isTouched
            ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
            : isValid
              ? 'border-green-500 dark:border-green-500 bg-green-50/50 dark:bg-green-900/10'
              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400'
        } text-slate-900 dark:text-white`}
      />
      {isValid && <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
    </div>
    {error && isTouched && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in">
        <FiAlertCircle size={16} />
        {error}
      </p>
    )}
  </div>
);

// Password Field Component
const PasswordField = ({
  label,
  name,
  placeholder,
  value,
  error,
  isValid,
  isTouched,
  showPassword,
  onToggleShow,
  onChange,
  onBlur,
  onFocus,
  passwordStrength,
  successMessage,
}) => (
  <div className="space-y-2 group">
    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
      {label}
    </label>
    <div className="relative">
      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" size={20} />
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        className={`w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 transition-all duration-300 placeholder-slate-500 dark:placeholder-slate-400 outline-none ${
          error && isTouched
            ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
            : isValid
              ? 'border-green-500 dark:border-green-500 bg-green-50/50 dark:bg-green-900/10'
              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-teal-500 dark:focus:border-teal-400'
        } text-slate-900 dark:text-white`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors p-1"
      >
        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
      </button>
    </div>

    {/* Password Strength */}
    {value && name === 'password' && (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${passwordStrength.color} transition-all duration-300`}
              style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {passwordStrength.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {passwordStrength.score < 4 ? 'Add uppercase, numbers & symbols' : '✓ Strong password'}
        </p>
      </div>
    )}

    {isValid && successMessage && (
      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 animate-in fade-in">
        <FiCheck size={16} />
        {successMessage}
      </p>
    )}

    {error && isTouched && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in">
        <FiAlertCircle size={16} />
        {error}
      </p>
    )}
  </div>
);

// Terms Checkbox Component
const TermsCheckbox = ({ checked, onChange, error, isTouched }) => (
  <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
    error && isTouched
      ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
      : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
  }`}>
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name="agreeToTerms"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 accent-teal-600 cursor-pointer transition-all hover:border-teal-400 mt-0.5 flex-shrink-0"
      />
      <span className="text-sm text-slate-600 dark:text-slate-400">
        I agree to the{' '}
        <button type="button" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">
          Terms and Conditions
        </button>
        {' '}and{' '}
        <button type="button" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">
          Privacy Policy
        </button>
      </span>
    </label>
    {error && isTouched && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-2 animate-in fade-in">
        <FiAlertCircle size={16} />
        {error}
      </p>
    )}
  </div>
);

export default SignupPage;
