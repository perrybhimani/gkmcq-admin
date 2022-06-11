import axios from 'axios';
import { GET_QUESTION } from '../../constants';

export const fetchQuestion = (qId, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadGetQuestion());

  axios
    .get(`/admin/getQuestionById/${qId}`, config)
    .then((res) => dispatch(setGetQuestion(res)))
    .catch((err) => {
      dispatch(errorGetQuestion(err.response));
      onError(err.response);
    });
};

export const loadGetQuestion = () => ({
  type: GET_QUESTION.LOAD
});

export const setGetQuestion = (topicList) => ({
  type: GET_QUESTION.SUCCESS,
  payload: topicList.data.data
});

export const errorGetQuestion = (error) => ({
  type: GET_QUESTION.FAIL,
  payload: error
});
