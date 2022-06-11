import { ADD_HINT } from '../../constants';

const initialState = {
  data: null,
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case ADD_HINT.LOAD:
      return {
        ...state,
        loading: true
      };
    case ADD_HINT.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case ADD_HINT.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
