import { stringify } from 'qs';
import { message } from 'antd';
import { fakeAccountLogin, getFakeCaptcha, fakeAccountLogOut } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import { hashHistory, routerRedux, bowerHistory } from 'dva/router';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    username: '',
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      // Login successfully
      if (response.code === 200) {
        // hashHistory.push('/form/order-list')
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
        yield put(routerRedux.replace('/form/order-list'));

        // routerRedux.push('/form/order-list');
        // reloadAuthorized();
        // const urlParams = new URL(window.location.href);
        // const params = getPageQuery();
        // let { redirect } = params;
        // if (redirect) {
        //   const redirectUrlParams = new URL(redirect);
        //   if (redirectUrlParams.origin === urlParams.origin) {
        //     redirect = redirect.substr(urlParams.origin.length);
        //     if (redirect.startsWith('/#')) {
        //       redirect = redirect.substr(2);
        //     }
        //   } else {
        //     window.location.href = redirect;
        //     return;
        //   }
        // }
        // yield put(routerRedux.replace(redirect || '/'));
      } else {
        message.error(response.message);
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put, call }) {
      const response = yield call(fakeAccountLogOut);
      yield put({
        type: 'changeLoginStatus',
        payload: {
          data: '',
        },
      });
      yield put(routerRedux.push('/user/login'));
      // yield put({
      //   type: 'changeLoginStatus',
      //   payload: {
      //     status: false,
      //     currentAuthority: 'guest',
      //   },
      // });
      // reloadAuthorized();
      // yield put(
      //   routerRedux.push({
      //     pathname: '/user/login',
      //     search: stringify({
      //       redirect: window.location.href,
      //     }),
      //   })
      // );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.data);
      return {
        ...state,
        // status: payload.status,
        // type: payload.type,
        username: payload.data,
      };
    },
  },
};
