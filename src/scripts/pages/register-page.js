import StoryApi from '../data/api';

const RegisterPage = {
  async render() {
    return `
      <div class="form-container container">
        <h1 class="sr-only">Halaman Registrasi</h1>
        <h2>Register</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password (min. 8 karakter)</label>
            <input type="password" id="password" name="password" minlength="8" required>
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
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;
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