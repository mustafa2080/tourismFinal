import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInstantTranslation } from '../../hooks/useInstantTranslation';
import i18n from '../../i18n/i18n';
import { 
  FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiMail, FiPhone, 
  FiMapPin, FiArrowRight, FiSend, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import { notificationsService } from '../../services';

/**
 * Modern Footer Component
 * Fully responsive and animated, matches Header design
 */
const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [, setForceUpdate] = useState(0);

  // Force re-render عند تغيير اللغة
  useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    // استمع لتغيير اللغة
    const unsubscribe = i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  const footerSections = [
    {
      title: t('footer.destinations') || 'Explore',
      links: [
        { label: t('home.popularDestinations') || 'Popular Destinations', path: '/search?popular=true' },
        { label: 'Adventure Tours', path: '/search?type=adventure' },
        { label: 'Beach Getaways', path: '/search?type=beach' },
        { label: 'Cultural Trips', path: '/search?type=cultural' },
      ],
    },
    {
      title: t('footer.company') || 'Company',
      links: [
        { label: t('footer.aboutUs') || 'About Us', path: '/about' },
        { label: t('header.blog') || 'Blog', path: '/blog' },
        { label: t('footer.careers') || 'Careers', path: '/careers' },
        { label: t('footer.press') || 'Press', path: '/press' },
      ],
    },
    {
      title: t('footer.support') || 'Support',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: t('footer.contactUs') || 'Contact Us', path: '/contact' },
        { label: t('footer.faq') || 'FAQ', path: '/faq' },
        { label: 'Booking Status', path: '/booking-status' },
      ],
    },
    {
      title: t('footer.legal') || 'Legal',
      links: [
        { label: t('footer.privacyPolicy') || 'Privacy Policy', path: '/privacy' },
        { label: t('footer.termsOfService') || 'Terms of Service', path: '/terms' },
        { label: t('footer.refundPolicy') || 'Refund Policy', path: '/refund-policy' },
        { label: t('footer.cookieSettings') || 'Cookie Settings', path: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FiFacebook, label: 'Facebook', url: 'https://facebook.com' },
    { icon: FiInstagram, label: 'Instagram', url: 'https://instagram.com' },
    { icon: FiTwitter, label: 'Twitter', url: 'https://twitter.com' },
    { icon: FiLinkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus('loading');
    setErrorMessage('');

    try {
      await notificationsService.subscribeNewsletter(newsletterEmail);
      
      setNewsletterStatus('success');
      setNewsletterEmail('');
      
      setTimeout(() => {
        setNewsletterStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to subscribe. Please try again.');
      setNewsletterStatus('error');
      
      setTimeout(() => {
        setNewsletterStatus(null);
        setErrorMessage('');
      }, 4000);
    }
  };

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '🅿️' },
    { name: 'Apple Pay', icon: '🍎' },
    { name: 'Google Pay', icon: '🔵' },
  ];

  return (
    <footer className="bg-slate-950 dark:bg-slate-950 text-slate-100 mt-24">
      {/* Newsletter Section - Premium Gradient */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.3),transparent_40%),radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.3),transparent_40%)]"></div>
        <div className="absolute inset-0 backdrop-blur-3xl opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold border border-white/20">
                ✨ Join Our Community
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                Discover Your <br className="hidden sm:inline" /> Next Adventure
              </h2>
              <p className="text-blue-100 text-lg max-w-lg leading-relaxed">
                Get exclusive travel deals, insider tips, and early access to new destinations. Join thousands of travelers.
              </p>
            </div>

            {/* Newsletter Form */}
            <form 
              onSubmit={handleNewsletterSubmit} 
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={newsletterStatus === 'loading'}
                  className="flex-1 px-5 py-4 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-white/30 group transform hover:scale-105 sm:min-w-fit"
                >
                  {newsletterStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Subscribing...</span>
                    </>
                  ) : newsletterStatus === 'success' ? (
                    <>
                      <FiCheck size={20} className="text-green-500" />
                      <span className="hidden sm:inline">Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <FiSend size={20} className="group-hover:translate-x-1 transition-transform" />
                      <span className="hidden sm:inline">Subscribe</span>
                    </>
                  )}
                </button>
              </div>
              {newsletterStatus === 'error' && (
                <div className="flex items-center gap-2 text-white/90 text-sm animate-in fade-in slide-in-from-top-2 bg-red-500/20 p-3 rounded-lg border border-red-500/50 backdrop-blur-sm">
                  <FiAlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 md:gap-10 mb-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-6 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-110">
                <BiWorld className="text-white text-xl font-bold" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  Travluyo
                </span>
                <span className="text-xs text-slate-400 font-medium">Tours</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Your gateway to unforgettable journeys. Explore the world's most beautiful destinations with us.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+201000000000"
                className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-all duration-200 text-sm group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all group-hover:scale-110 border border-blue-500/20">
                  <FiPhone size={16} />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">+20 1000 000 000</span>
              </a>

              <a
                href="mailto:support@travluyo.com"
                className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-all duration-200 text-sm group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all group-hover:scale-110 border border-blue-500/20">
                  <FiMail size={16} />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">support@travluyo.com</span>
              </a>

              <div className="flex items-start gap-3 text-slate-400 text-sm group">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0 group-hover:shadow-md transition-all group-hover:scale-110 border border-blue-500/20">
                  <FiMapPin size={16} />
                </div>
                <div className="group-hover:translate-x-1 transition-transform">
                  <p>Cairo, Egypt</p>
                  <p className="text-xs text-slate-500 mt-0.5">24/7 Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-slate-100 mb-5 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-slate-400 hover:text-blue-400 transition-all duration-200 text-sm font-medium hover:translate-x-0.5 inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <FiArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-12" />

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              <p>© {currentYear} Travluyo.</p>
              <p>All rights reserved.</p>
            </div>

            {/* Social Links - Centered */}
            <div className="flex flex-col items-start md:items-center gap-3">
              <span className="text-slate-400 text-sm font-medium">Follow Us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group hover:scale-110 border border-slate-700 hover:border-transparent"
                      aria-label={social.label}
                      title={social.label}
                    >
                      <Icon size={18} className="group-hover:rotate-12 transition-transform" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods - Right */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <span className="text-slate-400 text-sm font-medium">We Accept:</span>
              <div className="flex gap-2 flex-wrap justify-start md:justify-end">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="px-3 py-2 bg-slate-800 hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg text-xs text-slate-300 font-semibold hover:text-white transition-all hover:scale-110 border border-slate-700 hover:border-blue-500/50 flex items-center gap-1.5 cursor-default"
                    title={method.name}
                  >
                    <span>{method.icon}</span>
                    <span className="hidden sm:inline">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back to Top */}
          <div className="border-t border-slate-800 pt-6 flex justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all duration-200 text-sm font-medium group border border-slate-700 hover:border-blue-500/50"
            >
              <span>Back to Top</span>
              <FiArrowRight size={16} className="transform rotate-90 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-800">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="/refund-policy" className="hover:text-slate-300 transition-colors">Refund Policy</a>
            <span>•</span>
            <a href="/cookies" className="hover:text-slate-300 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
