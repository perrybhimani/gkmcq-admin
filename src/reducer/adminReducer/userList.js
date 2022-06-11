import { USER_LIST } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case USER_LIST.LOAD:
      return {
        ...state,
        loading: true
      };
    case USER_LIST.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case USER_LIST.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
