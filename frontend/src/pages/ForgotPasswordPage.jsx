import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

/**
 * Forgot Password Page
 * Allow users to request password reset
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call forgot-password API
      // Note: apiClient already returns response.data, so no need to access .data again
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      console.log('✅ Forgot password response:', response);
      setSubmitted(true);
      toast.success('Check your email for reset instructions!');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      // المكتبة ترسل رسالة أمنية موحدة حتى لو الإيميل غير موجود
      setError('If an account exists with this email, you will receive reset instructions');
      toast.error(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (touched && error) {
      setError('');
    }
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="relative min-h-screen w-full overflow-hidden pt-20 pb-12">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="max-w-md mx-auto px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="text-4xl text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Check Your Email
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-2">
                We've sent password reset instructions to:
              </p>
              <p className="font-semibold text-slate-900 dark:text-white mb-6">
                {email}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click the link in your email to reset your password. The link expires in 1 hour.
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Don't see the email? Check your spam or junk folder.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Reset Password</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Regain Access to Your Account
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  { icon: '🔒', title: 'Secure Reset', desc: 'Your password reset link is secure' },
                  { icon: '⏱️', title: '1 Hour Expiry', desc: 'Links expire for your safety' },
                  { icon: '✉️', title: 'Email Confirmation', desc: 'Instructions sent to your inbox' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 group"
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
                      Reset Password
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                      Enter your email to receive reset instructions
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={() => setTouched(true)}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3.5 pl-12 rounded-xl border-2 transition-all duration-300 placeholder-slate-500 dark:placeholder-slate-400 outline-none ${
                            error && touched
                              ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400'
                          } text-slate-900 dark:text-white`}
                        />
                        {!error && touched && email && validateEmail(email) && (
                          <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                        )}
                      </div>
                      {error && touched && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in">
                          <FiAlertCircle size={16} />
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 md:py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <FiLoader size={20} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Back to Login */}
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FiArrowLeft size={18} />
                    Back to Login
                  </button>
                </div>
              </div>

              {/* Security Info */}
              <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                <span className="text-green-500">✓</span>
                Your email is safe with us
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
