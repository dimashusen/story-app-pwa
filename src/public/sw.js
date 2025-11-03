const STATIC_CACHE_NAME = 'citycare-static-v1';
const DYNAMIC_CACHE_NAME = 'citycare-dynamic-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/favicon.png',
  '/icon-192x192.png',
  '/leaflet.css',
  '/leaflet.js'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstal...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Menambahkan App Shell ke cache statis...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Service Worker: Gagal meng-cache App Shell.', error);
        console.error('Pastikan semua path di urlsToCache sudah benar!');
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Mengaktifkan...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (networkResponse) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
        ).catch(() => {
          if (event.request.mode === 'navigate') {
            console.log('Service Worker: Menyajikan halaman offline sebagai fallback.');
            return caches.match('/offline.html');
          }
          return new Response(null, { status: 404 });
        });
      })
  );
});