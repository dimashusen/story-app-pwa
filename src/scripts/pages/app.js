import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';
import NotificationHelper from '../utils/notification-helper'; // 1. IMPOR HELPER

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._initialAppShell();
    this._initNotificationButton(); // 2. PANGGIL FUNGSI INIT
  }

  _initialAppShell() {
    // ... (kode initialAppShell Anda tidak berubah)
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });
    this.#content.addEventListener('click', () => {
      this.#navigationDrawer.classList.remove('open');
    });
  }

  // 3. GANTI FUNGSI INI DENGAN LOGIKA TOGGLE YANG BARU
  async _initNotificationButton() {
    const button = document.querySelector('#notification-toggle');
    if (!button) return;

    // Cek status saat halaman dimuat
    const subscription = await NotificationHelper.getSubscription();
    let isSubscribed = !!subscription; // true jika ada subscription, false jika null

    // Update UI tombol
    this._updateNotificationButtonUI(button, isSubscribed);

    // Tambah listener klik
    button.addEventListener('click', async () => {
      // Tombol diklik, lakukan aksi sebaliknya
      if (isSubscribed) {
        // Lagi subscribe -> Lakukan unsubscribe (DISABLE)
        await NotificationHelper.unsubscribe();
        isSubscribed = false;
        alert('Notifikasi dinonaktifkan.');
      } else {
        // Lagi non-subscribe -> Lakukan subscribe (ENABLE)
        const newSubscription = await NotificationHelper.subscribe();
        if (newSubscription) {
          isSubscribed = true;
          alert('Notifikasi diaktifkan!');
        }
      }
      // Update UI lagi
      this._updateNotificationButtonUI(button, isSubscribed);
    });
  }

  // 4. TAMBAHKAN FUNGSI HELPER BARU INI (untuk ganti teks tombol)
  _updateNotificationButtonUI(button, isSubscribed) {
    if (isSubscribed) {
      button.innerHTML = '🔕 Nonaktifkan Notifikasi';
    } else {
      button.innerHTML = '🔔 Aktifkan Notifikasi';
    }
  }

  async renderPage() {
    // ... (kode renderPage Anda tidak berubah)
    try {
      const url = UrlParser.parseActiveUrlWithCombiner();
      const page = routes[url];
      if (!document.startViewTransition) {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      } else {
        document.startViewTransition(async () => {
          this.#content.innerHTML = await page.render();
          await page.afterRender();
        });
      }
      this._updateAuthLink(); 
      const mainContent = document.querySelector('#main-content');
      if (mainContent) mainContent.setAttribute('tabindex', '-1');
      const skipLinkElem = document.querySelector('.skip-link');
      skipLinkElem.addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.focus();
      });
    } catch (error) {
      console.error('Gagal merender halaman:', error);
      this.#content.innerHTML = '<h2>Halaman tidak dapat dimuat.</h2>';
    }
  }

  _updateAuthLink() {
    // ... (kode _updateAuthLink Anda tidak berubah)
    const userToken = localStorage.getItem('userToken');
    const authLink = document.querySelector('#auth-link');
    const navList = document.querySelector('#nav-list');
    const addStoryLink = navList.querySelector('a[href="#/add"]');

    if (userToken) {
      authLink.textContent = 'Logout';
      addStoryLink.style.display = 'block';
      authLink.onclick = (event) => {
        event.preventDefault();
        localStorage.removeItem('userToken');
        window.location.hash = '#/login';
      };
    } else {
      authLink.textContent = 'Login';
      authLink.href = '#/login';
      addStoryLink.style.display = 'none';
      authLink.onclick = null; 
    }
  }
}

export default App;