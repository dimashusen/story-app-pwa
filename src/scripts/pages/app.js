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
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
      }
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
        alert('Anda telah logout.');
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