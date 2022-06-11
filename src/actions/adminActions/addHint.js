import axios from 'axios';
import { ADD_HINT } from '../../constants';

export const createHint = (data, tID, navigate, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(addHint());
  axios
    .post(`admin/createHint`, data, config)
    .then((res) => {
      dispatch(setHint(res));
      navigate('/dashboard/question', {
        state: { topicId: tID }
      });
    })
    .catch((err) => {
      dispatch(errorHint(err.response));
      onError(err.response);
    });
};

export const addHint = () => ({
  type: ADD_HINT.LOAD
});

export const setHint = (data) => ({
  type: ADD_HINT.SUCCESS,
  payload: data.data
});

export const errorHint = (error) => ({
  type: ADD_HINT.FAIL,
  payload: error
});
