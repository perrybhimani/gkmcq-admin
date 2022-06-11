import { UPDATE_QUESTION } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case UPDATE_QUESTION.LOAD:
      return {
        ...state,
        loading: true
      };
    case UPDATE_QUESTION.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case UPDATE_QUESTION.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
