import React, { useState, useEffect } from 'react';
import { Lock, Eye, Shield, FileText, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('intro');
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

  const sections = [
    { id: 'intro', title: 'Introduction', icon: FileText },
    { id: 'collection', title: 'Data Collection', icon: Eye },
    { id: 'usage', title: 'Data Usage', icon: Shield },
    { id: 'protection', title: 'Protection', icon: Lock },
    { id: 'rights', title: 'Your Rights', icon: CheckCircle2 },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50 to-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-orange-900 dark:to-slate-900">
        {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-teal-500 via-orange-600 to-pink-600 z-50 transition-all duration-300 shadow-lg shadow-orange-500/50" 
        style={{ width: `${scrollProgress * 100}%` }}
      ></div>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-gradient-to-br from-teal-400 to-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400 to-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-500 via-orange-400 to-transparent dark:from-slate-800 dark:via-orange-800 dark:to-transparent">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-orange-600 rounded-2xl mb-8 mx-auto shadow-2xl shadow-orange-500/40 ring-4 ring-orange-300/30 dark:ring-orange-400/30">
            <Lock size={40} className="text-white" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight drop-shadow-lg">
            Privacy Policy
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 dark:text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Your privacy is our priority. We're transparent about how we collect, use, and protect your data.
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-orange-200 text-sm font-semibold">
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
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border-2 border-orange-200 dark:border-orange-500/30 shadow-xl dark:shadow-orange-900/30">
                <p className="text-xs uppercase tracking-widest text-orange-700 dark:text-orange-300 font-bold mb-4">
                  Quick Links
                </p>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-semibold group ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                            : 'text-slate-700 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-800 dark:hover:text-white'
                        }`}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        <span>{section.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Introduction */}
            <section id="intro" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-500/30 hover:border-teal-400 dark:hover:border-teal-400/50 transition-all duration-300 shadow-xl dark:shadow-teal-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <FileText size={32} className="text-teal-600" />
                  Introduction
                </h2>
                <p className="text-slate-700 dark:text-orange-100 leading-relaxed mb-4 text-lg font-medium">
                  At TourHub, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
                <p className="text-slate-600 dark:text-orange-200 leading-relaxed text-lg">
                  Please read this privacy policy carefully. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </div>
            </section>

            {/* Data Collection */}
            <section id="collection" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-500/30 hover:border-teal-400 dark:hover:border-teal-400/50 transition-all duration-300 shadow-xl dark:shadow-teal-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <Eye size={32} className="text-teal-600" />
                  Information We Collect
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6 border-2 border-teal-300 dark:border-teal-600/50">
                    <h3 className="text-xl font-bold text-teal-900 dark:text-teal-100 mb-4">📝 Information You Provide</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-teal-800 dark:text-teal-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Account Information:</strong> Name, email, phone number, password</span>
                      </li>
                      <li className="flex gap-3 text-teal-800 dark:text-teal-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Profile Information:</strong> Photo, bio, preferences, travel history</span>
                      </li>
                      <li className="flex gap-3 text-teal-800 dark:text-teal-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Payment Information:</strong> Credit/debit card details (processed by secure providers)</span>
                      </li>
                      <li className="flex gap-3 text-teal-800 dark:text-teal-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Booking Details:</strong> Travel dates, destinations, number of travelers</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border-2 border-orange-300 dark:border-orange-600/50">
                    <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4">⚙️ Information Collected Automatically</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-orange-800 dark:text-orange-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Device Information:</strong> Browser type, IP address, device type</span>
                      </li>
                      <li className="flex gap-3 text-orange-800 dark:text-orange-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Usage Data:</strong> Pages visited, time spent, clicks, scrolling behavior</span>
                      </li>
                      <li className="flex gap-3 text-orange-800 dark:text-orange-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span><strong>Location Data:</strong> Approximate location based on IP address (with consent)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="usage" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400/50 transition-all duration-300 shadow-xl dark:shadow-emerald-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <Shield size={32} className="text-emerald-600" />
                  How We Use Your Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '🚀', title: 'Service Delivery', desc: 'Processing bookings and providing customer support' },
                    { icon: '✨', title: 'Personalization', desc: 'Tailoring recommendations for you' },
                    { icon: '📢', title: 'Marketing', desc: 'Sending offers and newsletters' },
                    { icon: '📊', title: 'Analytics', desc: 'Improving our services' },
                    { icon: '🔒', title: 'Security', desc: 'Detecting fraud and ensuring safety' },
                    { icon: '⚖️', title: 'Compliance', desc: 'Meeting legal obligations' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-600/50 hover:border-emerald-400 dark:hover:border-emerald-400/70 transition-all duration-300 hover:shadow-lg dark:hover:shadow-emerald-500/10">
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-2">{item.title}</h3>
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section id="protection" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-500/30 hover:border-pink-400 dark:hover:border-pink-400/50 transition-all duration-300 shadow-xl dark:shadow-pink-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <Lock size={32} className="text-pink-600" />
                  Data Protection & Security
                </h2>
                
                <p className="text-slate-700 dark:text-pink-100 mb-6 text-lg font-medium">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6 border-2 border-pink-300 dark:border-pink-600/50 mb-6">
                  <ul className="space-y-3">
                    {[
                      'SSL/TLS encryption for all data transmission',
                      'Secure password hashing and storage',
                      'Regular security audits and penetration testing',
                      'Limited access to personal data (need-to-know basis)',
                      'Multi-factor authentication options',
                      'Compliance with GDPR, CCPA, and international standards',
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-pink-800 dark:text-pink-100 font-medium">
                        <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600/60 rounded-xl p-6">
                  <p className="text-orange-900 dark:text-orange-100 font-medium">
                    <strong>⚠️ Note:</strong> While we strive to protect your information, no system is 100% secure. We cannot guarantee absolute security of data transmitted over the internet.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section id="rights" className="scroll-mt-20">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-500/30 hover:border-teal-400 dark:hover:border-teal-400/50 transition-all duration-300 shadow-xl dark:shadow-teal-900/30">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <CheckCircle2 size={32} className="text-teal-600" />
                  Your Privacy Rights
                </h2>
                
                <p className="text-slate-700 dark:text-teal-100 mb-8 text-lg font-medium">
                  Depending on your location, you have the following rights:
                </p>
                
                <div className="space-y-3">
                  {[
                    { title: 'Right to Access', desc: 'Request a copy of your personal data' },
                    { title: 'Right to Rectification', desc: 'Correct inaccurate information' },
                    { title: 'Right to Erasure', desc: 'Request deletion of your data' },
                    { title: 'Right to Data Portability', desc: 'Receive your data in a portable format' },
                    { title: 'Right to Opt-Out', desc: 'Unsubscribe from marketing communications' },
                    { title: 'Right to Lodge a Complaint', desc: 'Contact your local data protection authority' },
                  ].map((right, idx) => (
                    <div key={idx} className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border-2 border-teal-300 dark:border-teal-600/50 hover:border-teal-400 dark:hover:border-teal-400/70 transition-all duration-300">
                      <h3 className="font-bold text-teal-900 dark:text-teal-100 mb-2">{right.title}</h3>
                      <p className="text-teal-800 dark:text-teal-200 font-medium">{right.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="scroll-mt-20">
              <div className="bg-gradient-to-r from-teal-400 to-orange-500 dark:from-teal-900/40 dark:to-orange-900/40 backdrop-blur-xl rounded-2xl p-8 border-2 border-teal-300 dark:border-teal-600/50 shadow-2xl dark:shadow-teal-900/30">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">📧 Contact Us</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Email', value: 'privacy@tourhub.com' },
                    { label: 'Phone', value: '+1 (555) 123-4567' },
                    { label: 'DPO', value: 'dpo@tourhub.com' },
                    { label: 'Address', value: '123 Tourism Street, Travel City' },
                  ].map((contact, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800/70 rounded-lg p-4 border border-teal-200 dark:border-teal-600/30">
                      <p className="text-teal-700 dark:text-teal-300 text-sm font-bold mb-1">{contact.label}</p>
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

export default PrivacyPolicyPage;