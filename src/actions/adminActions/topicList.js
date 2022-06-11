import axios from 'axios';
import { TOPIC_LIST } from '../../constants';

export const fetchTopicList = (onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadTopicList());

  axios
    .get('/admin/listTopics', config)
    .then((res) => dispatch(setTopicList(res)))
    .catch((err) => {
      dispatch(errorTopicList(err.response));
      onError(err.response);
    });
};

export const loadTopicList = () => ({
  type: TOPIC_LIST.LOAD
});

export const setTopicList = (topicList) => ({
  type: TOPIC_LIST.SUCCESS,
  payload: topicList.data.data
});

export const errorTopicList = (error) => ({
  type: TOPIC_LIST.FAIL,
  payload: error
});
