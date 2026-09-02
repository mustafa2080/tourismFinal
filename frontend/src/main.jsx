import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/translation.css' // Add translation styles
import App from './App.jsx'
import './i18n/i18n.js' // Initialize i18n
import { initializeDynamicTranslations } from './services/translationManager'
import { initializeTranslationSystem, verifyTranslationsLoaded } from './utils/translationFix'

// Suppress Chrome extension messaging errors
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener(() => {
    return false; // Don't hold the port open
  });
}

// Global error handler to suppress known non-critical errors
window.addEventListener('error', (event) => {
  // Suppress the specific message channel error
  if (event.message && event.message.includes('message channel closed')) {
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections for Chrome extension messaging
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'object') {
    const errorMessage = event.reason.message || event.reason.toString();
    if (errorMessage.includes('message channel closed') || 
        errorMessage.includes('Could not establish connection') ||
        errorMessage.includes('Extension context invalidated')) {
      event.preventDefault();
      return false;
    }
  }
});

// Initialize translation services
const initializeTranslationServices = async () => {
  try {
    // Initialize dynamic translations from static JSON files
    initializeDynamicTranslations();
    
    // Initialize translation system with event listeners
    initializeTranslationSystem();
    
    // Verify translations are loaded after longer delay to ensure everything is ready
    setTimeout(() => {
      verifyTranslationsLoaded();
    }, 1500); // Increased delay for translations to fully load
  } catch (error) {
    console.error('❌ Translation services initialization error:', error);
  }
};

// Initialize translation services
initializeTranslationServices();

// Initialize theme from localStorage before rendering
const initializeTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Apply theme
    if (savedTheme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.add('light');
      html.style.colorScheme = 'light';
    }
  } catch (err) {
    document.documentElement.classList.add('light');
  }
};

// Initialize theme immediately
initializeTheme();

// Remove the initial static loader once React has painted the first frame
const hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (!loader) return;

  loader.classList.add('loader-hidden');
  // Remove from DOM after the fade-out transition finishes
  setTimeout(() => {
    loader.remove();
  }, 450);
};

createRoot(document.getElementById('root')).render(
  <App />
)

// Wait for two animation frames so the browser has actually painted
// the mounted app before we fade the loader out (avoids a blank flash).
requestAnimationFrame(() => {
  requestAnimationFrame(hideInitialLoader);
});
