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

// VAPID KEY YANG BENAR DARI REVIEWER
const VAPID_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const NotificationHelper = {
  // Cek apakah sudah berlangganan
  async getSubscription() {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  },

  // (ENABLE) Proses berlangganan baru
  async subscribe() {
    if (!('PushManager' in window)) {
      alert('Push Messaging tidak didukung di browser ini.');
      return null;
    }

    // Minta izin ke pengguna
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Izin notifikasi tidak diberikan.');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });
      
      // Kirim subscription ke server (WAJIB)
      await this._sendSubscriptionToServer(subscription);
      console.log('Berhasil berlangganan:', subscription.toJSON());
      return subscription;

    } catch (error) {
      console.error('Gagal berlangganan:', error);
      alert('Gagal berlangganan notifikasi.');
      return null;
    }
  },

  // (DISABLE) Proses berhenti berlangganan
  async unsubscribe() {
    const subscription = await this.getSubscription();
    if (!subscription) return;

    try {
      // Beri tahu server dulu (WAJIB)
      await this._sendUnsubscriptionToServer(subscription);
      
      // Berhenti langganan di browser
      await subscription.unsubscribe();
      console.log('Berhasil berhenti berlangganan.');

    } catch (error) {
      console.error('Gagal berhenti berlangganan:', error);
    }
  },

  // Kirim data ke API Dicoding (untuk subscribe)
  async _sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Anda harus login untuk berlangganan notifikasi.');
      throw new Error('User not logged in');
    }
    
    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
  },

  // Kirim data ke API Dicoding (untuk unsubscribe)
  async _sendUnsubscriptionToServer(subscription) {
    const token = localStorage.getItem('userToken');
    if (!token) return; // Gagal diam-diam

    await fetch('https://story-api.dicoding.dev/v1/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // API butuh endpoint untuk tahu subscription mana yang harus dihapus
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  },
};

export default NotificationHelper;