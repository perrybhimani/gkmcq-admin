import { DELETE_DISCUSS } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case DELETE_DISCUSS.LOAD:
      return {
        ...state,
        loading: true
      };
    case DELETE_DISCUSS.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case DELETE_DISCUSS.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
