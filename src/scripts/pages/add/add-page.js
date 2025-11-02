import StoryApi from '../../data/api';

const AddPage = {
  async render() {
    return `
      <section class="container">
        <div class="form-container">
            <h1 class="sr-only">Halaman Tambah Cerita</h1>
            <h2>Buat Cerita Baru</h2>
            <form id="add-story-form">
                <div class="form-group">
                    <label for="description">Deskripsi</label>
                    <textarea id="description" name="description" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="photo">Upload Foto (Max 1MB)</label>
                    <input type="file" id="photo" name="photo" accept="image/*" required>
                </div>
                <div class="form-group">
                    <label>Pilih Lokasi Cerita Anda</label>
                    <em class="location-instruction">(Klik peta di bawah ini untuk menandai lokasi)</em>
                    <div id="map-picker"></div>
                </div>
                <input type="hidden" id="latitude" name="lat">
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
      if (marker) mapPicker.removeLayer(marker);
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
      try {
        const response = await StoryApi.addNewStory(formData);
        if (response.error) throw new Error(response.message);
        alert('Cerita baru berhasil ditambahkan!');
        window.location.hash = '#/';
      } catch (error) {
        errorMessage.textContent = `Gagal: ${error.message}`;
        submitButton.disabled = false;
        submitButton.textContent = 'Publikasikan Cerita';
      }
    });
  },
};

export default AddPage;