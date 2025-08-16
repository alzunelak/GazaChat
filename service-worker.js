const CACHE_NAME = 'chat-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/profile.html',
  '/name.html',
  '/home.html',
  '/scan.html',
  '/search.html',
  '/settings.html',
  '/block.html',
  '/style.css',
  '/js/home.js',
  '/js/qrious.min.js',
  '/default-profile.png',
  '/offline.html'
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
