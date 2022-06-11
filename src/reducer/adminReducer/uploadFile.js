import { UPLOAD_FILE } from '../../constants';

const initialState = {
  data: null,
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case UPLOAD_FILE.LOAD:
      return {
        ...state,
        loading: true
      };
    case UPLOAD_FILE.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case UPLOAD_FILE.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case UPLOAD_FILE.CLEAR:
      return {
        data: null,
        error: {},
        loading: false
      };
    default:
      return state;
  }
}
