import axios from 'axios';
import { DELETE_DISCUSS } from '../../constants';

export const deleteDiscussion = (cID, setDeleteDialog, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDeleteFeedback());
  axios
    .delete(`/admin/deleteFeedback/${cID}`, config)
    .then((res) => {
      dispatch(setDeleteFeedback(res));
      setDeleteDialog(false);
    })
    .catch((err) => {
      dispatch(errorDeleteFeedback(err.response));
      onError(err.response);
    });
};

export const loadDeleteFeedback = () => ({
  type: DELETE_DISCUSS.LOAD
});

export const setDeleteFeedback = (data) => ({
  type: DELETE_DISCUSS.SUCCESS,
  payload: data
});

export const errorDeleteFeedback = (error) => ({
  type: DELETE_DISCUSS.FAIL,
  payload: error
});
