import axios from 'axios';
import { HINT_LIST } from '../../constants';

export const fetchHintList = (qId, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadTopicList());

  axios
    .get(`/admin/listHints/${qId}`, config)
    .then((res) => dispatch(setHintList(res)))
    .catch((err) => {
      dispatch(errorHintList(err.response));
      onError(err.response);
    });
};

export const loadTopicList = () => ({
  type: HINT_LIST.LOAD
});

export const setHintList = (hintList) => ({
  type: HINT_LIST.SUCCESS,
  payload: hintList.data.data
});

export const errorHintList = (error) => ({
  type: HINT_LIST.FAIL,
  payload: error
});
