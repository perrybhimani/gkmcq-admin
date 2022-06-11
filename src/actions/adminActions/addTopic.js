import axios from 'axios';
import { ADD_TOPIC } from '../../constants';

export const createTopic = (data, navigate, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(addTopic());
  axios
    .post(`admin/createTopic`, data, config)
    .then((res) => {
      dispatch(setTopic(res));
      navigate(-1);
    })
    .catch((err) => {
      dispatch(errorTopic(err.response));
      onError(err.response);
    });
};

export const addTopic = () => ({
  type: ADD_TOPIC.LOAD
});

export const setTopic = (data) => ({
  type: ADD_TOPIC.SUCCESS,
  payload: data.data
});

export const errorTopic = (error) => ({
  type: ADD_TOPIC.FAIL,
  payload: error
});
