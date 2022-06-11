import { ADD_QUESTION } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case ADD_QUESTION.LOAD:
      return {
        ...state,
        loading: true
      };
    case ADD_QUESTION.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case ADD_QUESTION.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
