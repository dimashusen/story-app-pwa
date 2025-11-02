// File: src/scripts/sw.js

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Diterima.');
  const notificationData = event.data.json();
  const title = notificationData.title || 'Notifikasi Baru';
  
  const options = {
    body: notificationData.body || 'Ada pesan baru untuk Anda.',
    // Pastikan Anda punya ikon ini di folder public/images/icons/
    icon: '/images/icons/icon-192x192.png', 
    badge: '/images/icons/icon-192x192.png',
    
    // (Skilled) Menyesuaikan isi notifikasi secara dinamis
    data: {
      url: notificationData.url || '/#',
    },
    
    // (Advanced) Menambahkan action button
    actions: [
      { action: 'explore-action', title: 'Lihat' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // (Advanced) Navigasi saat notifikasi atau action di-klik
  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});