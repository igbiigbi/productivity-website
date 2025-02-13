const CACHE_NAME = 'productivity-timer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/scripts/app.js',
  '/manifest.json',
  '/sounds/bell.mp3',
  '/sounds/digital.mp3',
  '/sounds/chime.mp3',
  '/sounds/soft.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});