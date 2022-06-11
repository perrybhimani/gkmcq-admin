import { ADMIN_LOGIN } from '../../constants';

const initialState = {
  admin: {},
  loading: false,
  error: {}
};

export default function (state = initialState, { type, payload } = {}) {
  switch (type) {
    case ADMIN_LOGIN.SUCCESS:
      return {
        ...state,
        admin: payload,
        loading: false,
        error: {}
      };
    case ADMIN_LOGIN.FAIL:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case ADMIN_LOGIN.LOAD:
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
}
