import React, { useState, useEffect } from 'react';
import { Briefcase, Heart, Users, TrendingUp, Star, Send, MapPin, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [hoveredBenefit, setHoveredBenefit] = useState(null);

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

  const jobOpenings = [
    { id: 1, title: 'Senior Frontend Developer', dept: '💻 Engineering', loc: 'Remote', salary: '$120k - $160k', exp: '5+ years' },
    { id: 2, title: 'Product Manager', dept: '📊 Product', loc: 'San Francisco', salary: '$130k - $170k', exp: '3+ years' },
    { id: 3, title: 'Customer Success Manager', dept: '🎯 Support', loc: 'Multiple', salary: '$60k - $85k', exp: '2+ years' },
    { id: 4, title: 'Content Marketing Specialist', dept: '📝 Marketing', loc: 'Remote', salary: '$70k - $95k', exp: '2+ years' },
    { id: 5, title: 'DevOps Engineer', dept: '☁️ Infrastructure', loc: 'Remote', salary: '$110k - $150k', exp: '3+ years' },
    { id: 6, title: 'UX/UI Designer', dept: '🎨 Design', loc: 'Remote', salary: '$80k - $120k', exp: '3+ years' },
  ];

  const values = [
    { icon: '✈️', title: 'Passion for Travel', desc: 'Travel transforms lives and enriches people globally.' },
    { icon: '🌍', title: 'Diversity & Inclusion', desc: 'We celebrate diverse backgrounds and perspectives.' },
    { icon: '📚', title: 'Continuous Learning', desc: 'We grow together through mentorship and challenges.' },
    { icon: '⭐', title: 'Excellence', desc: 'We pursue quality and integrity in everything.' },
  ];

  const benefits = [
    { icon: '💰', label: 'Competitive Salary' },
    { icon: '📈', label: 'Equity Options' },
    { icon: '🏥', label: 'Health Insurance' },
    { icon: '🌴', label: 'Unlimited PTO' },
    { icon: '💻', label: 'Remote Options' },
    { icon: '🎓', label: 'Dev Budget' },
    { icon: '✈️', label: 'Free Travel' },
    { icon: '🌟', label: 'Great Culture' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-teal-600 via-orange-600 to-pink-600 z-50 transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }}></div>

        {/* Animated Background - Light Mode */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none dark:hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Animated Background - Dark Mode */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden dark:block">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Header */}
        <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-orange-600 rounded-2xl mb-8 mx-auto shadow-lg">
              <Briefcase size={40} className="text-white" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Join Our Team
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Help us transform travel experiences worldwide. We're hiring passionate people to build amazing products.
            </p>

            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
              <Clock size={16} />
              <span>Actively hiring across all departments</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* About */}
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About TourHub</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
              TourHub is a fast-growing travel tech company transforming how people discover and book experiences. We connect millions of travelers with unique adventures worldwide.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              We're looking for talented, passionate people who want to make an impact. Join our diverse team of engineers, designers, marketers, and operators building the future of travel.
            </p>
          </div>

          {/* Values */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-all hover:shadow-md group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{v.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{v.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Why Join TourHub?</h2>
            <div className="grid md:grid-cols-4 gap-5">
              {benefits.map((b, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-slate-800/50 rounded-lg p-6 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-all hover:shadow-md text-center cursor-pointer group"
                  onMouseEnter={() => setHoveredBenefit(i)}
                  onMouseLeave={() => setHoveredBenefit(null)}
                >
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">{b.icon}</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Open Positions</h2>
            <div className="grid gap-4">
              {jobOpenings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border-2 border-gray-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-all cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{job.title}</h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">{job.dept}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full flex items-center gap-1"><MapPin size={14} /> {job.loc}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full flex items-center gap-1"><Clock size={14} /> {job.exp}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-2">{job.salary}</p>
                      <span className={`inline-block text-gray-600 dark:text-gray-400 transition-transform ${selectedJob?.id === job.id ? 'rotate-180' : ''}`}>
                        <ArrowRight size={20} className="rotate-90" />
                      </span>
                    </div>
                  </div>

                  {selectedJob?.id === job.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-gray-700 dark:text-gray-300 mb-5">
                        Click "Apply Now" below to submit your application for this position. We review applications within 5-7 business days.
                      </p>
                      <button
                        className="bg-gradient-to-r from-teal-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2"
                        onClick={() => document.querySelector('.application-form')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        <Send size={18} />
                        Apply Now
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          {selectedJob && (
            <div className="application-form bg-white dark:bg-slate-800/50 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-800 shadow-md mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Apply for</h2>
              <p className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-8">{selectedJob.title}</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                alert('Application submitted! We\'ll review and get back to you within 5 business days.');
                setFormData({ name: '', email: '', message: '' });
              }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Portfolio / LinkedIn / GitHub (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tell us about yourself *</label>
                  <textarea
                    placeholder="Share your experience, skills, and why you're interested in joining TourHub..."
                    rows="6"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none transition-all"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-orange-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                  <Send size={18} className="inline mr-2" />
                  Submit Application
                </button>
              </form>
            </div>
          )}

          {/* Hiring Process */}
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Hiring Process</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { num: 1, title: 'Application', desc: '5-7 days review' },
                { num: 2, title: 'Initial Call', desc: '30 min chat' },
                { num: 3, title: 'Assessment', desc: 'Technical test' },
                { num: 4, title: 'Team Interview', desc: 'Meet the team' },
                { num: 5, title: 'Offer', desc: 'Welcome aboard!' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900/30 border-2 border-teal-500 rounded-full mb-3">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Internships */}
          <div className="bg-gradient-to-r from-teal-50 to-orange-50 dark:from-teal-950/30 dark:to-orange-950/30 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-800 shadow-sm hover:shadow-md transition-all mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🎓 Internships & University Programs</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              We offer paid internships for students interested in tech, design, or business. Real-world experience, mentorship, and potential full-time opportunities.
            </p>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              📧 <strong className="text-gray-900 dark:text-white">Interested?</strong> Email careers@tourhub.com with your resume, transcript, and a note about why you want to join TourHub.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-teal-50 to-orange-50 dark:from-teal-950/30 dark:to-orange-950/30 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-800 shadow-sm hover:shadow-md transition-all">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">📧 Questions?</h2>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Email:</strong> careers@tourhub.com</p>
              <p className="text-gray-700 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">Phone:</strong> +1 (555) 123-4567</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Check our blog and social media for team stories!</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CareersPage;