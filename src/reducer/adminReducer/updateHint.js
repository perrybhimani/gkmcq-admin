import { UPDATE_HINT } from '../../constants';

const initialState = {
  data: null,
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case UPDATE_HINT.LOAD:
      return {
        ...state,
        loading: true
      };
    case UPDATE_HINT.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case UPDATE_HINT.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
