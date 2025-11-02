import StoryApi from '../../data/api';

const HomePage = {
  async render() {
    return `
      <section class="container">
        <h1 class="sr-only">Halaman Utama</h1>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>Jelajahi Cerita</h2>
            </div>
        <div id="map"></div>
        <div class="movie-list" id="movie-list">
            <p class="loader">Memuat cerita...</p>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      window.location.hash = '#/login';
      return;
    }

    const movieListContainer = document.querySelector('#movie-list');
    try {
      const stories = await StoryApi.getAllStoriesWithLocation();
      movieListContainer.innerHTML = '';

      const map = L.map('map').setView([-2.5489, 118.0149], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      stories.forEach(story => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

          movieItem.innerHTML = `
          <img src="${story.photoUrl}" alt="Gambar cerita oleh ${story.name}">
          <div class="movie-item__content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <small>Dibuat pada: ${new Date(story.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}</small>
          </div>
        `;
        movieListContainer.appendChild(movieItem);

        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon]).addTo(map).bindPopup(`<b>${story.name}</b>`);
        }
      });
    } catch (error) {
      alert(error.message);
      window.location.hash = '#/login';
    }
  },
};

export default HomePage;