import React, { useState, useEffect } from 'react';
import { Cookie, Settings, BarChart3, Globe, Shield, ExternalLink } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const CookieSettingsPage = () => {
  const [cookies, setCookies] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollTop / docHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cookieCategories = [
    {
      name: 'Necessary',
      icon: '🔒',
      desc: 'Essential for website function. Required.',
      status: 'always',
      examples: 'Session ID, auth tokens, CSRF protection',
      enabled: true,
      type: 'necessary'
    },
    {
      name: 'Analytics',
      icon: '📊',
      desc: 'Understand how visitors use our site.',
      status: 'optional',
      examples: 'Google Analytics, page views, session duration',
      enabled: cookies.analytics,
      type: 'analytics'
    },
    {
      name: 'Marketing',
      icon: '📢',
      desc: 'Personalized ads and campaign tracking.',
      status: 'optional',
      examples: 'Facebook Pixel, conversion tracking, retargeting',
      enabled: cookies.marketing,
      type: 'marketing'
    },
    {
      name: 'Preferences',
      icon: '⚙️',
      desc: 'Remember your choices and settings.',
      status: 'optional',
      examples: 'Theme, language, saved filters, search history',
      enabled: cookies.preferences,
      type: 'preferences'
    },
  ];

  const toggle = (type) => {
    if (type !== 'necessary') {
      setCookies(p => ({ ...p, [type]: !p[type] }));
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-rose-950 dark:to-slate-950">
        {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 z-50 transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }}></div>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-8 mx-auto shadow-2xl">
            <Cookie size={40} className="text-white" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Cookie Settings
          </h1>

          <p className="text-lg sm:text-xl text-rose-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Manage your privacy preferences and control how we use cookies.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Cookie Control Panel */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <Settings size={32} className="text-rose-400" />
            Your Cookie Preferences
          </h2>

          <div className="space-y-4 mb-8">
            {cookieCategories.map((cat) => (
              <div key={cat.type} className={`rounded-xl p-6 border transition-all ${
                cat.enabled ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      {cat.name}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        cat.status === 'always' 
                          ? 'bg-green-500/20 text-green-200' 
                          : 'bg-white/10 text-rose-200'
                      }`}>
                        {cat.status === 'always' ? 'Always Active' : 'Optional'}
                      </span>
                    </h3>
                    <p className="text-rose-100 mb-2">{cat.desc}</p>
                    <p className="text-xs text-rose-200"><strong>Examples:</strong> {cat.examples}</p>
                  </div>
                  
                  {cat.type !== 'necessary' ? (
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={cat.enabled}
                        onChange={() => toggle(cat.type)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  ) : (
                    <div className="text-sm font-semibold text-green-300 ml-4">✓ Required</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => setCookies({ necessary: true, analytics: false, marketing: false, preferences: false })}
              className="flex-1 px-4 py-3 bg-white/10 text-rose-200 rounded-lg font-bold hover:bg-white/20 border border-white/20 transition-all"
            >
              Reject All
            </button>
            <button
              onClick={() => setCookies({ necessary: true, analytics: true, marketing: true, preferences: true })}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-rose-500/30 transition-all"
            >
              Accept All
            </button>
          </div>

          <button
            onClick={() => alert('Preferences saved!')}
            className="w-full px-4 py-3 bg-white/5 text-white rounded-lg font-bold hover:bg-white/10 border border-white/20 transition-all"
          >
            Save Preferences
          </button>
        </div>

        {/* What Are Cookies */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">What Are Cookies?</h2>
          <p className="text-rose-100 mb-4">
            Cookies are small text files stored on your device when you visit websites. They're used to remember your login, preferences, and improve your experience.
          </p>
          <p className="text-rose-100">
            There are two types: session cookies (deleted when closing browser) and persistent cookies (remain for days/months/years).
          </p>
        </div>

        {/* Cookie Table */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Cookies We Use</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-rose-200 font-bold">Cookie</th>
                  <th className="text-left py-3 px-4 text-rose-200 font-bold">Type</th>
                  <th className="text-left py-3 px-4 text-rose-200 font-bold">Purpose</th>
                  <th className="text-left py-3 px-4 text-rose-200 font-bold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'session_id', type: 'Necessary', purpose: 'Session management', dur: 'Session' },
                  { name: 'auth_token', type: 'Necessary', purpose: 'Authentication', dur: '30 days' },
                  { name: '_ga', type: 'Analytics', purpose: 'Google Analytics', dur: '2 years' },
                  { name: 'fbp', type: 'Marketing', purpose: 'Facebook Tracking', dur: '90 days' },
                  { name: 'user_theme', type: 'Preferences', purpose: 'Theme choice', dur: '1 year' },
                ].map((c, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-mono text-xs">{c.name}</td>
                    <td className="py-3 px-4 text-rose-200 text-xs">{c.type}</td>
                    <td className="py-3 px-4 text-rose-100 text-xs">{c.purpose}</td>
                    <td className="py-3 px-4 text-rose-200 text-xs">{c.dur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Browser Controls */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Manage Cookies in Your Browser</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { browser: 'Chrome', path: 'Settings → Privacy → Cookies' },
              { browser: 'Firefox', path: 'Preferences → Privacy → Cookies' },
              { browser: 'Safari', path: 'Preferences → Privacy → Cookies' },
              { browser: 'Edge', path: 'Settings → Privacy → Cookies' },
            ].map((b, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2">{b.browser}</h4>
                <p className="text-rose-200 text-sm">{b.path}</p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 mt-6">
            <p className="text-yellow-100 text-sm">
              <strong>⚠️ Note:</strong> Disabling cookies may affect website functionality and your experience. Some features won't work properly without cookies.
            </p>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Third-Party Cookie Providers</h2>

          <div className="space-y-4">
            {[
              { icon: '📊', name: 'Google Analytics', link: 'https://policies.google.com/privacy' },
              { icon: '📢', name: 'Facebook Ads', link: 'https://www.facebook.com/privacy/explanation' },
              { icon: '⚙️', name: 'Mixpanel', link: 'https://mixpanel.com/legal/privacy-policy' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10 hover:border-rose-400/50 transition-all">
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-medium text-white">{service.name}</span>
                </span>
                <a href={service.link} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300">
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              { q: 'Are cookies safe?', a: 'Yes, generally safe. They\'re text files and can\'t execute code. Privacy controls are important though.' },
              { q: 'Can I delete cookies?', a: 'Yes, through browser settings. May affect browsing experience on sites.' },
              { q: 'Will preferences be remembered?', a: 'Yes, for 12 months. We\'ll ask again after to ensure they reflect your wishes.' },
              { q: 'What if I disable all?', a: 'You won\'t be able to log in or use personalized features. Necessary cookies required.' },
              { q: 'How opt-out of ads?', a: 'Use browser settings, this page, or Network Advertising Initiative website.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-rose-200 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">📧 Questions About Cookies?</h2>
          <div className="space-y-2">
            <p className="text-rose-100"><strong>Email:</strong> cookies@tourhub.com</p>
            <p className="text-rose-100"><strong>Privacy:</strong> privacy@tourhub.com</p>
            <p className="text-rose-100"><strong>Phone:</strong> +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
};

export default CookieSettingsPage;