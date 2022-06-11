import axios from 'axios';
import { DELETE_FILE } from '../../constants';

export const deleteFile = (data, onError, onDeleteFileResponse) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDeleteFile());
  axios
    .delete(`/admin/deleteFile`, { data, headers: config.headers })
    .then((res) => {
      onDeleteFileResponse(res);
      dispatch(setDeleteFile(res));
    })
    .catch((err) => {
      dispatch(errorDeleteFile(err.response));
      onError(err.response);
    });
};

export const loadDeleteFile = () => ({
  type: DELETE_FILE.LOAD
});

export const setDeleteFile = (data) => ({
  type: DELETE_FILE.SUCCESS,
  payload: data
});

export const errorDeleteFile = (error) => ({
  type: DELETE_FILE.FAIL,
  payload: error
});
