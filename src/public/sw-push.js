// File: src/public/sw-push.js
self.addEventListener('push', (event) => {
  const notificationData = event.data.json();
  const title = notificationData.title || 'Notifikasi Baru';
  const options = {
    body: notificationData.body || 'Ada pesan baru.',
    icon: '/images/icons/icon-192x192.png',
    actions: [
      { action: 'open-link', title: 'Buka' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/#'));
});