// Fungsi ini wajib ada untuk mengubah VAPID key
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

    const registration = await navigator.serviceWorker.ready;
    try {
      // 1. Minta izin dan subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        
        // 2. GUNAKAN VAPID KEY YANG BENAR DARI REVIEWER
        applicationServerKey: urlBase64ToUint8Array(
          'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
        ),
      });
      
      // 3. KIRIM subscription ke API Story (WAJIB)
      await this._sendSubscriptionToServer(subscription);
      
      console.log('Berhasil berlangganan:', subscription.toJSON());
      alert('Anda berhasil berlangganan notifikasi!');

    } catch (error) {
      console.error('Gagal berlangganan:', error);
      alert('Gagal berlangganan notifikasi. Pastikan izin diberikan.');
    }
  },

  // Fungsi baru untuk mengirim data ke API
  async _sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Anda harus login untuk berlangganan notifikasi.');
      return;
    }
    
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      const responseJson = await response.json();
      if (response.status >= 400) {
        throw new Error(responseJson.message);
      }
      console.log('Berhasil mengirim subscription ke server:', responseJson);
      
    } catch (error) {
      console.error('Gagal mengirim subscription ke server:', error);
      alert(`Gagal mengirim data ke server: ${error.message}`);
    }
  },
};

export default NotificationHelper;