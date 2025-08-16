const CACHE_NAME = 'chat-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/profile.html',
  '/name.html',
  '/home.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/default-profile.png',
  // Add any other assets you need
];

// Install service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker immediately
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch files: return cached if offline, or offline page if request fails
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request)
        .then(cachedResponse => cachedResponse || caches.match('/offline.html'))
      )
  );
});
