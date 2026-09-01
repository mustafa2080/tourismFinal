import { useState } from 'react';
import { useEffect } from 'react';
import { useInstantTranslation } from '../hooks/useInstantTranslation';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck, FiAlertCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ContactPage = () => {
  const { t, i18n } = useInstantTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const contactInfo = [
    {
      icon: FiPhone,
      title: t('contactPage.phone'),
      value: t('contactPage.phoneNumber'),
      link: 'tel:+201000000000',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiMail,
      title: t('contactPage.email'),
      value: t('contactPage.supportEmail'),
      link: 'mailto:support@voyagertours.com',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiMapPin,
      title: t('contactPage.location'),
      value: t('contactPage.cairo'),
      link: null,
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: FiClock,
      title: t('contactPage.available'),
      value: t('contactPage.24Hours'),
      link: null,
      color: 'from-green-500 to-green-600',
    },
  ];

  const faqItems = [
    {
      question: t('contactPage.refundQuestion'),
      answer: t('contactPage.refundAnswer'),
    },
    {
      question: t('contactPage.modifyQuestion'),
      answer: t('contactPage.modifyAnswer'),
    },
    {
      question: t('contactPage.insuranceQuestion'),
      answer: t('contactPage.insuranceAnswer'),
    },
    {
      question: t('contactPage.groupQuestion'),
      answer: t('contactPage.groupAnswer'),
    },
    {
      question: t('contactPage.paymentQuestion'),
      answer: t('contactPage.paymentAnswer'),
    },
    {
      question: t('contactPage.bookingQuestion'),
      answer: t('contactPage.bookingAnswer'),
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/contact`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      if (response.status === 201) {
        setSubmitStatus('success');
        toast.success(t('contactPage.messageSent') || 'Message sent successfully! We will contact you soon.');

        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });

        setTimeout(() => setSubmitStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            {t('contactPage.heroTitle')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Voyager Tours</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('contactPage.heroDescription')}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
                >
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {info.title}
                  </h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      {info.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Form & Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Form */}
            <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                {t('contactPage.sendMessage')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('contactPage.yourName')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t('contactPage.nameField')}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('contactPage.yourEmail')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t('contactPage.emailField')}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('contactPage.phoneNumberLabel')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('contactPage.phoneField')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('contactPage.subject')} *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">{t('contactPage.selectSubject')}</option>
                    <option value="booking">{t('contactPage.bookingInquiry')}</option>
                    <option value="complaint">{t('contactPage.complaint')}</option>
                    <option value="suggestion">{t('contactPage.suggestion')}</option>
                    <option value="partnership">{t('contactPage.partnership')}</option>
                    <option value="other">{t('contactPage.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('contactPage.message')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder={t('contactPage.messageField')}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <FiCheck size={20} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300">{t('contactPage.messageSent')}</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <FiAlertCircle size={20} className="text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-300">{t('contactPage.messageFailed')}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <>
                      <FiSend size={20} className="group-hover:translate-x-1 transition-transform" />
                      <span>{t('contactPage.sendButton')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Side Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Business Hours */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('contactPage.businessHours')}</h3>
                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>{t('contactPage.mondayFriday')}:</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contactPage.saturday')}:</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contactPage.sunday')}:</span>
                    <span className="font-semibold">{t('contactPage.closed')}</span>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-green-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('contactPage.responseTime')}</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  We usually respond to inquiries within:
                </p>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    <span>{t('contactPage.duringBusiness')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    <span>{t('contactPage.outsideHours')}</span>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-purple-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('contactPage.newsletter')}</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                  {t('contactPage.newsletterDesc')}
                </p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all">
                  {t('contactPage.subscribeNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            {t('contactPage.faq')}
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <span>{item.question}</span>
                  <span className="text-blue-600 dark:text-blue-400">+</span>
                </summary>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('contactPage.stillHaveQuestions')}</h2>
          <p className="text-lg text-blue-100 mb-8">
            {t('contactPage.stillHaveQuestionsDesc')}
          </p>
          <a
            href="mailto:support@voyagertours.com"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
          >
            <FiMail size={20} />
            {t('contactPage.emailSupport')}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
