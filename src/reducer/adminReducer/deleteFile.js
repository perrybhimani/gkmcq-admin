import { DELETE_FILE } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case DELETE_FILE.LOAD:
      return {
        ...state,
        loading: true
      };
    case DELETE_FILE.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case DELETE_FILE.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
