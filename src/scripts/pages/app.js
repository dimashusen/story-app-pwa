import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._initialAppShell();

    if (process.env.NODE_ENV === 'production') {
      this._initNotificationButton();
    }
  }

  _initialAppShell() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });
    this.#content.addEventListener('click', () => {
      this.#navigationDrawer.classList.remove('open');
    });
  }

  async _initNotificationButton() {
    const { default: NotificationHelper } = await import('../utils/notification-helper.js');

    const button = document.querySelector('#notification-toggle');
    if (!button) return;

    const subscription = await NotificationHelper.getSubscription();
    let isSubscribed = !!subscription;

    this._updateNotificationButtonUI(button, isSubscribed);

    button.addEventListener('click', async () => {
      if (isSubscribed) {
        await NotificationHelper.unsubscribe();
        isSubscribed = false;
        alert('Notifikasi dinonaktifkan.');
      } else {
        const newSubscription = await NotificationHelper.subscribe();
        if (newSubscription) {
          isSubscribed = true;
          alert('Notifikasi diaktifkan!');
        }
      }
      this._updateNotificationButtonUI(button, isSubscribed);
    });
  }

  _updateNotificationButtonUI(button, isSubscribed) {
    if (isSubscribed) {
      button.innerHTML = '🔕 Nonaktifkan Notifikasi';
    } else {
      button.innerHTML = '🔔 Aktifkan Notifikasi';
    }
  }

  async renderPage() {
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