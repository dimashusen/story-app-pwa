import StoryApi from '../data/api';

const RegisterPage = {
  async render() {
    return `
      <div class="form-container container">
        <h1 class="sr-only">Halaman Registrasi</h1>
        <h2>Register</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="nameInput">Nama</label>
            <input type="text" id="nameInput" name="name" required>
          </div>
          <div class="form-group">
            <label for="emailInput">Email</label>
            <input type="email" id="emailInput" name="email" required>
          </div>
          <div class="form-group">
            <label for="passInput">Password (min. 8 karakter)</label>
            <input type="password" id="passInput" name="password" minlength="8" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <p id="error-message" style="color:red;"></p>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </div>
    `;
  },

  async afterRender() {
    const registerForm = document.querySelector('#register-form');
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Menggunakan ID baru
      const name = document.querySelector('#nameInput').value;
      const email = document.querySelector('#emailInput').value;
      const password = document.querySelector('#passInput').value;
      const errorMessage = document.querySelector('#error-message');

      try {
        const response = await StoryApi.register({ name, email, password });
        if (response.error) {
          throw new Error(response.message);
        }
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '#/login';
      } catch (error) {
        errorMessage.textContent = `Registrasi Gagal: ${error.message}`;
      }
    });
  },
};

export default RegisterPage;