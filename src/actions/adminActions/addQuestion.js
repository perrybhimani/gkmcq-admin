import axios from 'axios';
import { ADD_QUESTION } from '../../constants';

export const createQuestion = (data, navigate, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(addQuestion());
  axios
    .post(`admin/createQuestion`, data, config)
    .then((res) => {
      dispatch(setQuestion(res));
      navigate('/dashboard/question', {
        state: { topicId: data.topicId }
      });
    })
    .catch((err) => {
      dispatch(errorQuestion(err.response));
      onError(err.response);
    });
};

export const addQuestion = () => ({
  type: ADD_QUESTION.LOAD
});

export const setQuestion = (data) => ({
  type: ADD_QUESTION.SUCCESS,
  payload: data.data
});

export const errorQuestion = (error) => ({
  type: ADD_QUESTION.FAIL,
  payload: error
});
