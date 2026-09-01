/**
 * Service Worker for Offline Support and Caching
 * Improves performance and enables offline functionality
 */

const CACHE_NAME = 'tour-app-v1';
const ASSETS_CACHE = 'tour-assets-v1';
const API_CACHE = 'tour-api-v1';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== ASSETS_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets - cache first, then network
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, ASSETS_CACHE));
    return;
  }

  // Default - cache first, then network
  event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
});

/**
 * Cache-first strategy (good for assets)
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    });
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-first strategy (good for API requests)
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[ServiceWorker] Network failed, using cache:', error);

    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'You are offline. Please check your connection.',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/i.test(pathname);
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(event.data.cacheName).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data.type === 'GET_CACHE_STATS') {
    caches.keys().then((names) => {
      const stats = {
        caches: names,
        timestamp: Date.now(),
      };
      event.ports[0].postMessage(stats);
    });
  }
});

console.log('[ServiceWorker] Loaded');
