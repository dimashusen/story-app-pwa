// File: src/scripts/utils/sw-register.js
const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker tidak didukung browser ini.');
    return;
  }
  try {
    await navigator.serviceWorker.register('./sw.js');
    console.log('Service worker berhasil didaftarkan.');
  } catch (error) {
    console.log('Gagal mendaftarkan service worker:', error);
  }
};
export default swRegister;