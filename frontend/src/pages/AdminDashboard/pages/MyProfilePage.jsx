import { useState, useEffect, useRef } from 'react';
import { FiEdit, FiSave, FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth, useTranslation } from '../../../hooks';
import { adminService } from '../../../services/adminService';
import { uploadService } from '../../../services';
import { validateImageFile, formatFileSize } from '../../../utils/imageCompression';


export function MyProfilePage() {
  const { user, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  

  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'admin',
    joinDate: user?.createdAt || new Date().toISOString(),
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [originalData, setOriginalData] = useState(profileData);

  // Set avatar preview from user data
  useEffect(() => {
    if (user?.profileImage) {
      const imageUrl = `data:${user.profileImageMimeType || 'image/jpeg'};base64,${user.profileImage}`;
      setAvatarPreview(imageUrl);
    } else if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.profileImage, user?.avatar, user?.profileImageMimeType]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // تحديث بيانات المستخدم
      const response = await adminService.updateUserProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      });

      if (response.success || response.data) {
        // تحديث AuthContext
        if (updateProfile) {
          await updateProfile({
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
          });
        }
        
        toast.success(t('dashboard.profile.saving'));
        setOriginalData(profileData);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('messages.failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setEditing(false);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsUploadingAvatar(true);

      const compressed = await uploadService.uploadProfileImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.75,
      });

      const previewUrl = `data:${compressed.mimeType};base64,${compressed.base64}`;
      setAvatarPreview(previewUrl);

      // تحديث الملف الشخصي مباشرة
      const response = await adminService.updateUserProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        profileImage: compressed.base64,
        profileImageMimeType: compressed.mimeType,
      });

      if (response.success || response.data) {
        // تحديث AuthContext
        if (updateProfile) {
          await updateProfile({
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
            profileImage: compressed.base64,
            profileImageMimeType: compressed.mimeType,
          });
        }
        
        toast.success(`Profile picture updated! (${formatFileSize(compressed.size)})`);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error(t('messages.failedToUploadAvatar'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {t('myProfilePage.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            {t('myProfilePage.subtitle')}
          </p>
        </div>
        <button
          onClick={editing ? handleCancel : handleEditClick}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
            editing
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {editing ? (
            <>
              <FiX size={20} />
              {t('dashboard.profile.cancel')}
            </>
          ) : (
            <>
              <FiEdit size={20} />
              {t('dashboard.profile.edit')}
            </>
          )}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-6 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileData.name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || 'A'
                )}
              </div>
              <button
                onClick={() => document.getElementById('avatar-input')?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                {isUploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiCamera size={16} />
                )}
              </button>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {profileData.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-lg">
                {profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1).toLowerCase()}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 flex items-center justify-center md:justify-start gap-2">
                <FiCalendar size={14} />
                {t('dashboard.profile.memberSince')} {new Date(profileData.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                {t('dashboard.profile.fullName')}
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {profileData.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
                <FiMail className="text-blue-600" size={16} />
                {t('dashboard.profile.emailAddress')}
              </label>
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                {profileData.email}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                <FiShield size={12} />
                {t('dashboard.profile.emailImmutable')}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
                <FiPhone className="text-green-600" size={16} />
                {t('dashboard.profile.phoneNumber')}
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('dashboard.profile.phonePlaceholder')}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {profileData.phone || t('dashboard.profile.notProvided') || 'Not provided'}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
                <FiShield className="text-purple-600" size={16} />
                {t('dashboard.profile.role')}
              </label>
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white capitalize">
                {profileData.role}
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
                <FiMapPin className="text-red-600" size={16} />
                {t('myProfilePage.address')}
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('myProfilePage.enterYourAddress')}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {profileData.address || t('myProfilePage.notProvided')}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg"
              >
                <FiSave size={22} />
                {loading ? t('dashboard.profile.saving') : t('dashboard.profile.saveChanges')}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold"
              >
                <FiX size={22} />
                {t('dashboard.profile.cancel')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 px-6 md:px-8 py-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.profile.accountStatus')}</h3>
        </div>
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t('dashboard.profile.memberSince')}</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {new Date(profileData.joinDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t('dashboard.profile.accountStatus')}</span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
              {t('dashboard.profile.active')}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t('dashboard.profile.role')}</span>
            <span className="text-slate-900 dark:text-white font-semibold capitalize">
              {profileData.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
