import React, { useState, useEffect } from 'react';
import { TrendingUp, Mail, Phone, Download, Share2, ArrowRight, Newspaper } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const PressPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const pressReleases = [
    { id: 1, cat: 'funding', date: 'Nov 2024', title: 'TourHub Raises $25M Series B', excerpt: 'Sequoia Capital backs expansion.' },
    { id: 2, cat: 'partnership', date: 'Oct 2024', title: 'Global Tourism Board Partnership', excerpt: 'Supporting sustainable tourism.' },
    { id: 3, cat: 'product', date: 'Sep 2024', title: 'AI-Powered Recommendations', excerpt: '40% increase in satisfaction.' },
    { id: 4, cat: 'award', date: 'Aug 2024', title: 'Best Travel Tech Startup 2024', excerpt: 'Innovation recognized.' },
    { id: 5, cat: 'expansion', date: 'Jul 2024', title: '50 New Asia Pacific Destinations', excerpt: 'Global growth continues.' },
    { id: 6, cat: 'corporate', date: 'Jun 2024', title: 'Net-Zero Carbon by 2025', excerpt: 'Sustainability commitment.' },
  ];

  const filtered = selectedCategory === 'all' ? pressReleases : pressReleases.filter(r => r.cat === selectedCategory);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 z-50 transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }}></div>

      {/* Animated Background */}
      <div className="hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-8 mx-auto shadow-2xl">
            <TrendingUp size={40} className="text-white" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Press & Media
          </h1>

          <p className="text-lg sm:text-xl text-blue-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            News, press releases, and media resources from TourHub.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { num: '6+', label: 'Press Releases' },
            { num: '100+', label: 'Media Outlets' },
            { num: '4', label: 'Media Kits' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-blue-600 mb-2">{s.num}</div>
              <p className="text-gray-700 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Latest News */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Latest News</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'funding', 'product', 'partnership', 'award', 'expansion', 'corporate'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((release) => (
              <div key={release.id} className="bg-gray-50 rounded-lg p-6 border border-gray-300 hover:border-blue-400 transition-all cursor-pointer hover:shadow-md">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mr-2 mb-2">{release.cat}</span>
                    <span className="text-sm text-gray-600">{release.date}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{release.title}</h3>
                <p className="text-gray-700 mb-4">{release.excerpt}</p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    Read More <ArrowRight size={16} />
                  </button>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kits */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Download Media Kit</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Brand Guidelines', desc: 'Logo, colors, typography', size: '15 MB' },
              { title: 'Executive Brief', desc: 'Company overview & leadership', size: '8 MB' },
              { title: 'Product Screenshots', desc: 'High-res platform images', size: '120 MB' },
              { title: 'Founder Bios', desc: 'Leadership team info', size: '45 MB' },
            ].map((kit, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-300 hover:border-blue-400 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{kit.title}</h3>
                    <p className="text-sm text-gray-600">{kit.desc}</p>
                  </div>
                  <Download className="text-blue-600" size={24} />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                  <span className="text-xs text-gray-600">{kit.size}</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">By The Numbers</h2>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: '2M+', label: 'Active Users' },
              { num: '500+', label: 'Destinations' },
              { num: '1000+', label: 'Tour Operators' },
              { num: '$50M+', label: 'Booking Volume' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-300 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.num}</div>
                <p className="text-gray-700 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured In */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Featured In</h2>

          <div className="flex flex-wrap gap-3">
            {['TechCrunch', 'Forbes', 'Wired', 'The Verge', 'Fast Company', 'Travel Weekly', 'Entrepreneur', 'NYT'].map((outlet, i) => (
              <div key={i} className="bg-blue-50 border border-blue-300 rounded-lg px-4 py-3 text-blue-700 font-medium text-sm">
                {outlet}
              </div>
            ))}
          </div>
        </div>

        {/* About Leadership */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Leadership</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Alex Johnson', title: 'CEO & Co-Founder', bio: '15+ years travel tech experience' },
              { name: 'Maya Patel', title: 'CTO & Co-Founder', bio: 'Expert in scalable platforms' },
              { name: 'Chris Martinez', title: 'COO & Co-Founder', bio: 'Sustainable tourism focused' },
            ].map((founder, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-300 text-center">
                <div className="text-4xl mb-3">👤</div>
                <h3 className="font-bold text-gray-900 mb-1">{founder.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-2">{founder.title}</p>
                <p className="text-xs text-gray-700">{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Press Inquiries */}
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-300 shadow-md mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Press Inquiries</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Sarah Chen', title: 'Director of Communications', email: 'sarah@tourhub.com', phone: '+1 (555) 123-4567' },
              { name: 'James Wilson', title: 'PR Manager', email: 'james@tourhub.com', phone: '+1 (555) 234-5678' },
            ].map((contact, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-1">{contact.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{contact.title}</p>
                <div className="space-y-2">
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-gray-700 text-sm hover:text-blue-600">
                    <Mail size={16} /> {contact.email}
                  </a>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-gray-700 text-sm hover:text-blue-600">
                    <Phone size={16} /> {contact.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-300 shadow-md mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">📧 Stay Updated</h2>
          <p className="text-gray-700 mb-6">Subscribe to our press releases and company updates.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex gap-2">
            <input type="email" placeholder="your.email@example.com" required className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Subscribe
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">FAQs</h2>

          <div className="space-y-4">
            {[
              { q: 'Can I use TourHub images and logos?', a: 'Yes, for editorial purposes. Please credit TourHub and use official logos.' },
              { q: 'How do I request an interview?', a: 'Contact press@tourhub.com with your publication and topic.' },
              { q: 'Can you provide statistics?', a: 'Yes! Contact our press team for verified data.' },
              { q: 'What is TourHub mission?', a: 'Making authentic travel experiences accessible while supporting sustainable tourism.' },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-700 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
};

export default PressPage;