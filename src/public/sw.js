const STATIC_CACHE_NAME = 'citycare-static-v1';
const DYNAMIC_CACHE_NAME = 'citycare-dynamic-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstal...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Menambahkan App Shell ke cache statis...');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Gagal meng-cache App Shell.', error);
        console.error('Pastikan semua path di urlsToCache sudah benar!');
      })
  );
  // Jangan skip waiting otomatis, biarkan user refresh manual
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
    })
    // Jangan gunakan self.clients.claim() karena bisa menyebabkan reload
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
            console.log('Service Worker: Offline, menampilkan halaman index dari cache.');
            return caches.match('/index.html');
          }
          return new Response(null, { status: 404 });
        });
      })
  );
});

// =======================================================
// === INI BAGIAN YANG DIPERBAIKI ===
// =======================================================

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');

  let notificationData;

  if (event.data) {
    // Data ada. Mari kita cari tahu formatnya.
    try {
      // 1. Coba baca sebagai JSON (untuk server sungguhan)
      notificationData = event.data.json();
    } catch (e) {
      // 2. Gagal JSON? Berarti ini teks dari DevTools.
      console.log('Data push bukan JSON, dibaca sebagai teks.');
      const bodyText = event.data.text();
      notificationData = {
        title: 'Tes Notifikasi (dari DevTools)',
        body: bodyText, // Tampilkan teks yang dikirim DevTools
        url: '/'
      };
    }
  } else {
    // 3. Tidak ada data sama sekali
    notificationData = {
      title: 'Tes Notifikasi',
      body: 'Ini adalah notifikasi push tanpa data.',
      url: '/'
    };
  }

  const title = notificationData.title || 'Notifikasi Baru';
  const options = {
    body: notificationData.body || 'Ada pesan baru untuk Anda.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: notificationData.url || '/',
    },
    actions: [
      { action: 'open-link', title: 'Buka' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listener 'notificationclick' Anda (ini sudah benar, biarkan saja)
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');

  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

// =======================================================
// === BACKGROUND SYNC UNTUK UPLOAD CERITA OFFLINE ===
// =======================================================

// Helper function untuk membuka IndexedDB
function openPendingDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('storyverse-pending-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-stories')) {
        const objectStore = db.createObjectStore('pending-stories', {
          keyPath: 'id',
          autoIncrement: true
        });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Helper function untuk mengambil semua pending stories
async function getAllPendingStories() {
  const db = await openPendingDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-stories'], 'readonly');
    const store = transaction.objectStore('pending-stories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

// Helper function untuk menghapus pending story
async function deletePendingStory(id) {
  const db = await openPendingDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-stories'], 'readwrite');
    const store = transaction.objectStore('pending-stories');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

// Helper function untuk upload story ke server
async function uploadStoryToServer(story) {
  const formData = new FormData();
  formData.append('description', story.description);
  formData.append('lat', story.lat);
  formData.append('lon', story.lon);

  // Convert base64 photo back to blob
  if (story.photoBase64) {
    const response = await fetch(story.photoBase64);
    const blob = await response.blob();
    formData.append('photo', blob, story.photoName || 'photo.jpg');
  }

  const uploadResponse = await fetch('https://story-api.dicoding.dev/v1/stories', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${story.token}`
    },
    body: formData
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  return uploadResponse.json();
}

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync event triggered:', event.tag);

  if (event.tag === 'sync-pending-stories') {
    event.waitUntil(
      syncPendingStories().catch((error) => {
        console.error('Service Worker: Sync failed, will retry later:', error);
        // Jangan throw error, biarkan browser retry otomatis
      })
    );
  }
});

// Function untuk sync semua pending stories
async function syncPendingStories() {
  console.log('Service Worker: Mulai sync pending stories...');

  try {
    const pendingStories = await getAllPendingStories();
    console.log(`Service Worker: Ditemukan ${pendingStories.length} cerita pending`);

    if (pendingStories.length === 0) {
      console.log('Service Worker: Tidak ada cerita pending untuk diupload');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const story of pendingStories) {
      try {
        console.log('Service Worker: Mengupload cerita:', story.id);
        await uploadStoryToServer(story);
        await deletePendingStory(story.id);
        successCount++;
        console.log('Service Worker: Berhasil upload cerita:', story.id);
      } catch (error) {
        failCount++;
        console.error('Service Worker: Gagal upload cerita:', story.id, error);
        // Jangan hapus dari DB, biarkan untuk retry berikutnya
      }
    }

    // Kirim notifikasi ke user
    if (successCount > 0) {
      try {
        await self.registration.showNotification('Upload Berhasil! 🎉', {
          body: `${successCount} cerita berhasil dipublikasikan!`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: { url: '/' },
          tag: 'sync-success'
        });
      } catch (notifError) {
        console.warn('Service Worker: Gagal menampilkan notifikasi:', notifError);
      }
    }

    if (failCount > 0) {
      console.warn(`Service Worker: ${failCount} cerita gagal diupload, akan dicoba lagi nanti`);
    }

  } catch (error) {
    console.error('Service Worker: Error saat sync pending stories:', error);
    // Jangan throw error, biarkan sync selesai dengan graceful
  }
}