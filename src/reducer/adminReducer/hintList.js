import { HINT_LIST } from '../../constants';

const initialState = {
  data: {},
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case HINT_LIST.LOAD:
      return {
        ...state,
        loading: true
      };
    case HINT_LIST.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case HINT_LIST.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
