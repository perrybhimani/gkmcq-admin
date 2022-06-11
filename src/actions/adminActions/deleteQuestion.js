import axios from 'axios';
import { DELETE_QUESTION } from '../../constants';

export const deleteQuestion = (delID, setDeleteDialog, onError) => (dispatch) => {
  const token = localStorage.getItem('jwtToken');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDelQuestion());
  axios
    .delete(`/admin/deleteQuestion/${delID}`, config)
    .then((res) => {
      dispatch(successDelQuestion(res));
      setDeleteDialog(false);
    })
    .catch((err) => {
      dispatch(failDelQuestion(err));
      onError(err.response);
    });
};

export const loadDelQuestion = () => ({
  type: DELETE_QUESTION.LOAD
});

export const successDelQuestion = (questions) => ({
  type: DELETE_QUESTION.SUCCESS,
  payload: questions
});

export const failDelQuestion = (err) => ({
  type: DELETE_QUESTION.FAIL,
  payload: err
});
