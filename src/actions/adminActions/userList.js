import axios from 'axios';
import { USER_LIST } from '../../constants';

export const fetchUserList = (onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadUserList());

  axios
    .get('/admin/listUser', config)
    .then((res) => dispatch(setUserList(res)))
    .catch((err) => {
      dispatch(errorUserList(err.response));
      onError(err.response);
    });
};

export const loadUserList = () => ({
  type: USER_LIST.LOAD
});

export const setUserList = (userList) => ({
  type: USER_LIST.SUCCESS,
  payload: userList.data.data
});

export const errorUserList = (error) => ({
  type: USER_LIST.FAIL,
  payload: error
});
