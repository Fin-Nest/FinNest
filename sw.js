// sw.js (Optimierte Version mit Stale-While-Revalidate für Auto-Updates)
const CACHE_NAME = 'finnest-v6'; // WICHTIG: Bei jedem Code-Release hier auf v7, v8 etc. erhöhen!

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'lib/tailwind.min.js',
  'lib/chart.min.js',
  'lib/chartjs-plugin-datalabels.min.js',
  'lib/lucide.min.js',
  'lib/crypto-js.min.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

// 1. INSTALLATION: Dateien einzeln cachen und sofort aktivieren
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Einzelne Datei konnte nicht gecacht werden: ${asset}`, err);
        }
      }
    })
  );
  // Zwingt den neuen Service Worker, sofort aktiv zu werden
  self.skipWaiting();
});

// 2. AKTIVIERUNG: Alte Caches löschen und Kontrolle übernehmen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`[SW] Lösche alten Cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Übernimmt sofort die Steuerung aller geöffneten Tabs/PWA-Instanzen
  self.clients.claim();
});

// 3. FETCH: Stale-While-Revalidate (Schnelles Laden aus Cache + Stille Aktualisierung)
self.addEventListener('fetch', (event) => {
  // Nur Standard-HTTP(S) Anfragen verarbeiten
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Parallel im Hintergrund die neueste Version vom Server abrufen
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          /* Offline-Fall: Netzwerkanfrage schlägt fehl, Cache-Wert wird weiter genutzt */
        });

      // Gibt sofort die gecachte Version zurück (falls vorhanden), ansonsten wartet es auf das Netzwerk
      return cachedResponse || fetchPromise;
    })
  );
});
