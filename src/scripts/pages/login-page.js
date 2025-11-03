import StoryApi from '../data/api';

const LoginPage = {
  async render() {
    return `
      <div class="form-container container">
        <h1 class="sr-only">Halaman Login</h1>
        <h2>Login</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="emailInput">Email</label>
            <input type="email" id="emailInput" required>
          </div>
          <div class="form-group">
            <label for="passInput">Password</label>
            <input type="password" id="passInput" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <p id="error-message" style="color:red;"></p>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </div>
    `;
  },

  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Menggunakan ID baru
      const email = document.querySelector('#emailInput').value;
      const password = document.querySelector('#passInput').value;
      const errorMessage = document.querySelector('#error-message');

      try {
        const response = await StoryApi.login({ email, password });
        if (response.error) throw new Error(response.message);

        localStorage.setItem('userToken', response.loginResult.token);
        window.location.hash = '#/';
        window.location.reload(); 
      } catch (error) {
        errorMessage.textContent = `Login Gagal: ${error.message}`;
      }
    });
  },
};

export default LoginPage;