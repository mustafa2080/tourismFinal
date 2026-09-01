import { createContext, useState, useCallback, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'light'
    try {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme || defaultTheme;
    } catch (err) {
      return defaultTheme;
    }
  });
  const [loading, setLoading] = useState(false);
  const [themeApplied, setThemeApplied] = useState(false);

  /**
   * Apply theme to document - simple function
   */
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('dark', 'light');
    
    // Add the appropriate class
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('🌙 Dark mode applied');
    } else {
      root.classList.add('light');
      root.style.colorScheme = 'light';
      document.documentElement.setAttribute('data-theme', 'light');
      console.log('☀️ Light mode applied');
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (err) {
      console.warn('Failed to save theme:', err);
    }
  }, []);

  /**
   * Apply theme on mount - only once
   */
  useEffect(() => {
    if (!themeApplied) {
      applyTheme(theme);
      setThemeApplied(true);
      console.log('ThemeContext initialized with theme:', theme);
    }
  }, []); // Empty dependency array - apply only once on mount

  /**
   * Apply theme when it changes
   */
  useEffect(() => {
    if (themeApplied) {
      applyTheme(theme);
    }
  }, [theme, applyTheme, themeApplied]);

  /**
   * Toggle theme
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🎨 Toggling theme to:', newTheme);
    setTheme(newTheme);
  };

  /**
   * Set specific theme
   */
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  /**
   * Get computed CSS variables
   */
  const getColors = useCallback(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    return {
      primary: computedStyle.getPropertyValue('--color-primary').trim(),
      secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
      success: computedStyle.getPropertyValue('--color-success').trim(),
      danger: computedStyle.getPropertyValue('--color-danger').trim(),
      warning: computedStyle.getPropertyValue('--color-warning').trim(),
      background: computedStyle.getPropertyValue('--color-background').trim(),
      text: computedStyle.getPropertyValue('--color-text').trim(),
      border: computedStyle.getPropertyValue('--color-border').trim()
    };
  }, []);

  /**
   * Get theme object
   */
  const getThemeObject = useCallback(() => {
    return {
      mode: theme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      colors: getColors()
    };
  }, [theme, getColors]);

  const value = {
    // State
    theme,
    loading,
    isDark: theme === 'dark',
    isLight: theme === 'light',

    // Methods
    toggleTheme,
    setTheme: setSpecificTheme,
    getColors,
    getThemeObject
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
