import { useState, useEffect, useMemo } from 'react';
import { 
  FiSave, FiX, FiCheck, FiAlertCircle, FiRefreshCw, FiGlobe, 
  FiMail, FiPhone, FiInfo, FiServer, FiLock, FiSend, 
  FiClock, FiDollarSign, FiShield, FiDatabase, FiSettings
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';

export function SettingsPage() {
  const { getAvailableLanguages } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [fillingTranslations, setFillingTranslations] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: '',
    siteEmail: '',
    sitPhone: '',
    siteDescription: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    emailFromName: '',
    emailFromAddress: '',
    bookingConfirmationEmail: true,
    bookingReminderDays: 3,
    maxRefundDays: 14,
    minBookingNotice: 24,
    maintenanceMode: false,
    debugMode: false,
    loggingEnabled: true,
    backupEnabled: true,
    backupFrequency: 'daily',
  });

  const [originalSettings, setOriginalSettings] = useState(settings);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setInitialLoading(true);
        const response = await adminService.getAllSettings();
        
        // response is already {success: true, data: {...}}
        if (response && response.data && typeof response.data === 'object') {
          const apiSettings = response.data;
          const mappedSettings = {
            siteName: apiSettings['site.name']?.value || 'Tour Booking System',
            siteEmail: apiSettings['site.email']?.value || '',
            sitPhone: apiSettings['site.phone']?.value || '',
            siteDescription: apiSettings['site.description']?.value || '',
            smtpHost: apiSettings['email.smtp_host']?.value || '',
            smtpPort: parseInt(apiSettings['email.smtp_port']?.value || '587'),
            smtpUser: apiSettings['email.smtp_user']?.value || '',
            smtpPassword: apiSettings['email.smtp_password']?.value || '',
            emailFromName: apiSettings['email.from_name']?.value || '',
            emailFromAddress: apiSettings['email.from_address']?.value || '',
            bookingConfirmationEmail: apiSettings['booking.confirmation_email']?.value === 'true',
            bookingReminderDays: parseInt(apiSettings['booking.reminder_days']?.value || '3'),
            maxRefundDays: parseInt(apiSettings['booking.max_refund_days']?.value || '14'),
            minBookingNotice: parseInt(apiSettings['booking.min_notice_hours']?.value || '24'),
            maintenanceMode: apiSettings['system.maintenance_mode']?.value === 'true',
            debugMode: apiSettings['system.debug_mode']?.value === 'true',
            loggingEnabled: apiSettings['system.logging_enabled']?.value === 'true',
            backupEnabled: apiSettings['system.backup_enabled']?.value === 'true',
            backupFrequency: apiSettings['system.backup_frequency']?.value || 'daily',
          };
          
          setSettings(mappedSettings);
          setOriginalSettings(mappedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings. Using defaults.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const updates = [
        { key: 'site.name', value: settings.siteName, type: 'string' },
        { key: 'site.email', value: settings.siteEmail, type: 'string' },
        { key: 'site.phone', value: settings.sitPhone, type: 'string' },
        { key: 'site.description', value: settings.siteDescription, type: 'string' },
        { key: 'email.smtp_host', value: settings.smtpHost, type: 'string' },
        { key: 'email.smtp_port', value: settings.smtpPort.toString(), type: 'string' },
        { key: 'email.smtp_user', value: settings.smtpUser, type: 'string' },
        { key: 'email.smtp_password', value: settings.smtpPassword, type: 'string' },
        { key: 'email.from_name', value: settings.emailFromName, type: 'string' },
        { key: 'email.from_address', value: settings.emailFromAddress, type: 'string' },
        { key: 'booking.confirmation_email', value: settings.bookingConfirmationEmail ? 'true' : 'false', type: 'string' },
        { key: 'booking.reminder_days', value: settings.bookingReminderDays.toString(), type: 'string' },
        { key: 'booking.max_refund_days', value: settings.maxRefundDays.toString(), type: 'string' },
        { key: 'booking.min_notice_hours', value: settings.minBookingNotice.toString(), type: 'string' },
        { key: 'system.maintenance_mode', value: settings.maintenanceMode ? 'true' : 'false', type: 'string' },
        { key: 'system.debug_mode', value: settings.debugMode ? 'true' : 'false', type: 'string' },
        { key: 'system.logging_enabled', value: settings.loggingEnabled ? 'true' : 'false', type: 'string' },
        { key: 'system.backup_enabled', value: settings.backupEnabled ? 'true' : 'false', type: 'string' },
        { key: 'system.backup_frequency', value: settings.backupFrequency, type: 'string' },
      ];
      
      await adminService.updateMultipleSettings(updates);
      toast.success('Settings saved successfully!');
      setOriginalSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      setSettings(originalSettings);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      const response = await adminService.testEmailConfig();
      if (response.success) {
        toast.success('Email sent successfully!');
      } else {
        toast.error(`Test failed: ${response.message}`);
      }
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleFillItineraryTranslations = async () => {
    try {
      setFillingTranslations(true);
      const response = await fetch('/api/admin/itineraries/fill-translations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`✅ Updated ${data.count} itineraries with missing translations`);
      } else {
        toast.error(data.message || 'Failed to fill translations');
      }
    } catch (error) {
      console.error('Error filling translations:', error);
      toast.error('Failed to fill itinerary translations');
    } finally {
      setFillingTranslations(false);
    }
  };

  const handleRefresh = async () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Reload anyway?')) return;
    const loadSettings = async () => {
      try {
        setInitialLoading(true);
        const response = await adminService.getAllSettings();
        if (response && response.data && typeof response.data === 'object') {
          const apiSettings = response.data;
          const mappedSettings = {
            siteName: apiSettings['site.name']?.value || 'Tour Booking System',
            siteEmail: apiSettings['site.email']?.value || '',
            sitPhone: apiSettings['site.phone']?.value || '',
            siteDescription: apiSettings['site.description']?.value || '',
            smtpHost: apiSettings['email.smtp_host']?.value || '',
            smtpPort: parseInt(apiSettings['email.smtp_port']?.value || '587'),
            smtpUser: apiSettings['email.smtp_user']?.value || '',
            smtpPassword: apiSettings['email.smtp_password']?.value || '',
            emailFromName: apiSettings['email.from_name']?.value || '',
            emailFromAddress: apiSettings['email.from_address']?.value || '',
            bookingConfirmationEmail: apiSettings['booking.confirmation_email']?.value === 'true',
            bookingReminderDays: parseInt(apiSettings['booking.reminder_days']?.value || '3'),
            maxRefundDays: parseInt(apiSettings['booking.max_refund_days']?.value || '14'),
            minBookingNotice: parseInt(apiSettings['booking.min_notice_hours']?.value || '24'),
            maintenanceMode: apiSettings['system.maintenance_mode']?.value === 'true',
            debugMode: apiSettings['system.debug_mode']?.value === 'true',
            loggingEnabled: apiSettings['system.logging_enabled']?.value === 'true',
            backupEnabled: apiSettings['system.backup_enabled']?.value === 'true',
            backupFrequency: apiSettings['system.backup_frequency']?.value || 'daily',
          };
          setSettings(mappedSettings);
          setOriginalSettings(mappedSettings);
          toast.success('Settings reloaded');
        }
      } catch (error) {
        toast.error('Failed to reload settings');
      } finally {
        setInitialLoading(false);
      }
    };
    loadSettings();
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <FiSettings className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              System Settings
              {hasChanges && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <FiAlertCircle size={16} />
                  Unsaved Changes
                </span>
              )}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-lg">
              Configure your platform behavior and preferences
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold shadow-md"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <FiGlobe className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiInfo className="text-blue-600" size={16} />
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                placeholder="e.g. Luxor Tours"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiMail className="text-green-600" size={16} />
                Admin Email
              </label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => handleSettingChange('siteEmail', e.target.value)}
                placeholder="admin@luxortours.com"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiPhone className="text-purple-600" size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.sitPhone}
                onChange={(e) => handleSettingChange('sitPhone', e.target.value)}
                placeholder="+20 100 123 4567"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiInfo className="text-orange-600" size={16} />
                Site Description
              </label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                placeholder="Best tours in Luxor and Egypt"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiMail className="text-purple-600 dark:text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Email Configuration</h2>
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testingEmail}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all text-sm font-semibold shadow-md"
          >
            <FiSend size={16} />
            {testingEmail ? 'Testing...' : 'Test Email'}
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiServer className="text-indigo-600" size={16} />
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiLock className="text-red-600" size={16} />
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value) || 587)}
                placeholder="587"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiMail className="text-green-600" size={16} />
                SMTP User
              </label>
              <input
                type="email"
                value={settings.smtpUser}
                onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiLock className="text-red-600" size={16} />
                SMTP Password
              </label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiInfo className="text-blue-600" size={16} />
                From Name
              </label>
              <input
                type="text"
                value={settings.emailFromName}
                onChange={(e) => handleSettingChange('emailFromName', e.target.value)}
                placeholder="Luxor Tours"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiMail className="text-green-600" size={16} />
                From Address
              </label>
              <input
                type="email"
                value={settings.emailFromAddress}
                onChange={(e) => handleSettingChange('emailFromAddress', e.target.value)}
                placeholder="no-reply@luxortours.com"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <FiDollarSign className="text-green-600 dark:text-green-400" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                checked={settings.bookingConfirmationEmail}
                onChange={(e) => handleSettingChange('bookingConfirmationEmail', e.target.checked)}
                className="w-5 h-5 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Send Confirmation Email</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Automatically email users upon booking</p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiClock className="text-orange-600" size={16} />
                Reminder Days Before Trip
              </label>
              <input
                type="number"
                value={settings.bookingReminderDays}
                onChange={(e) => handleSettingChange('bookingReminderDays', parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiShield className="text-red-600" size={16} />
                Max Refund Days
              </label>
              <input
                type="number"
                value={settings.maxRefundDays}
                onChange={(e) => handleSettingChange('maxRefundDays', parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiClock className="text-purple-600" size={16} />
                Min Booking Notice (Hours)
              </label>
              <input
                type="number"
                value={settings.minBookingNotice}
                onChange={(e) => handleSettingChange('minBookingNotice', parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <FiDatabase className="text-orange-600 dark:text-orange-400" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="w-5 h-5 rounded border-slate-400 text-orange-600 focus:ring-orange-500"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Maintenance Mode</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">Temporarily disable public access</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                className="w-5 h-5 rounded border-slate-400 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Debug Mode</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">Show detailed error logs</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.loggingEnabled}
                onChange={(e) => handleSettingChange('loggingEnabled', e.target.checked)}
                className="w-5 h-5 rounded border-slate-400 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Enable Logging</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">Record system activities</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backupEnabled}
                onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
                className="w-5 h-5 rounded border-slate-400 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Auto Backup</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">Schedule database backups</p>
              </div>
            </label>
          </div>

          {settings.backupEnabled && (
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-2">
                <FiClock className="text-green-600" size={16} />
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Languages Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <FiGlobe className="text-purple-600 dark:text-purple-400" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Supported Languages</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your platform supports the following languages. Users can switch between them seamlessly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {getAvailableLanguages().map((lang) => (
              <div key={lang.code} className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-2">{lang.flag}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{lang.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{lang.nativeName}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">{lang.code}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold">💡 Tip:</span> All content including package titles, descriptions, and add-ons are automatically translated based on the user's selected language. Translations are managed through the language system.
            </p>
          </div>
        </div>
      </div>

      {/* Translation Data Management */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <FiDatabase className="text-indigo-600 dark:text-indigo-400" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Translation Data Management</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Ensure all itinerary days have proper translations in all supported languages.
          </p>
          <button
            onClick={handleFillItineraryTranslations}
            disabled={fillingTranslations}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <FiRefreshCw size={18} className={fillingTranslations ? 'animate-spin' : ''} />
            {fillingTranslations ? 'Filling Translations...' : 'Fill Missing Itinerary Translations'}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            This will fill any missing translation fields for itinerary days with fallback values.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={!hasChanges || loading}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FiSave size={22} />
          {loading ? 'Saving Changes...' : 'Save All Settings'}
        </button>

        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
        >
          <FiX size={22} />
          Discard Changes
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;