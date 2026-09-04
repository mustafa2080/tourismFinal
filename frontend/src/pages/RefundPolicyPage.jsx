import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, HelpCircle, CheckCircle2, Calendar, DollarSign, Clock, ChevronDown } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const RefundPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqItems = [
    { q: 'Can I reschedule instead of refunding?', a: 'Yes! Many operators allow rescheduling without losing money. Contact support to arrange.' },
    { q: 'What if I have a family emergency?', a: 'Contact support with documentation. We handle emergencies case-by-case.' },
    { q: 'Can I get a refund if I change my mind?', a: 'Yes, within the refund window based on your tour policy.' },
    { q: 'How do I check my tour\'s policy?', a: 'Log in, go to My Bookings, click your tour. Policy clearly displayed.' },
    { q: 'What if refund doesn\'t appear?', a: 'Check after 10-17 days. If not there, contact support with booking number.' },
    { q: 'Are group bookings different?', a: 'Yes. Contact support for group cancellations.' },
    { q: 'Can I get refund if I get sick?', a: 'Yes, with medical documentation. Processing based on timeline and policy.' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Progress Bar */}
        <div 
          className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 z-50 transition-all duration-300" 
          style={{ width: `${scrollProgress * 100}%` }}
        ></div>

        {/* Animated Background - Light Mode */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none dark:hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Animated Background - Dark Mode */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Header */}
        <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-8 mx-auto shadow-lg">
              <RotateCcw size={40} className="text-white" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Refund Policy
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our commitment to your satisfaction. Clear, transparent refund guidelines you can trust.
            </p>

            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
              <Clock size={16} />
              <span>Last updated: November 2024</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-bold mb-4">
                    Sections
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'overview', icon: '📋', label: 'Overview' },
                      { id: 'windows', icon: '📅', label: 'Refund Windows' },
                      { id: 'process', icon: '⚙️', label: 'Process' },
                      { id: 'timeline', icon: '⏱️', label: 'Timeline' },
                      { id: 'exceptions', icon: '⚠️', label: 'Exceptions' },
                      { id: 'faq', icon: '❓', label: 'FAQ' },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-4 space-y-8">
              {/* Overview */}
              <section id="overview" className="scroll-mt-20">
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
                    Refund Policy Overview
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    At TourHub, we want you to have complete peace of mind when booking. This policy outlines our refund guidelines and your rights as a customer.
                  </p>
                  
                  <div className="bg-teal-50 dark:bg-teal-950/30 border-2 border-teal-200 dark:border-teal-800 rounded-xl p-6">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      <span className="text-2xl mr-2">ℹ️</span>
                      <strong>Important:</strong> Different tours have different policies. Review the specific policy before booking.
                    </p>
                  </div>
                </div>
              </section>

              {/* Refund Windows */}
              <section id="windows" className="scroll-mt-20">
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <Calendar size={32} className="text-green-600 dark:text-green-500" />
                    Refund Windows
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Full Refund */}
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-6 border-2 border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">100%</h3>
                        <span className="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-bold">BEST</span>
                      </div>
                      <p className="text-green-700 dark:text-green-300 font-semibold mb-4">30+ days before</p>
                      <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm font-medium">
                        <li className="flex gap-2">✓ Full tour refund</li>
                        <li className="flex gap-2">⏱ 5-10 business days</li>
                        <li className="flex gap-2">📧 Fee may not refund</li>
                      </ul>
                    </div>

                    {/* Partial Refund */}
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">50%</h3>
                        <span className="bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-bold">PARTIAL</span>
                      </div>
                      <p className="text-yellow-700 dark:text-yellow-300 font-semibold mb-4">15-29 days before</p>
                      <ul className="space-y-2 text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                        <li className="flex gap-2">≈ Half refund</li>
                        <li className="flex gap-2">⏱ 5-10 business days</li>
                        <li className="flex gap-2">✗ Fees non-refundable</li>
                      </ul>
                    </div>

                    {/* Non-Refundable */}
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">0%</h3>
                        <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-xs font-bold">LIMITED</span>
                      </div>
                      <p className="text-red-700 dark:text-red-300 font-semibold mb-4">Less than 15 days</p>
                      <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm font-medium">
                        <li className="flex gap-2">✗ No refund</li>
                        <li className="flex gap-2">📆 Reschedule if able</li>
                        <li className="flex gap-2">✗ Fees retained</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Refund Process */}
              <section id="process" className="scroll-mt-20">
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">How to Request a Refund</h2>
                  
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Log into Your Account', desc: 'Access TourHub and go to My Bookings' },
                      { step: 2, title: 'Select the Tour', desc: 'Find the booking you want to cancel' },
                      { step: 3, title: 'Click Cancel', desc: 'Select "Cancel Booking" and confirm' },
                      { step: 4, title: 'Provide Reason', desc: 'Tell us why (optional, helps us improve)' },
                      { step: 5, title: 'Get Confirmation', desc: 'Receive email with refund details' },
                      { step: 6, title: 'Receive Refund', desc: 'Credited to original payment method' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500 transition-all">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600">
                            <span className="text-green-700 dark:text-green-400 font-bold">{item.step}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Timeline */}
              <section id="timeline" className="scroll-mt-20">
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <Clock size={32} className="text-green-600 dark:text-green-500" />
                    Processing Timeline
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Cancellation Request', time: 'Immediate', icon: '⚡' },
                      { label: 'Refund Calculation', time: '5-7 business days', icon: '🧮' },
                      { label: 'Payment Processing', time: '5-10 business days', icon: '💳' },
                      { label: 'Total Timeline', time: '10-17 business days', icon: '📊', highlight: true },
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          item.highlight
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-700'
                            : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-semibold">{item.label}</p>
                          {item.highlight ? (
                            <p className="text-green-700 dark:text-green-400 font-bold text-lg">{item.time}</p>
                          ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{item.time}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mt-6">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                      <strong>💡 Note:</strong> Card refunds vary by bank. International refunds take longer.
                    </p>
                  </div>
                </div>
              </section>

              {/* Special Circumstances */}
              <section id="exceptions" className="scroll-mt-20">
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <AlertTriangle size={32} className="text-orange-600 dark:text-orange-500" />
                    Special Circumstances
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { title: '🚫 Tour Cancelled by Operator', desc: '100% refund + fees refunded + option to reschedule' },
                      { title: '🔄 Tour Modified', desc: 'Accept changes or get 100% refund if unacceptable' },
                      { title: '⛈️ Force Majeure', desc: 'Weather/disasters: reschedule or partial refund per policy' },
                      { title: '❌ Service Issues', desc: 'Report during/after tour - may qualify for partial refund' },
                      { title: '🚫 No-Show', desc: 'Missing start time = forfeiture, no refund, possible fees' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border-2 border-gray-200 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500 transition-all">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-20">
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <HelpCircle size={32} className="text-green-600 dark:text-green-500" />
                    FAQs
                  </h2>
                  
                  <div className="space-y-3">
                    {faqItems.map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-gray-50 dark:bg-slate-700/50 rounded-lg border-2 border-gray-200 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500 overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white pr-4">{item.q}</h4>
                          <ChevronDown 
                            size={20} 
                            className={`text-green-600 dark:text-green-500 flex-shrink-0 transition-transform font-bold ${expandedFaq === idx ? 'rotate-180' : ''}`} 
                          />
                        </button>
                        {expandedFaq === idx && (
                          <div className="px-6 py-4 bg-teal-50 dark:bg-teal-950/20 border-t-2 border-gray-200 dark:border-slate-600">
                            <p className="text-gray-700 dark:text-gray-300">{item.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="scroll-mt-20">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">📧 Need Help?</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Refunds Email', value: 'refunds@tourhub.com' },
                      { label: 'Phone', value: '+1 (555) 123-4567' },
                      { label: 'Live Chat', value: '24/7 on website' },
                      { label: 'Address', value: '123 Tourism Street, Travel City' },
                    ].map((contact, idx) => (
                      <div key={idx}>
                        <p className="text-green-700 dark:text-green-400 text-sm font-bold mb-1">{contact.label}</p>
                        <p className="text-gray-900 dark:text-white font-medium">{contact.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RefundPolicyPage;