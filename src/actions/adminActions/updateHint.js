import axios from 'axios';
import { UPDATE_HINT } from '../../constants';

export const updateHint = (hId, data, topicId, navigate, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadUpdateHint());
  axios
    .put(`admin/updateHint/${hId}`, data, config)
    .then((res) => {
      dispatch(setUpdateHint(res));
      navigate('/dashboard/question', {
        state: { topicId }
      });
    })
    .catch((err) => {
      dispatch(errorUpdateHint(err.response));
      onError(err.response);
    });
};

export const loadUpdateHint = () => ({
  type: UPDATE_HINT.LOAD
});

export const setUpdateHint = (data) => ({
  type: UPDATE_HINT.SUCCESS,
  payload: data.data
});

export const errorUpdateHint = (error) => ({
  type: UPDATE_HINT.FAIL,
  payload: error
});
