// File: src/scripts/utils/index.js

// Impor CSS agar bisa diproses Webpack
import '../../styles/styles.css';

// Impor kelas App dari lokasinya yang benar
import App from '../pages/app';

// Inisialisasi Aplikasi
const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});

// Listener untuk memuat halaman saat pertama kali dibuka
window.addEventListener('load', () => {
  app.renderPage();
});

// Listener untuk mengganti halaman saat URL berubah
window.addEventListener('hashchange', () => {
  app.renderPage();
});