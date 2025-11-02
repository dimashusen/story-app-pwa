
const API_ENDPOINT = 'https://story-api.dicoding.dev/v1';

const StoryApi = {
  async register({ name, email, password }) {
    const response = await fetch(`${API_ENDPOINT}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login({ email, password }) {
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getAllStoriesWithLocation() {
    const token = localStorage.getItem('userToken');
    if (!token) throw new Error('Token tidak ditemukan.');
    const response = await fetch(`${API_ENDPOINT}/stories?location=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      localStorage.removeItem('userToken');
      throw new Error('Sesi tidak valid.');
    }
    const responseJson = await response.json();
    if (responseJson.error) throw new Error(responseJson.message);
    return responseJson.listStory;
  },

  async addNewStory(formData) {
    const token = localStorage.getItem('userToken');
    if (!token) throw new Error('Anda harus login.');

    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    
    return response.json();
  },
};

export default StoryApi;