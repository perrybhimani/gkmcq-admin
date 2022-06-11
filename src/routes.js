import { Navigate, useRoutes } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import Products from './pages/Products';
import Blog from './pages/Blog';
import User from './pages/User';
import Topic from './pages/Topic';
import NotFound from './pages/Page404';
import setAuthToken from './utils/setAuthToken';
import store from './store';
import { logoutAdmin, setAdminLogin } from './actions/adminActions/adminLogin';
import AddEditTopic from './pages/AddEditTopic';
import Questions from './pages/Questions';
import AddEditQuestion from './pages/AddEditQuestion';
import Discussion from './pages/Discussion';
import Hint from './pages/Hint';
// ----------------------------------------------------------------------

if (localStorage.jwtToken) {
  const token = localStorage.jwtToken;
  setAuthToken(token);
  const decoded = jwtDecode(token);
  store.dispatch(setAdminLogin(decoded));
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutAdmin());
    window.location.href = '/login';
  }
}

export default function Router() {
  return useRoutes([
    localStorage.jwtToken
      ? {
          path: '/',
          element: <DashboardLayout />,
          children: [
            { path: '/', element: <Navigate to="/dashboard/user" /> },
            // { path: '/dashboard/app', element: <DashboardApp /> },
            { path: '/dashboard/user', element: <User /> },
            { path: '/dashboard/topic', element: <Topic /> },
            { path: '/dashboard/add/topic', element: <AddEditTopic /> },
            { path: '/dashboard/edit/topic', element: <AddEditTopic /> },
            { path: '/dashboard/add/question', element: <AddEditQuestion /> },
            { path: '/dashboard/edit/question', element: <AddEditQuestion /> },
            { path: '/dashboard/question', element: <Questions /> },
            { path: '/dashboard/comments', element: <Discussion /> },
            { path: '/dashboard/hint', element: <Hint /> }
            // { path: '/dashboard/products', element: <Products /> },
          ]
        }
      : {
          path: '/',
          element: <LogoOnlyLayout />,
          children: [
            { path: '/', element: <Navigate to="/login" /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> }
          ]
        },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
