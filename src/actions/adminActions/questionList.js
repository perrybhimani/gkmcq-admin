import axios from 'axios';
import { QUESTION_LIST } from '../../constants';

export const fetchQuestionList = (topicID, onError) => (dispatch) => {
  const token = localStorage.getItem('jwtToken');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadQuestionList());
  axios
    .get(`/admin/listQuestions?topicId=${topicID}`, config)
    .then((res) => dispatch(setQuestionList(res)))
    .catch((err) => {
      dispatch(errorQuestionList(err));
      onError(err.response);
    });
};

export const loadQuestionList = () => ({
  type: QUESTION_LIST.LOAD
});

export const setQuestionList = (questions) => ({
  type: QUESTION_LIST.SUCCESS,
  payload: questions.data.data
});

export const errorQuestionList = (err) => ({
  type: QUESTION_LIST.FAIL,
  payload: err
});
