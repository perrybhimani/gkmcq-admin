import axios from 'axios';
import { UPDATE_QUESTION } from '../../constants';

export const updateQuestion = (qId, data, navigate, topicId, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadUpdateQuestion());
  axios
    .put(`/admin/updateQuestion/${qId}`, data, config)
    .then((res) => {
      dispatch(setUpdateQuestion(res));
      navigate('/dashboard/question', {
        state: { topicId }
      });
    })
    .catch((err) => {
      dispatch(errorUpdateQuestion(err.response));
      onError(err.response);
    });
};

export const loadUpdateQuestion = () => ({
  type: UPDATE_QUESTION.LOAD
});

export const setUpdateQuestion = (data) => ({
  type: UPDATE_QUESTION.SUCCESS,
  payload: data.data
});

export const errorUpdateQuestion = (error) => ({
  type: UPDATE_QUESTION.FAIL,
  payload: error
});
