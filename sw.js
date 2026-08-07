const CACHE_NAME = 'finnest-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './lib/tailwind.min.js',
  './lib/chart.min.js',
  './lib/chartjs-plugin-datalabels.min.js',
  './lib/lucide.min.js',
  './lib/crypto-js.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Installation: Dateien in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches löschen (z. B. v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Anfragen zuerst aus dem Cache bedienen (Offline-First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
