// File: src/scripts/utils/notification-helper.js

// Fungsi ini mengubah VAPID key (string) menjadi format Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationHelper = {
  async subscribe() {
    if (!('PushManager' in window)) {
      alert('Push Messaging tidak didukung di browser ini.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // GANTI DENGAN VAPID PUBLIC KEY DARI DOKUMENTASI API
        applicationServerKey: urlBase64ToUint8Array('MASUKKAN_VAPID_PUBLIC_KEY_ANDA'),
      });
      
      console.log('Berhasil berlangganan:', subscription.toJSON());
      alert('Anda berhasil berlangganan notifikasi!');
    } catch (error) {
      console.error('Gagal berlangganan:', error);
      alert('Gagal berlangganan notifikasi.');
    }
  },
};

export default NotificationHelper;