import { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useInstantTranslateWithLibre } from '../../hooks/useLibreTranslate';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import './LanguageSwitcher.css';

export const LanguageSwitcher = ({ variant = 'default' }) => {
  const { currentLanguage, changeLanguage, getAvailableLanguages, isChangingLanguage } = useLanguage();
  const { isTranslating: isLibreTranslating } = useInstantTranslateWithLibre();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get available languages
  const languages = getAvailableLanguages();
  const currentLang = languages.find(l => l.code === currentLanguage);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  /**
   * Change language with immediate effect
   */
  const handleLanguageChange = useCallback(async (languageCode) => {
    // Prevent multiple simultaneous calls
    if (languageCode === currentLanguage || isTransitioning) {
      console.log(`ℹ️ [LanguageSwitcher] Language change skipped (already transitioning or same language)`);
      return;
    }

    setIsTransitioning(true);
    console.log(`🌍 [LanguageSwitcher] Changing language to: ${languageCode}`);

    try {
      // Call changeLanguage from context
      await changeLanguage(languageCode);
      
      console.log(`✅ [LanguageSwitcher] Language changed successfully to: ${languageCode}`);
      
      // Smooth transition effect
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('❌ [LanguageSwitcher] Error changing language:', error);
    } finally {
      setIsTransitioning(false);
      setIsOpen(false);
    }
  }, [currentLanguage, changeLanguage, isTransitioning]);

  return (
    <div 
      className={`language-switcher-wrapper language-switcher-${variant}`} 
      ref={dropdownRef}
      role="region"
      aria-label="Language selector"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChangingLanguage || isTransitioning || isLibreTranslating}
        className={`language-switcher-btn ${isOpen ? 'active' : ''} ${isChangingLanguage || isTransitioning || isLibreTranslating ? 'loading' : ''}`}
        title="Change Language"
        aria-label="Change Language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="btn-content">
          <Globe 
            size={18} 
            className="globe-icon"
            aria-hidden="true"
          />
          <span className="lang-code">{currentLang?.code.toUpperCase()}</span>
          {isLibreTranslating && (
            <Sparkles 
              size={14} 
              className="sparkles-icon animate-spin"
              aria-hidden="true"
              title="Translation in progress"
            />
          )}
          <ChevronDown 
            size={16} 
            className={`chevron-icon ${isOpen ? 'open' : ''}`}
            aria-hidden="true"
          />
        </div>

        {(isChangingLanguage || isTransitioning || isLibreTranslating) && (
          <span className="loader" aria-label="Changing language" />
        )}
      </button>

      {isOpen && (
        <div 
          className="language-dropdown"
          role="listbox"
          aria-label="Available languages"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
              disabled={isChangingLanguage || isTransitioning || isLibreTranslating}
              role="option"
              aria-selected={currentLanguage === lang.code}
              tabIndex={currentLanguage === lang.code ? 0 : -1}
            >
              <span className="lang-flag" aria-hidden="true">{lang.flag}</span>
              
              <div className="lang-info">
                <span className="lang-name">{lang.name}</span>
                <span className="lang-native">{lang.nativeName}</span>
              </div>

              {currentLanguage === lang.code && (
                <div className="check-wrapper" aria-hidden="true">
                  <Check size={16} className="check-icon" />
                </div>
              )}

              <div className="option-bg" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
