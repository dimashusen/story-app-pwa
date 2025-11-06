import StoryApi from '../../data/api';
import PendingStoriesDB from '../../utils/pending-stories-db';

const AddPage = {
  async render() {
    return `
      <section class="container">
        <div class="form-container">
            <h1 class="sr-only">Halaman Tambah Cerita</h1>
            <h2>Buat Cerita Baru</h2>
            <form id="add-story-form">
                <div class="form-group">
                    <label for="descInput">Deskripsi</label>
                    <textarea id="descInput" name="description" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="photoInput">Upload Foto (Max 1MB)</label>
                    <input type="file" id="photoInput" name="photo" accept="image/*" required>
                </div>

                <div class="form-group">
                    <p class="map-label" id="map-label">Pilih Lokasi Cerita Anda</p>
                    <em class="location-instruction">(Klik peta di bawah ini untuk menandai lokasi)</em>
                    <div id="map-picker" role="application" aria-labelledby="map-label"></div>
                </div>

                <label for="latitude" class="sr-only">Latitude</label>
                <input type="hidden" id="latitude" name="lat">
                <label for="longitude" class="sr-only">Longitude</label>
                <input type="hidden" id="longitude" name="lon">
                <button type="submit" id="submit-button" disabled>Publikasikan Cerita</button>
            </form>
            <p id="error-message" class="error-message"></p>
        </div>
      </section>
    `;
  },
  
  async afterRender() {
    const latInput = document.querySelector('#latitude');
    const lonInput = document.querySelector('#longitude');
    const submitButton = document.querySelector('#submit-button');
    const mapPicker = L.map('map-picker').setView([-2.5489, 118.0149], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapPicker);
    
    let marker;
    mapPicker.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latInput.value = lat;
      lonInput.value = lng;
      
      if (marker) {
        mapPicker.removeLayer(marker);
      }
      marker = L.marker([lat, lng]).addTo(mapPicker);
      
      submitButton.disabled = false;
      submitButton.textContent = 'Lokasi Dipilih, Publikasikan!';
    });

    const form = document.querySelector('#add-story-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!latInput.value) {
        alert('Anda harus memilih lokasi di peta terlebih dahulu!');
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Mengirim...';
      const errorMessage = document.querySelector('#error-message');
      errorMessage.textContent = '';

      const formData = new FormData(form);
      const photoInput = document.querySelector('#photoInput');
      const descInput = document.querySelector('#descInput');

      try {
        // Cek apakah online
        if (!navigator.onLine) {
          // Mode offline - simpan ke IndexedDB
          await this._saveStoryOffline(formData, photoInput.files[0], descInput.value, latInput.value, lonInput.value);
          alert('📱 Anda sedang offline. Cerita akan dipublikasikan otomatis saat online kembali!');
          window.location.hash = '#/';
          return;
        }

        // Mode online - upload langsung
        const response = await StoryApi.addNewStory(formData);
        if (response.error) throw new Error(response.message);

        alert('Cerita baru berhasil ditambahkan!');
        window.location.hash = '#/';
      } catch (error) {
        // Jika gagal karena network error, simpan offline
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          try {
            await this._saveStoryOffline(formData, photoInput.files[0], descInput.value, latInput.value, lonInput.value);
            alert('📱 Koneksi bermasalah. Cerita akan dipublikasikan otomatis saat online kembali!');
            window.location.hash = '#/';
          } catch (offlineError) {
            errorMessage.textContent = `Gagal menyimpan cerita: ${offlineError.message}`;
            submitButton.disabled = false;
            submitButton.textContent = 'Publikasikan Cerita';
          }
        } else {
          errorMessage.textContent = `Gagal: ${error.message}`;
          submitButton.disabled = false;
          submitButton.textContent = 'Publikasikan Cerita';
        }
      }
    });
  },

  // Helper function untuk menyimpan cerita saat offline
  async _saveStoryOffline(_formData, photoFile, description, lat, lon) {
    // Convert photo ke base64 untuk disimpan di IndexedDB
    const photoBase64 = await this._fileToBase64(photoFile);
    const token = localStorage.getItem('userToken');

    if (!token) {
      throw new Error('Anda harus login untuk menyimpan cerita');
    }

    const storyData = {
      description,
      lat,
      lon,
      photoBase64,
      photoName: photoFile.name,
      token,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Simpan ke IndexedDB
    await PendingStoriesDB.addPendingStory(storyData);

    // Register background sync jika didukung
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await registration.sync.register('sync-pending-stories');
          console.log('Background sync registered');
        }
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  },

  // Helper function untuk convert file ke base64
  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export default AddPage;