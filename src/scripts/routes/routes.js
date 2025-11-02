import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/login-page';
import RegisterPage from '../pages/register-page';
import AddPage from '../pages/add/add-page';
import FavoritePage from '../pages/favorite-page'; // 1. IMPOR HALAMAN BARU

const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add': AddPage,
  '/favorites': FavoritePage, // 2. TAMBAHKAN RUTE BARU
};

export default routes;