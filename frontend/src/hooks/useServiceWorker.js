import { useEffect } from 'react';

/**
 * Hook to register and manage Service Worker
 */
export const useServiceWorker = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Workers are not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          {
            scope: '/',
          }
        );

        console.log('✅ Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Every minute

        // Listen for new service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              console.log('🔄 New service worker ready');
              notifyUpdate();
            }
          });
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Handle messages from service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from SW:', event.data);
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    unregister: async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      registrations.forEach((reg) => reg.unregister());
    },
    clearCache: async (cacheName) => {
      const controller = navigator.serviceWorker.controller;
      if (controller) {
        controller.postMessage({
          type: 'CLEAR_CACHE',
          cacheName,
        });
      }
    },
  };
};

/**
 * Notify user about updates
 */
function notifyUpdate() {
  if (Notification.permission === 'granted') {
    new Notification('Update Available', {
      body: 'A new version is available. Refresh the page to update.',
      icon: '/favicon.ico',
    });
  }
}

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    return;
  }

  if (Notification.permission !== 'denied') {
    await Notification.requestPermission();
  }
};
