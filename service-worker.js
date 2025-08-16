// Save user profile
localStorage.setItem('username', 'John Doe');
localStorage.setItem('profilePic', 'data:image/png;base64,...');

// Save friends list
const friends = [{ name: 'Alice', profile: 'data:image/png;base64,...' }];
localStorage.setItem('friends', JSON.stringify(friends));


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('Service Worker registration failed', err));
}


const CACHE_NAME = 'chat-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/profile.html',
  '/home.html',
  '/style.css',
  '/script.js',
  '/default-profile.png',
  // Add other assets as needed
];

// Install the service worker and cache necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached files when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
        .then(response => {
          return response || caches.match('/offline.html');
        });
    })
  );
});
