import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FiCompass, FiMapPin, FiCalendar, FiUsers, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

/**
 * Custom Trip — "Build Your Own Trip" landing page.
 * Full step-by-step builder is coming next; this page introduces the
 * feature and captures early interest so the route is live end-to-end.
 */
const CustomTripPage = () => {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);

  const steps = [
    { icon: FiMapPin, title: 'Pick a destination', desc: 'Choose where you want to go' },
    { icon: FiCalendar, title: 'Set your dates', desc: 'Tell us when and for how long' },
    { icon: FiUsers, title: 'Choose your experiences', desc: 'Pick activities, hotels, and more' },
    { icon: FiCheckCircle, title: 'Get your price', desc: 'See a live total as you build' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Header />

      <section className="relative pt-16 md:pt-24 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
            <FiCompass size={16} />
            New Feature
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Build Your Own{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Custom Trip
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
            Design a trip that's entirely yours — pick your destination, dates, and experiences,
            and get a tailored quote from our travel experts.
          </p>

          {!notified ? (
            <button
              onClick={() => setNotified(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Notify Me When It's Ready
              <FiArrowRight size={18} />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <FiCheckCircle size={18} />
              We'll let you know as soon as it launches!
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            How it will work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                    STEP {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            In the meantime, explore our ready-made packages
          </h2>
          <p className="text-blue-100 mb-8">
            Browse our curated tours while the custom trip builder is being finished.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
          >
            Explore Packages
            <FiArrowRight size={18} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomTripPage;
