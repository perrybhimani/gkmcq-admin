import axios from 'axios';
import { UPLOAD_FILE } from '../../constants';

export const uploadFile = (data, onError, type, fileIndex, promptIndex) => (dispatch) => {
  const bodyFormData = new FormData();
  bodyFormData.append('file', data.files);
  const token = localStorage.jwtToken;
  dispatch(addUploadFile());
  axios({
    method: 'post',
    url: `/admin/uploadFile`,
    data: bodyFormData,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      dispatch(setUploadFile(res, type, fileIndex, promptIndex));
    })
    .catch((err) => {
      dispatch(errorUploadFile(err.response));
      onError(err.response);
    });
};

export const addUploadFile = () => ({
  type: UPLOAD_FILE.LOAD
});

export const setUploadFile = (data, type, fileIndex, promptIndex) => ({
  type: UPLOAD_FILE.SUCCESS,
  payload: { file: data.data.data, type, fileIndex, promptIndex }
});

export const errorUploadFile = (error) => ({
  type: UPLOAD_FILE.FAIL,
  payload: error
});

export const clearUploadFile = () => ({
  type: UPLOAD_FILE.CLEAR
});
