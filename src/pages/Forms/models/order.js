import { queryOrder, removeOrder, addOrder, updateOrder, queryOrderDetail, queryOrderCondition, downloadOrder, downloadBill } from '@/services/api';
import {
  message,
} from 'antd';

export default {
  namespace: 'order',

  state: {
    orderList: [],
    orderDetail: {},
    pagination: {},
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryOrder, payload);
      if (response && response.code === 200) {
        yield put({ type: 'save', payload: { orderList: response.data } });
        if (callback) callback();
      } else {
        message.error('查询订单列表失败');
      }
    },
    *fetchOrderCondition({ payload, callback }, { call, put }) {
      const response = yield call(queryOrderCondition, payload);
      if (response && response.code === 200) {
        yield put({ type: 'save', payload: { orderList: response.data.payload } });
        if (callback) callback();
      } else {
        message.error('查询订单列表失败');
      }
    },

    *fetchDownload({ payload, callback }, { call, put }) {
      const response = yield call(downloadOrder, payload);
      // if (response && response.code === 200) {
      //   if (callback) callback();
      // } else {
      //   message.error('下载订单列表失败');
      // }
    },

    *fetchDownloadBill({ payload, callback }, { call, put }) {
      const response = yield call(downloadBill, payload);
      // if (response && response.code === 200) {
      //   if (callback) callback();
      // } else {
      //   message.error('下载订单列表失败');
      // }
    },

    *fetchDetail({ payload, callback }, { call, put }) {
      const response = yield call(queryOrderDetail, payload);
      if (response && response.code === 200) {
        yield put({ type: 'save', payload: { orderDetail: response.data } });
        if (callback) callback();
      } else {
        message.error('查询订单详情失败');
      }
    },
    // *fetchQueryOrder({ payload, callback }, { call, put }) {
    //   const response = yield call(downloadOrder, payload);
    //   if (response && response.code === 200) {
    //     yield put({ type: 'save', payload: { orderDetail: response.data } });
    //     if (callback) callback();
    //   } else {
    //     message.error('查询订单列表失败');
    //   }
    // },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addOrder, payload);
      if (response && response.code === 200) {
        if (callback) callback();
      } else {
        message.error('添加订单失败');
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeOrder, payload);
      if (response && response.code === 200) {
        if (callback) callback();
      } else {
        message.error('删除订单失败');
      }
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateOrder, payload);
      if (response && response.code === 200) {
        if (callback) callback();
      } else {
        message.error('更新订单失败');
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
