// File: src/scripts/sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// 1. Workbox akan menyuntikkan daftar cache (precache) di sini
precacheAndRoute(self.__WB_MANIFEST);

// 2. Strategi Caching untuk App Shell (Kriteria 3)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages' })
);

// 3. Strategi Caching untuk API (Kriteria 3)
registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);

// 4. Strategi Caching untuk Gambar (Kriteria 3)
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({ cacheName: 'image-cache' })
);

// --- INI UNTUK PUSH NOTIFICATION (Kriteria 2) ---

// 5. Listener untuk Push Notification
self.addEventListener('push', (event) => {
  const notificationData = event.data.json();
  const title = notificationData.title || 'Notifikasi Baru';
  const options = {
    body: notificationData.body || 'Ada pesan baru untuk Anda.',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-192x192.png',
    data: {
      url: notificationData.url || '/#',
    },
    actions: [
      { action: 'open-link', title: 'Buka' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 6. Listener untuk Aksi Klik Notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});