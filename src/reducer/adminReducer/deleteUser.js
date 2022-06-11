import { DELETE_USER } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case DELETE_USER.LOAD:
      return {
        ...state,
        loading: true
      };
    case DELETE_USER.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case DELETE_USER.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
