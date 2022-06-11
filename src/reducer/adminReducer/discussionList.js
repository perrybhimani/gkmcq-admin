import { DISCUSSION_LIST } from '../../constants';

const initialState = {
  data: null,
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case DISCUSSION_LIST.LOAD:
      return {
        ...state,
        loading: true
      };
    case DISCUSSION_LIST.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case DISCUSSION_LIST.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
