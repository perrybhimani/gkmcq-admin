import { GET_QUESTION } from '../../constants';

const initialState = {
  data: null,
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case GET_QUESTION.LOAD:
      return {
        ...state,
        loading: true
      };
    case GET_QUESTION.SUCCESS:
      return {
        ...state,
        data: payload,
        loading: false
      };
    case GET_QUESTION.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}
