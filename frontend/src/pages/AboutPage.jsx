import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useInstantTranslation } from '../hooks/useInstantTranslation';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FiArrowRight, FiCheck, FiTrendingUp, FiUsers, FiGlobe, FiTarget } from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';

const AboutPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useInstantTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const stats = [
    { label: t('aboutPage.happyTravelers'), value: '50K+' },
    { label: t('aboutPage.destinations'), value: '150+' },
    { label: t('aboutPage.toursCompleted'), value: '30K+' },
    { label: t('aboutPage.partners'), value: '500+' },
  ];

  const values = [
    {
      icon: FiGlobe,
      title: t('aboutPage.globalReach'),
      description: t('aboutPage.globalReachDesc'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiUsers,
      title: t('aboutPage.customerFirst'),
      description: t('aboutPage.customerFirstDesc'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiTarget,
      title: t('aboutPage.qualityTours'),
      description: t('aboutPage.qualityToursDesc'),
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: FiTrendingUp,
      title: t('aboutPage.bestPrices'),
      description: t('aboutPage.bestPricesDesc'),
      color: 'from-green-500 to-green-600',
    },
  ];

  const team = [
    { name: 'Ahmed Hassan', role: 'Founder & CEO', image: '👨‍💼' },
    { name: 'Fatima Mohamed', role: 'Head of Operations', image: '👩‍💼' },
    { name: 'Karim Mostafa', role: 'Tour Director', image: '👨‍💼' },
    { name: 'Layla Mahmoud', role: 'Customer Support Lead', image: '👩‍💼' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12 md:pt-24 pb-12 sm:pb-16 md:pb-32 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {t('aboutPage.heroTitle')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Voyager Tours</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('aboutPage.heroDescription')}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:scale-105"
              >
                <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {t('aboutPage.ourStory')}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {t('aboutPage.storyDescription')}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {t('aboutPage.storyDescription2')}
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg group"
              >
                {t('aboutPage.getInTouch')}
                <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              <div className="w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl p-8 text-center text-white">
                <BiWorld size={100} className="mx-auto mb-4 opacity-80" />
                <h3 className="text-3xl font-bold mb-2">Travel the World</h3>
                <p className="text-blue-100">With Confidence & Comfort</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            {t('aboutPage.ourCoreValues')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            {t('aboutPage.meetOurTeam')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="text-6xl mb-4 flex justify-center">{member.image}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                {t('aboutPage.whyChooseUs')}
              </h2>

              <ul className="space-y-4">
                {[
                  t('aboutPage.expertlyCurated'),
                  t('aboutPage.support24'),
                  t('aboutPage.transparentPricing'),
                  t('aboutPage.flexibleBooking'),
                  t('aboutPage.guaranteedSafety'),
                  t('aboutPage.authenticExperiences'),
                  t('aboutPage.sustainableTourism'),
                  t('aboutPage.moneyBackGuarantee'),
                ].map((reason, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck size={16} className="text-white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-blue-500 dark:from-green-700 dark:to-blue-700 rounded-2xl p-8 text-white">
              <div className="space-y-6">
                <div>
                  <p className="text-5xl font-bold mb-2">98%</p>
                  <p className="text-green-100">{t('aboutPage.customerSatisfaction')}</p>
                </div>
                <div className="border-t border-white/30 pt-6">
                  <p className="text-4xl font-bold mb-2">4.9/5</p>
                  <p className="text-green-100">{t('aboutPage.averageRating')} 5000+ {t('aboutPage.reviews')}</p>
                </div>
                <div className="border-t border-white/30 pt-6">
                  <p className="text-4xl font-bold mb-2">24/7</p>
                  <p className="text-green-100">{t('aboutPage.alwaysHere')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('aboutPage.readyToStart')}
          </h2>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            {t('aboutPage.readyToStartDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              {t('aboutPage.exploreTours')}
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              {t('aboutPage.contactUs')}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
