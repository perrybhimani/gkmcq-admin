import axios from 'axios';
import { UPDATE_TOPIC } from '../../constants';

export const updateTopic = (tId, data, navigate, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadUpdateTopic());
  axios
    .put(`admin/updateTopic/${tId}`, data, config)
    .then((res) => {
      dispatch(setUpdateTopic(res));
      navigate(-1);
    })
    .catch((err) => {
      dispatch(errorUpdateTopic(err.response));
      onError(err.response);
    });
};

export const loadUpdateTopic = () => ({
  type: UPDATE_TOPIC.LOAD
});

export const setUpdateTopic = (data) => ({
  type: UPDATE_TOPIC.SUCCESS,
  payload: data.data
});

export const errorUpdateTopic = (error) => ({
  type: UPDATE_TOPIC.FAIL,
  payload: error
});
