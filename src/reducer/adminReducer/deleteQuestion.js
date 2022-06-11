import { DELETE_QUESTION } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

const questionDelete = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case DELETE_QUESTION.LOAD:
      return { ...state, loading: true };
    case DELETE_QUESTION.SUCCESS:
      return { ...state, loading: false, data: payload };
    case DELETE_QUESTION.FAIL:
      return { ...state, loading: false, error: payload };
    default:
      return state;
  }
};

export default questionDelete;
