import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiPhone, FiMapPin, FiArrowRight, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { BiShieldAlt, BiUserCheck } from 'react-icons/bi';
import { adminService } from '../services';
import toast from 'react-hot-toast';

/**
 * Admin Setup Page - Hidden Admin Account Creation
 * Password protected - Access code required
 * Modern, Professional UI with Dark Mode Support
 * Backend Connected
 */
const AdminSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Access Code, 2: Admin Details, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Access Code
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  // Step 2: Admin Details
  const [adminData, setAdminData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
  });

  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  // Correct Access Code (Should be stored in Backend environment variable)
  const ADMIN_ACCESS_CODE = 'ADMIN2024SETUP';

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecial,
      isValid: minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecial,
    };
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Phone validation
  const validatePhone = (phone) => {
    const regex = /^[\d\s+\-()]{10,}$/;
    return regex.test(phone.replace(/\s/g, ''));
  };

  // Step 1: Verify Access Code
  const handleVerifyAccessCode = (e) => {
    e.preventDefault();
    setAccessCodeError('');

    if (!accessCode.trim()) {
      setAccessCodeError('Access code is required');
      return;
    }

    if (accessCode === ADMIN_ACCESS_CODE) {
      setStep(2);
      toast.success('Access code verified! ✓');
    } else {
      setAccessCodeError('Invalid access code. Please try again.');
      setAccessCode('');
      toast.error('Invalid access code');
    }
  };

  // Handle field changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
    setFormTouched((prev) => ({ ...prev, [name]: true }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!adminData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!adminData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(adminData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!adminData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(adminData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!adminData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordCheck = validatePassword(adminData.password);
      if (!passwordCheck.isValid) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    if (!adminData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (adminData.password !== adminData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!adminData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Create Admin Account
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setStep(3);
    toast.success('Admin account details validated!');
  };

  // Step 3: Submit to Backend
  const handleConfirmCreateAdmin = async () => {
    try {
      setLoading(true);

      // Prepare data for API
      const payload = {
        fullName: adminData.fullName,
        email: adminData.email,
        phone: adminData.phone,
        password: adminData.password,
        address: adminData.address || '',
        city: adminData.city,
        role: 'admin',
      };

      // Call Backend API via service
      const response = await adminService.setupAdmin(payload);

      if (response.success || response.message) {
        toast.success('Admin account created successfully! ✓');
        
        // Navigate after short delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      toast.error(error.message || 'Failed to create admin account');
      setStep(2); // Go back to form
    } finally {
      setLoading(false);
    }
  };

  const passwordCheck = validatePassword(adminData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <BiShieldAlt className="text-white text-2xl" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Setup</h1>
              <p className="text-blue-200 dark:text-slate-400 text-sm">
                {step === 1 && 'Enter your access code to continue'}
                {step === 2 && 'Create your admin account'}
                {step === 3 && 'Confirm and create account'}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 justify-center pt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8' : 'bg-slate-600 w-2'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Step 1: Access Code */}
          {step === 1 && (
            <form onSubmit={handleVerifyAccessCode} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Access Code</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setAccessCodeError('');
                    }}
                    placeholder="Enter access code"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                {accessCodeError && (
                  <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                    <FiAlertCircle size={16} />
                    {accessCodeError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Verify Code
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* Step 2: Admin Details */}
          {step === 2 && (
            <form onSubmit={handleCreateAdmin} className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type="text"
                    name="fullName"
                    value={adminData.fullName}
                    onChange={handleFieldChange}
                    placeholder="Your full name"
                    className={`w-full pl-12 pr-4 py-2.5 bg-white/10 dark:bg-slate-700/50 border ${
                      errors.fullName ? 'border-red-500' : 'border-white/20 dark:border-slate-600'
                    } text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                </div>
                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type="email"
                    name="email"
                    value={adminData.email}
                    onChange={handleFieldChange}
                    placeholder="admin@example.com"
                    className={`w-full pl-12 pr-4 py-2.5 bg-white/10 dark:bg-slate-700/50 border ${
                      errors.email ? 'border-red-500' : 'border-white/20 dark:border-slate-600'
                    } text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type="tel"
                    name="phone"
                    value={adminData.phone}
                    onChange={handleFieldChange}
                    placeholder="+20 1234567890"
                    className={`w-full pl-12 pr-4 py-2.5 bg-white/10 dark:bg-slate-700/50 border ${
                      errors.phone ? 'border-red-500' : 'border-white/20 dark:border-slate-600'
                    } text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">City</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type="text"
                    name="city"
                    value={adminData.city}
                    onChange={handleFieldChange}
                    placeholder="Your city"
                    className={`w-full pl-12 pr-4 py-2.5 bg-white/10 dark:bg-slate-700/50 border ${
                      errors.city ? 'border-red-500' : 'border-white/20 dark:border-slate-600'
                    } text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                </div>
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>

              {/* Address (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Address (Optional)</label>
                <input
                  type="text"
                  name="address"
                  value={adminData.address}
                  onChange={handleFieldChange}
                  placeholder="Your address"
                  className="w-full px-4 py-2.5 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={adminData.password}
                    onChange={handleFieldChange}
                    placeholder="Create strong password"
                    className={`w-full pl-12 pr-12 py-2.5 bg-white/10 dark:bg-slate-700/50 border ${
                      errors.password ? 'border-red-500' : 'border-white/20 dark:border-slate-600'
                    } text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-blue-400 hover:text-blue-300"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

                {/* Password Requirements */}
                {adminData.password && (
                  <div className="mt-3 space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordCheck.minLength ? 'text-green-400' : 'text-slate-400'}`}>
                      <FiCheck size={14} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordCheck.hasUppercase ? 'text-green-400' : 'text-slate-400'}`}>
                      <FiCheck size={14} />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordCheck.hasLowercase ? 'text-green-400' : 'text-slate-400'}`}>
                      <FiCheck size={14} />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordCheck.hasNumbers ? 'text-green-400' : 'text-slate-400'}`}>
                      <FiCheck size={14} />
                      One number
                    </div>
                    <div className={`flex items-center gap-2 ${passwordCheck.hasSpecial ? 'text-green-400' : 'text-slate-400'}`}>
                      <FiCheck size={14} />
                      One special character (!@#$%^&*)
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-blue-400 text-xl" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={adminData.confirmPassword}
                    onChange={handleFieldChange}
                    placeholder="Confirm password"
                    className={`w-full pl-12 pr-12 py-2.5 bg-white/10 dark:bg-slate-700/50 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-white/20 dark:border-slate-600'
                    } text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 text-blue-400 hover:text-blue-300"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Continue
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Confirmation Message */}
              <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center space-y-3">
                <div className="flex justify-center">
                  <BiUserCheck className="text-green-400 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-green-400">Ready to Create Account</h3>
                <p className="text-green-300/80 text-sm">Please review your information and confirm</p>
              </div>

              {/* Summary */}
              <div className="bg-white/5 dark:bg-slate-700/30 rounded-2xl p-6 space-y-3 border border-white/10 dark:border-slate-600">
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Full Name</p>
                  <p className="text-white font-semibold">{adminData.fullName}</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-semibold">{adminData.email}</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">{adminData.phone}</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">City</p>
                  <p className="text-white font-semibold">{adminData.city}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmCreateAdmin}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 group"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Admin
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                You will be redirected to login after successful account creation
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          This is a secure admin setup page. Do not share this URL.
        </p>
      </div>
    </div>
  );
};

export default AdminSetupPage;
