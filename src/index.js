// scroll bar
import 'simplebar/src/simplebar.css';

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import config from './config';
import * as serviceWorker from './serviceWorker';
import reportWebVitals from './reportWebVitals';
import store from './store';
import { errorAdminLogin, setAdminLogin } from './actions/adminActions/adminLogin';
import setAuthToken from './utils/setAuthToken';
import './assets/css/editor.css';

const { dispatch } = store;

// ----------------------------------------------------------------------

axios.defaults.baseURL = config.BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

axios.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      dispatch(errorAdminLogin({}));
      localStorage.clear();
      setAuthToken(false);
      dispatch(setAdminLogin({}));
      window.location.replace('/login');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

ReactDOM.render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>,
  document.getElementById('root')
);

// If you want to enable client cache, register instead.
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
