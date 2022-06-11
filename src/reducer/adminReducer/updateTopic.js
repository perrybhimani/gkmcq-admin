import { UPDATE_TOPIC } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case UPDATE_TOPIC.LOAD:
      return {
        ...state,
        loading: true
      };
    case UPDATE_TOPIC.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case UPDATE_TOPIC.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
