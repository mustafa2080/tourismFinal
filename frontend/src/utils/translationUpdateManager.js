/**
 * Translation Update Manager
 * تحديث فوري وآمن لجميع الترجمات على مستوى التطبيق
 * 
 * ✓ بدون infinite loops
 * ✓ بدون memory leaks
 * ✓ بدون circular dependencies
 */

class TranslationUpdateManager {
  constructor() {
    this.listeners = new Set(); // استخدم Set بدلاً من Array
    this.currentLanguage = 'en';
    this.isUpdating = false;
    this.updateTimeout = null;
  }

  /**
   * تسجيل listener لتحديثات الترجمة
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      console.warn('Listener must be a function');
      return () => {};
    }

    this.listeners.add(listener);

    // إرجاع unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * إرسال تحديث ترجمة فوري للمستمعين (بدون infinite loop)
   */
  notifyUpdate(language) {
    if (this.currentLanguage === language) {
      return; // لا تُرسل update إذا كانت اللغة نفسها
    }

    this.currentLanguage = language;
    this.isUpdating = true;

    // إرسال تنبيهات لجميع المستمعين
    this.listeners.forEach(listener => {
      try {
        listener(language);
      } catch (error) {
        console.error('Error in translation listener:', error);
      }
    });

    // تنظيف timeout السابق
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // إعادة تعيين flag بعد انتظار قصير
    this.updateTimeout = setTimeout(() => {
      this.isUpdating = false;
    }, 100);
  }

  /**
   * إجبار re-render المكونات (محسّن بدون infinite loops)
   */
  forceGlobalUpdate(language) {
    // تجنب الحالات المكررة
    if (this.isUpdating || this.currentLanguage === language) {
      return;
    }

    // تطبيق تأثير بسيط
    const html = document.documentElement;
    html.style.opacity = '0.8';
    html.style.transition = 'opacity 0.1s ease';

    // إطلاق التحديث
    this.notifyUpdate(language);

    // استرجاع الرؤية
    setTimeout(() => {
      html.style.opacity = '1';
      setTimeout(() => {
        html.style.transition = 'none';
      }, 100);
    }, 100);
  }

  /**
   * الحصول على اللغة الحالية
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * التحقق من حالة التحديث
   */
  isUpdatingNow() {
    return this.isUpdating;
  }

  /**
   * عدد المستمعين (للـ debugging)
   */
  getListenerCount() {
    return this.listeners.size;
  }

  /**
   * مسح جميع المستمعين
   */
  clear() {
    this.listeners.clear();
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  /**
   * تنظيف عند الإغلاق
   */
  destroy() {
    this.clear();
    this.listeners = null;
  }
}

// إنشاء instance واحد (Singleton)
export const translationUpdateManager = new TranslationUpdateManager();

/**
 * Utility function لإجبار تحديث الترجمة
 */
export const forceTranslationUpdate = (language) => {
  translationUpdateManager.forceGlobalUpdate(language);
};

/**
 * Subscribe to translation updates
 */
export const subscribeToTranslationUpdates = (callback) => {
  return translationUpdateManager.subscribe(callback);
};

/**
 * Get current language from manager
 */
export const getCurrentLanguageFromManager = () => {
  return translationUpdateManager.getLanguage();
};

/**
 * Check if translation is updating
 */
export const isTranslationUpdating = () => {
  return translationUpdateManager.isUpdatingNow();
};

/**
 * Clear all listeners (لاستخدام في tests)
 */
export const clearTranslationManager = () => {
  translationUpdateManager.clear();
};

export default translationUpdateManager;
