import StoryApi from '../../data/api';
import FavoriteStoryIdb from '../../data/idb-helper';
import PendingStoriesDB from '../../utils/pending-stories-db';

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
    const map = L.map('map').setView([-2.5489, 118.0149], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    try {
      // 1. Ambil SEMUA data (dari API, DB favorit, dan pending stories)
      let stories, favoriteStories, pendingStories;

      try {
        [stories, favoriteStories, pendingStories] = await Promise.all([
          StoryApi.getAllStoriesWithLocation(),
          FavoriteStoryIdb.getAllStories(),
          PendingStoriesDB.getAllPendingStories().catch(() => []) // Jika gagal, return array kosong
        ]);
      } catch (error) {
        // Jika gagal ambil data, coba satu per satu
        console.error('Error fetching data:', error);
        stories = await StoryApi.getAllStoriesWithLocation();
        favoriteStories = await FavoriteStoryIdb.getAllStories().catch(() => []);
        pendingStories = await PendingStoriesDB.getAllPendingStories().catch(() => []);
      }

      // Buat Set (daftar) ID favorit untuk pengecekan cepat
      const favoriteIds = new Set(favoriteStories.map(story => story.id));

      movieListContainer.innerHTML = '';

      // 2. Tampilkan pending stories terlebih dahulu (di atas)
      if (pendingStories && Array.isArray(pendingStories) && pendingStories.length > 0) {
        pendingStories.forEach(pendingStory => {
          const movieItem = document.createElement('div');
          movieItem.classList.add('movie-item', 'pending-story');

          movieItem.innerHTML = `
            <img src="${pendingStory.photoBase64 || ''}" alt="Cerita pending">
            <div class="movie-item__content">
              <div class="pending-badge">⏳ Menunggu Upload</div>
              <h3>Cerita Anda</h3>
              <p>${pendingStory.description || 'Tidak ada deskripsi'}</p>
              <small>Akan dipublikasikan saat online</small>
            </div>
          `;
          movieListContainer.appendChild(movieItem);
        });
      }

      // 3. Tampilkan stories dari server
      stories.forEach(story => {
        // Cek apakah cerita ini ada di daftar favorit
        const isFavorite = favoriteIds.has(story.id);

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
            
            <button 
              class="favorite-button ${isFavorite ? 'favorited' : ''}" 
              data-id="${story.id}"
              aria-label="${isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}"
            >
              ${isFavorite ? '❤️' : '♡'}
            </button>
          </div>
        `;
        movieListContainer.appendChild(movieItem);

        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon]).addTo(map).bindPopup(`<b>${story.name}</b>`);
        }
      });

      // 4. Tambahkan SATU event listener untuk semua tombol
      movieListContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('favorite-button')) {
          event.preventDefault();
          
          const button = event.target;
          const storyId = button.dataset.id;
          
          if (button.classList.contains('favorited')) {
            // JIKA SUDAH FAVORIT (DELETE)
            await FavoriteStoryIdb.deleteStory(storyId);
            button.innerHTML = '♡';
            button.classList.remove('favorited');
          } else {
            // JIKA BELUM FAVORIT (CREATE)
            const story = stories.find(s => s.id === storyId);
            await FavoriteStoryIdb.putStory(story);
            button.innerHTML = '❤️';
            button.classList.add('favorited');
          }
        }
      });

    } catch (error) {
      alert(error.message);
      window.location.hash = '#/login';
    }
  },
};

export default HomePage;