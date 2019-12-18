import { queryCustomer } from '@/services/api';
import {
  message,
} from 'antd';

export default {
  namespace: 'customer',
  state: {
    data: {
      customerList: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryCustomer, payload);
      if (response && response.code === 200) {
        yield put({ type: 'save', payload: { customerList: response.data.payload } });
        if (callback) callback();
      } else {
        message.success('添加用户失败');
      }
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addUser, payload);
      if (response && response.code === 200) {
        if (callback) callback();
      } else {
        message.success('添加用户失败');
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeUser, payload);
      if (response && response.code === 200) {
        if (callback) callback();
      } else {
        message.success('删除用户失败');
      }
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateUser, payload);
      if (response && response.code === 200) {
        if (callback) callback();
      } else {
        message.success('更新用户失败');
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    // save(state, action) {
    //   return {
    //     ...state,
    //     data: action.payload,
    //   };
    // },
  },
};
