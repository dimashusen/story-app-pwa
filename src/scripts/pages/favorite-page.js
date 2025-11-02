import FavoriteStoryIdb from '../data/idb-helper';
const FavoritePage = {
  async render() {
    return `
      <section class="container">
        <h1 class="sr-only">Halaman Favorit</h1>
        <h2>Cerita Favorit Anda</h2>
        <div id="favorite-list" class="movie-list">
          <p class="loader">Memuat cerita favorit...</p>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const storiesContainer = document.querySelector('#favorite-list');
    
    // Ambil data dari IndexedDB
    const stories = await FavoriteStoryIdb.getAllStories();

    if (stories.length === 0) {
      storiesContainer.innerHTML = '<p>Anda belum memiliki cerita favorit.</p>';
      return;
    }

    storiesContainer.innerHTML = '';
    stories.forEach(story => {
      const storyItem = document.createElement('div');
      storyItem.classList.add('movie-item');
      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Gambar cerita oleh ${story.name}">
        <div class="movie-item__content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <small>Dibuat pada: ${new Date(story.createdAt).toLocaleDateString('id-ID')}</small>
          
          <button class="delete-button" data-id="${story.id}">❌ Hapus dari Favorit</button>
        </div>
      `;
      storiesContainer.appendChild(storyItem);
    });

    // Event listener untuk semua tombol hapus
    storiesContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('delete-button')) {
        event.preventDefault();
        const storyId = event.target.dataset.id;
        
        await FavoriteStoryIdb.deleteStory(storyId); // Hapus dari DB
        alert('Cerita dihapus dari favorit.');
        
        this.afterRender(); // Muat ulang daftar favorit
      }
    });
  },
};

export default FavoritePage;