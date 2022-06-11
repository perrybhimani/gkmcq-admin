import axios from 'axios';
import { DELETE_TOPIC } from '../../constants';

export const deleteTopic = (tID, setDeleteDialog, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDeleteTopic());
  axios
    .delete(`/admin/deleteTopic/${tID}`, config)
    .then((res) => {
      dispatch(setDeleteTopic(res));
      setDeleteDialog(false);
    })
    .catch((err) => {
      dispatch(errorDeleteTopic(err.response));
      onError(err.response);
    });
};

export const loadDeleteTopic = () => ({
  type: DELETE_TOPIC.LOAD
});

export const setDeleteTopic = (data) => ({
  type: DELETE_TOPIC.SUCCESS,
  payload: data
});

export const errorDeleteTopic = (error) => ({
  type: DELETE_TOPIC.FAIL,
  payload: error
});
