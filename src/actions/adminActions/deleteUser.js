import axios from 'axios';
import { DELETE_USER } from '../../constants';

export const deleteUser = (uID, setDeleteDialog, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDeleteUser());
  axios
    .delete(`/admin/deleteUser/${uID}`, config)
    .then((res) => {
      dispatch(setDeleteUser(res));
      setDeleteDialog(false);
    })
    .catch((err) => {
      dispatch(errorDeleteUser(err.response));
      onError(err.response);
    });
};

export const loadDeleteUser = () => ({
  type: DELETE_USER.LOAD
});

export const setDeleteUser = (data) => ({
  type: DELETE_USER.SUCCESS,
  payload: data
});

export const errorDeleteUser = (error) => ({
  type: DELETE_USER.FAIL,
  payload: error
});
