const CACHE_NAME = 'chatapp-cache-v1';

// List all files you want to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/profile.html',
  '/home.html',
  '/chat.html',
  '/style.css',       // If you have a separate CSS file
  '/app.js',          // If you have a separate JS file
  '/logo.png',        // App logo
  // Add any other images or assets your app uses
];

// Install event: cache all required assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches if needed
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: serve cached content if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached file if available, else fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Optional: fallback to index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
