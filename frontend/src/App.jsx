import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import GlobalTranslationSync from './components/GlobalTranslationSync.jsx';
import TranslationSyncWrapper from './components/TranslationSyncWrapper.jsx';
import { socketService } from './services/socketService';
import { getSocketUrl } from './config/env.js';
import { patchSocketIO } from './utils/socketErrorFix.js';
import { seoService } from './services/seoService.js';
import { initializeCSRFToken } from './services/apiClient.js';
import AppRoutes from './AppRoutes';
import ChatBot from './components/ChatBot';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Suppress Chrome extension errors globally
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  // Handle unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && 
        event.reason.includes('message channel closed')) {
      // Suppress the error from Chrome extensions
      event.preventDefault();
      console.debug('⚠️ Suppressed: message channel closed from Chrome extension');
    }
  }, { once: false });

  // Handle errors from extensions
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('message channel closed')) {
      // Suppress the error
      event.preventDefault();
      console.debug('⚠️ Suppressed: message channel closed error');
    }
  }, { once: false });
}

// Initialize Socket.IO (only once)
const initializeSocket = () => {
  if (socketService.isConnected()) {
    console.log('✅ Socket.IO already initialized');
    return;
  }

  // The backend puts ALL realtime events (notifications, booking updates,
  // wishlist sync) on the dedicated Socket.IO `/notifications` namespace
  // (backend/src/websocket/socket.ts). Connecting to the bare origin only
  // joins the default `/` namespace, which the server never emits to - so
  // appending the namespace here is required for any realtime event to
  // actually reach the client.
  const socketUrl = `${getSocketUrl()}/notifications`;
  try {
    const socket = socketService.init(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      upgrade: false
    });
    
    // Patch socket to prevent message channel closed errors
    if (socket) {
      patchSocketIO(socket);
    }
    
    console.log('✅ Socket.IO initialized successfully');
  } catch (err) {
    console.warn('⚠️ Socket.IO initialization warning:', err);
  }
};

// Initialize SEO on app startup
const initializeSEO = () => {
  // Set default SEO meta tags
  seoService.updatePageMeta({
    title: 'Travel Packages & Tours | Book Your Next Adventure',
    description: 'Discover amazing travel packages and tours worldwide. Book your dream vacation with our curated travel experiences.',
    keywords: 'travel packages, tours, vacation booking, adventure travel, travel deals',
    url: window.location.href
  });

  // Set language from browser
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  seoService.setLanguage(browserLang.split('-')[0]);

  console.log('✅ SEO initialized successfully');
};

function App() {
  useEffect(() => {
    initializeSocket();
    initializeSEO();
    // 🔐 Initialize CSRF token on app load
    initializeCSRFToken();
  }, []);

  return (
    <LanguageProvider>
      <GlobalTranslationSync />
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <TranslationSyncWrapper>
                  <AppRoutes />
                  <ChatBot />
                  <Toaster 
                    position="top-right"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        style: {
                          background: '#10b981',
                        },
                      },
                      error: {
                        style: {
                          background: '#ef4444',
                        },
                      },
                    }}
                  />
                </TranslationSyncWrapper>
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
