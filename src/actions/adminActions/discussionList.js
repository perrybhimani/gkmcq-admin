import axios from 'axios';
import { DISCUSSION_LIST } from '../../constants';

export const fetchDiscussionList = (questionId, onError) => (dispatch) => {
  const token = localStorage.jwtToken;
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  dispatch(loadDiscussionList());

  axios
    .get(`/user/getDiscussions?questionId=${questionId}`, config)
    .then((res) => dispatch(setDiscussionList(res)))
    .catch((err) => {
      dispatch(errorDiscussionList(err.response));
      onError(err.response);
    });
};

export const loadDiscussionList = () => ({
  type: DISCUSSION_LIST.LOAD
});

export const setDiscussionList = (discussionList) => ({
  type: DISCUSSION_LIST.SUCCESS,
  payload: discussionList.data.data
});

export const errorDiscussionList = (error) => ({
  type: DISCUSSION_LIST.FAIL,
  payload: error
});
