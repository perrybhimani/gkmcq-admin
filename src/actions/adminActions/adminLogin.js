import axios from 'axios';
import jwtDecode from 'jwt-decode';
import setAuthToken from '../../utils/setAuthToken';
import { ADMIN_LOGIN } from '../../constants';

export const loginAdmin = (adminData, navigate, onError) => (dispatch) => {
  dispatch(loadAdminLogin());
  axios
    .post('auth/adminLogin', adminData)
    .then((res) => {
      const { token } = res.data.data;
      const decoded = jwtDecode(token);
      setAuthToken(token);
      localStorage.setItem('jwtToken', token);
      const { name } = res.data.data;
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', decoded.email);
      navigate('/dashboard/user');
      dispatch(setAdminLogin(decoded));
    })
    .catch((err) => {
      dispatch(errorAdminLogin(err.response));
      onError(err.response);
    });
};

export const loadAdminLogin = () => ({
  type: ADMIN_LOGIN.LOAD
});

export const setAdminLogin = (data) => ({
  type: ADMIN_LOGIN.SUCCESS,
  payload: data
});

export const errorAdminLogin = (error) => ({
  type: ADMIN_LOGIN.FAIL,
  payload: error
});

export const logoutAdmin = (navigate) => (dispatch) => {
  dispatch(errorAdminLogin({}));
  localStorage.clear();
  setAuthToken(false);
  dispatch(setAdminLogin({}));
  if (navigate) navigate('/login');
};
