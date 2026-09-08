import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, Mail, Phone } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const FAQPage = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
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

  const faqs = [
    {
      cat: 'Booking',
      icon: '🎫',
      items: [
        { q: 'How do I book a tour?', a: 'Browse tours, select dates, add travelers, and complete payment. You\'ll get confirmation via email.' },
        { q: 'Can I modify my booking?', a: 'You can modify within 24 hours. After that, cancel and rebook or contact support.' },
        { q: 'What payment methods accepted?', a: 'All major credit cards, debit cards, PayPal, and digital wallets. All secure.' },
        { q: 'Do you offer group discounts?', a: 'Yes! Groups 10+ get special pricing. Email groups@tourhub.com.' },
      ]
    },
    {
      cat: 'Refunds',
      icon: '↩️',
      items: [
        { q: 'What is your cancellation policy?', a: '30+ days: 100% refund, 15-29 days: 50%, <15 days: no refund. Per operator policy.' },
        { q: 'How long for refunds?', a: '5-10 business days after approval. Bank deposit varies.' },
        { q: 'Can I reschedule?', a: 'Yes! Most operators allow it. Contact support with booking number.' },
        { q: 'Medical emergency refund?', a: 'Yes, with documentation. We handle case-by-case.' },
      ]
    },
    {
      cat: 'Account',
      icon: '👤',
      items: [
        { q: 'How to create account?', a: 'Click "Sign Up", enter email, create password, verify email. Or use Google/Facebook.' },
        { q: 'Forgot password?', a: 'Click "Forgot Password", enter email, follow reset link.' },
        { q: 'Can I delete my account?', a: 'Go to Settings > Account > Delete Account. This is permanent.' },
        { q: 'Update profile info?', a: 'Settings > Profile > Edit. Remember to save changes.' },
      ]
    },
    {
      cat: 'Payment',
      icon: '💳',
      items: [
        { q: 'Why service fee?', a: 'Helps maintain platform, support, and secure processing.' },
        { q: 'Do prices include tax?', a: 'No, taxes shown separately and added at checkout.' },
        { q: 'Price changed?', a: 'Prices may change based on availability. Locked after payment.' },
        { q: 'Promo codes?', a: 'Yes! Enter at checkout. Applied before taxes and fees.' },
      ]
    },
    {
      cat: 'Safety',
      icon: '🛡️',
      items: [
        { q: 'Is TourHub safe?', a: 'Yes! SSL encryption, secure payments, verified operators, privacy protection.' },
        { q: 'Travel insurance available?', a: 'Yes, optional at checkout. Covers emergencies and cancellations.' },
        { q: 'Destination becomes unsafe?', a: 'Full refund or reschedule. Check government travel advisories.' },
        { q: 'What documents needed?', a: 'Valid passport, visa if required, travel insurance, vaccinations.' },
      ]
    },
    {
      cat: 'Reviews',
      icon: '⭐',
      items: [
        { q: 'Leave a review?', a: 'Log in, go to "My Tours", click "Leave a Review", rate and share.' },
        { q: 'Edit or delete review?', a: 'Edit within 30 days. After, contact support for deletion.' },
        { q: 'Are all reviews published?', a: 'Moderated for authenticity. Fake reviews are removed.' },
        { q: 'How ratings calculated?', a: 'Average of verified reviews with recent ones weighted higher.' },
      ]
    },
    {
      cat: 'Support',
      icon: '📞',
      items: [
        { q: 'Contact support?', a: 'Email: support@tourhub.com, Phone: +1 (555) 123-4567, 24/7 chat.' },
        { q: 'Response time?', a: '2 hours during business hours, 4-8 hours outside. Chat instant.' },
        { q: 'Unhappy with tour?', a: 'Depends on operator policy. Contact us with booking details.' },
        { q: 'Issue during tour?', a: 'Call operator\'s emergency number immediately. Report to us after.' },
      ]
    },
    {
      cat: 'Technical',
      icon: '🔧',
      items: [
        { q: 'Can\'t log in?', a: 'Check caps lock, use "Forgot Password", try different browser, clear cache.' },
        { q: 'Website slow?', a: 'Refresh, clear cache, disable ad-blockers, try different browser.' },
        { q: 'Mobile app available?', a: 'Yes! Fully responsive website. Download iOS & Android app.' },
        { q: 'Checkout error?', a: 'Try different payment method or browser. Contact support if persists.' },
      ]
    },
  ];

  const filtered = search.trim() === '' 
    ? faqs 
    : faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
          item.q.toLowerCase().includes(search.toLowerCase()) || 
          item.a.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-teal-600 via-teal-500 to-orange-600 z-50 transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }}></div>

        {/* Animated Background - Light Mode */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none dark:hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Animated Background - Dark Mode */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Header */}
        <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-600 rounded-2xl mb-8 mx-auto shadow-lg">
              <HelpCircle size={40} className="text-white" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Frequently Asked Questions
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Find quick answers to common questions about TourHub.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Search */}
          <div className="mb-12">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border-2 border-gray-300 dark:border-slate-700 p-4 flex items-center gap-3 hover:border-teal-400 dark:hover:border-teal-500 transition-all">
              <Search className="text-teal-600 dark:text-teal-400" size={24} />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
              />
            </div>
            {search && (
              <p className="text-teal-600 dark:text-teal-400 text-sm mt-3 font-medium">
                ✓ Found {filtered.reduce((a, c) => a + c.items.length, 0)} questions matching your search
              </p>
            )}
          </div>

          {/* FAQs */}
          {filtered.length > 0 ? (
            <div className="space-y-8">
              {filtered.map((category, catIdx) => (
                <div key={catIdx} className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <span className="text-4xl">{category.icon}</span>
                    <span>{category.cat}</span>
                  </h2>

                  <div className="space-y-3">
                    {category.items.map((item, idx) => {
                      const key = `${catIdx}-${idx}`;
                      const isOpen = expanded[key];

                      return (
                        <div key={key} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg border-2 border-gray-200 dark:border-slate-600 hover:border-teal-400 dark:hover:border-teal-500 overflow-hidden transition-all">
                          <button
                            onClick={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left group"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white pr-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-lg">{item.q}</h3>
                            <ChevronDown 
                              size={20} 
                              className={`text-teal-600 dark:text-teal-400 flex-shrink-0 transition-transform font-bold ${isOpen ? 'rotate-180' : ''}`} 
                            />
                          </button>

                          {isOpen && (
                            <div className="px-6 py-4 bg-teal-50 dark:bg-teal-950/20 border-t-2 border-gray-200 dark:border-slate-600">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-12 border-2 border-gray-200 dark:border-slate-700 text-center shadow-sm">
              <HelpCircle className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400">Can't find an answer? Contact our support team!</p>
            </div>
          )}

          {/* Still Have Questions */}
          <div className="bg-gradient-to-r from-teal-50 to-teal-50 dark:from-teal-950/30 dark:to-teal-950/30 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-800 shadow-sm hover:shadow-md transition-all mt-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Still have questions?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg">Our support team is here to help 24/7!</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@tourhub.com" 
                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
              >
                <Mail size={20} />
                Email Support
              </a>
              <a 
                href="tel:+15551234567" 
                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
              >
                <Phone size={20} />
                Call Us
              </a>
              <button className="px-6 py-3 rounded-lg font-bold bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 transition-all border-2 border-gray-300 dark:border-slate-600 shadow-md hover:shadow-lg">
                💬 Live Chat 24/7
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage;