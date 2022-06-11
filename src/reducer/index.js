import { combineReducers } from 'redux';

import adminLogin from './adminReducer/adminLogin';
import listUser from './adminReducer/userList';
import listTopic from './adminReducer/topicList';
import listHint from './adminReducer/hintList';
import listDiscussion from './adminReducer/discussionList';
import deleteUser from './adminReducer/deleteUser';
import deleteTopic from './adminReducer/deleteTopic';
import deleteHint from './adminReducer/deleteHint';
import deleteDiscussion from './adminReducer/deleteDiscussion';
import deleteFile from './adminReducer/deleteFile';
import addTopic from './adminReducer/addTopic';
import uploadFile from './adminReducer/uploadFile';
import updateTopic from './adminReducer/updateTopic';
import updateHint from './adminReducer/updateHint';
import questionList from './adminReducer/questionsList';
import questionDelete from './adminReducer/deleteQuestion';
import addQuestion from './adminReducer/addQuestion';
import getQuestion from './adminReducer/getQuestionById';
import updateQuestion from './adminReducer/updateQuestion';
import addHint from './adminReducer/addHint';

export default combineReducers({
  adminData: adminLogin,
  userListData: listUser,
  deleteUserData: deleteUser,

  topicListData: listTopic,
  deleteTopicData: deleteTopic,
  addTopicData: addTopic,
  updateTopicData: updateTopic,

  addQuestionData: addQuestion,
  questionListData: questionList,
  deleteQuestionData: questionDelete,
  getQuestionData: getQuestion,
  updateQuestionData: updateQuestion,

  uploadFileData: uploadFile,
  deleteFileData: deleteFile,

  discussionListData: listDiscussion,
  deleteDiscussionData: deleteDiscussion,

  hintListData: listHint,
  addHintData: addHint,
  deleteHintData: deleteHint,
  updateHintData: updateHint
});
