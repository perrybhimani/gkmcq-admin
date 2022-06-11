import { DELETE_TOPIC } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case DELETE_TOPIC.LOAD:
      return {
        ...state,
        loading: true
      };
    case DELETE_TOPIC.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case DELETE_TOPIC.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
