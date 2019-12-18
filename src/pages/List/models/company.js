import { queryCompany, downloadCompany } from '@/services/api';
import {
  message,
} from 'antd';

export default {
  namespace: 'company',
  state: {
    data: {
      companyList: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryCompany, payload);
      if (response && response.code === 200) {
        yield put({ type: 'save', payload: { companyList: response.data } });
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
    *fetchDownload({ payload, callback }, { call, put }) {
      const response = yield call(downloadCompany, payload);
      // if (response && response.code === 200) {
      //   if (callback) callback();
      // } else {
      //   message.error('下载订单列表失败');
      // }
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
