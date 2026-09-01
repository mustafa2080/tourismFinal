import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertTriangle, Users, DollarSign, Zap, Clock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const TermsOfServicePage = () => {
  const [activeSection, setActiveSection] = useState('agreement');
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 z-50 transition-all duration-300 shadow-lg shadow-blue-500/50" 
        style={{ width: `${scrollProgress * 100}%` }}
      ></div>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400 to-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent dark:from-slate-800 dark:via-blue-800 dark:to-transparent">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mb-8 mx-auto shadow-2xl shadow-blue-500/40 ring-4 ring-blue-300/30 dark:ring-blue-400/30">
            <Scale size={40} className="text-white" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight drop-shadow-lg">
            Terms of Service
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 dark:text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Please read these terms carefully before using TourHub. Your continued use of our service means you agree to these terms.
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-blue-200 text-sm font-semibold">
            <Clock size={16} />
            <span>Last updated: November 2024</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-500/30 shadow-xl dark:shadow-blue-900/30">
                <p className="text-xs uppercase tracking-widest text-blue-700 dark:text-blue-300 font-bold mb-4">
                  Sections
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'agreement', title: 'Agreement', icon: '📋' },
                    { id: 'services', title: 'Services', icon: '✈️' },
                    { id: 'account', title: 'Account', icon: '👤' },
                    { id: 'prohibited', title: 'Prohibited', icon: '⛔' },
                    { id: 'payments', title: 'Payments', icon: '💳' },
                    { id: 'liability', title: 'Liability', icon: '⚖️' },
                  ].map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-semibold group ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-white'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span>{section.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Agreement to Terms */}
            <section id="agreement" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-400/50 transition-all duration-300 shadow-xl dark:shadow-blue-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <CheckCircle2 size={32} className="text-cyan-500" />
                  Agreement to Terms
                </h2>
                <p className="text-slate-700 dark:text-blue-100 leading-relaxed mb-4 text-lg font-medium">
                  By accessing and using TourHub ("Service", "Platform", "Website"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
                </p>
                <p className="text-slate-600 dark:text-blue-200 leading-relaxed text-lg">
                  We reserve the right to modify these Terms at any time. Your continued use of the Service following any changes constitutes your acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Services */}
            <section id="services" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-400/50 transition-all duration-300 shadow-xl dark:shadow-blue-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Zap size={32} className="text-amber-500" />
                  Description of Services
                </h2>
                <p className="text-slate-700 dark:text-blue-100 leading-relaxed mb-6 text-lg font-medium">
                  TourHub is a platform that connects travelers with tour operators and travel experiences. We facilitate bookings and provide communication tools between users and service providers.
                </p>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-600/50 rounded-xl p-6">
                  <p className="text-amber-900 dark:text-amber-100 font-medium text-lg">
                    <span className="text-2xl mr-2">✈️</span>
                    <strong>Important:</strong> TourHub acts as a marketplace. Tour operators are independent contractors responsible for their services.
                  </p>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section id="account" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-400/50 transition-all duration-300 shadow-xl dark:shadow-blue-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <Users size={32} className="text-emerald-500" />
                  User Accounts & Responsibilities
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-600/50">
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 mb-4">Account Requirements</h3>
                    <ul className="space-y-3">
                      {[
                        'You must be at least 18 years old',
                        'Provide accurate and complete information',
                        'Maintain password confidentiality',
                        'Notify us of unauthorized access immediately',
                        'Accept responsibility for account activities',
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-emerald-800 dark:text-emerald-100 font-medium">
                          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-300 dark:border-red-600/50">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">Account Termination</h3>
                    <p className="text-red-800 dark:text-red-200 mb-4 font-semibold">We may suspend or terminate accounts that:</p>
                    <ul className="space-y-2">
                      {[
                        'Violate these Terms',
                        'Engage in fraudulent activity',
                        'Harass or harm other users',
                        'Violate applicable laws',
                      ].map((reason, idx) => (
                        <li key={idx} className="flex gap-3 text-red-800 dark:text-red-200 font-medium">
                          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Prohibited Conduct */}
            <section id="prohibited" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-300 dark:border-red-600/50 hover:border-red-400 dark:hover:border-red-400/70 transition-all duration-300 shadow-xl dark:shadow-red-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <AlertTriangle size={32} className="text-red-600" />
                  Prohibited Conduct
                </h2>
                
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600/60 rounded-xl p-6 mb-6">
                  <p className="text-red-900 dark:text-red-100 text-lg font-bold">You agree NOT to:</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '⚖️', title: 'Legal Violations', items: ['Use for illegal purposes', 'Violate any laws', 'Engage in fraud'] },
                    { icon: '😤', title: 'Harassment', items: ['Threaten or defame users', 'Post false content', 'Spam or solicit'] },
                    { icon: '🔒', title: 'Security Breaches', items: ['Unauthorized access', 'Interfere with systems', 'Transmit malware'] },
                    { icon: '🤖', title: 'Misuse', items: ['Use bots/scrapers', 'Bypass restrictions', 'Undermine business'] },
                  ].map((category, idx) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-600/50">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h4 className="font-bold text-red-900 dark:text-red-100 mb-3">{category.title}</h4>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li key={i} className="text-sm text-red-800 dark:text-red-200 flex gap-2 font-medium">
                            <span className="text-red-600 dark:text-red-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Bookings & Cancellations */}
            <section className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400/50 transition-all duration-300 shadow-xl dark:shadow-purple-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">📅 Bookings & Cancellations</h2>
                
                <div className="space-y-4">
                  {[
                    { title: 'Making a Booking', desc: 'All bookings subject to availability and operator approval. Becomes final after payment confirmation.' },
                    { title: 'Cancellation Policy', desc: 'Varies by tour operator. Review specific policies before booking. 24-hour cancellations are non-refundable.' },
                    { title: 'Changes to Tours', desc: 'Operators may modify details due to emergencies. Full refund available if changes are unacceptable.' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-600/50">
                      <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">{item.title}</h4>
                      <p className="text-purple-800 dark:text-purple-200 text-sm font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Payments */}
            <section id="payments" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-green-200 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-400/50 transition-all duration-300 shadow-xl dark:shadow-green-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <DollarSign size={32} className="text-green-600" />
                  Payments & Fees
                </h2>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-600/50">
                  <ul className="space-y-3">
                    {[
                      'All prices displayed in selected currency',
                      'Taxes and fees shown before payment',
                      'Payment required to finalize booking',
                      'Major cards, debit cards, and digital wallets accepted',
                      'Payment processed by secure third-party providers',
                      'TourHub processes service fee on each booking',
                      'You responsible for bank and conversion fees',
                      'All sales final except per Refund Policy',
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-green-800 dark:text-green-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Liability */}
            <section id="liability" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-orange-300 dark:border-orange-600/50 hover:border-orange-400 dark:hover:border-orange-400/70 transition-all duration-300 shadow-xl dark:shadow-orange-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">⚖️ Liability & Disclaimers</h2>
                
                <div className="space-y-6">
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl p-6 border-2 border-orange-400 dark:border-orange-600/60">
                    <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4">Disclaimer of Warranties</h3>
                    <p className="text-orange-900 dark:text-orange-100 mb-4 font-bold text-lg">
                      THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND
                    </p>
                    <p className="text-orange-800 dark:text-orange-200 font-medium">
                      We disclaim all warranties, express or implied, including merchantability, fitness for purpose, non-infringement, and accuracy.
                    </p>
                  </div>

                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-6 border-2 border-yellow-400 dark:border-yellow-600/60">
                    <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-4">Limitation of Liability</h3>
                    <p className="text-yellow-900 dark:text-yellow-100 font-bold text-lg mb-3">
                      OUR LIABILITY CAPPED AT AMOUNT PAID IN PRECEDING 12 MONTHS
                    </p>
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      We not liable for indirect, incidental, special, consequential, or punitive damages.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="scroll-mt-20">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-900/40 dark:to-blue-900/40 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-300 dark:border-cyan-600/50 shadow-2xl dark:shadow-cyan-900/30">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📧 Questions?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Legal Email', value: 'legal@tourhub.com' },
                    { label: 'Phone', value: '+1 (555) 123-4567' },
                    { label: 'Support', value: 'support@tourhub.com' },
                    { label: 'Address', value: '123 Tourism Street, Travel City' },
                  ].map((contact, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800/70 rounded-lg p-4 border border-cyan-200 dark:border-cyan-600/30">
                      <p className="text-cyan-700 dark:text-cyan-300 text-sm font-bold mb-1">{contact.label}</p>
                      <p className="text-slate-900 dark:text-white font-semibold">{contact.value}</p>
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

export default TermsOfServicePage;