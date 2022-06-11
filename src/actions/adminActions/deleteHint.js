import axios from 'axios';
import { DELETE_HINT } from '../../constants';

export const deleteHint = (hID, navigateTo, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDeleteHint());
  axios
    .delete(`/admin/deleteHint/${hID}`, config)
    .then((res) => {
      dispatch(setDeleteHint(res));
      navigateTo();
    })
    .catch((err) => {
      dispatch(errorDeleteHint(err.response));
      onError(err.response);
    });
};

export const loadDeleteHint = () => ({
  type: DELETE_HINT.LOAD
});

export const setDeleteHint = (data) => ({
  type: DELETE_HINT.SUCCESS,
  payload: data
});

export const errorDeleteHint = (error) => ({
  type: DELETE_HINT.FAIL,
  payload: error
});
