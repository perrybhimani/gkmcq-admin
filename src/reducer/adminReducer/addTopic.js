import { ADD_TOPIC } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case ADD_TOPIC.LOAD:
      return {
        ...state,
        loading: true
      };
    case ADD_TOPIC.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case ADD_TOPIC.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
