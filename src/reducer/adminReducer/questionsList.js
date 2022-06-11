import { QUESTION_LIST } from '../../constants';

const initialState = {
  data: [],
  loading: false,
  error: {}
};

const questionList = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case QUESTION_LIST.LOAD:
      return { ...state, loading: true };
    case QUESTION_LIST.SUCCESS:
      return { ...state, data: payload, loading: false };
    case QUESTION_LIST.FAIL:
      return { ...state, loading: false, error: payload };
    default:
      return state;
  }
};

export default questionList;
