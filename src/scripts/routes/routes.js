import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/login-page';
import RegisterPage from '../pages/register-page';
import AddPage from '../pages/add/add-page'; 

const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add': AddPage, 
};

export default routes;