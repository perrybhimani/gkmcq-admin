import { TOPIC_LIST } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case TOPIC_LIST.LOAD:
      return {
        ...state,
        loading: true
      };
    case TOPIC_LIST.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case TOPIC_LIST.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
